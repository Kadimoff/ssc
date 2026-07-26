"""LangGraph workflow for controlled planning, implementation, and review."""

from __future__ import annotations

import time
from contextlib import contextmanager
from datetime import UTC, datetime
from pathlib import Path
from typing import Callable, Iterator, Literal, TypeVar

from langgraph.graph import END, START, StateGraph
from langgraph.types import interrupt

from ai_council.adapters.claude_glm import ClaudeGlmAdapter
from ai_council.adapters.codex import CodexAdapter
from ai_council.audit import AuditLog
from ai_council.config import CouncilConfig
from ai_council.crews.deep_review import DeepReviewCrew
from ai_council.progress import (
    STAGE_LABELS,
    ProgressCallback,
    ProgressEvent,
    is_transient_network_error,
)
from ai_council.safety import (
    assert_snapshot_safe,
    capture_snapshot,
    full_diff,
    workspace_summary,
)
from ai_council.schemas import CouncilState, SafetySnapshot
from ai_council.verification import verify_project


T = TypeVar("T")


class CouncilGraph:
    def __init__(
        self,
        *,
        repo_root: Path,
        runtime_dir: Path,
        config: CouncilConfig,
        checkpointer: object,
        audit: AuditLog,
        progress: ProgressCallback | None = None,
    ):
        self.repo_root = repo_root
        self.runtime_dir = runtime_dir
        self.config = config
        self.audit = audit
        self.progress = progress
        self.codex = CodexAdapter(repo_root, runtime_dir, config)
        self.claude = ClaudeGlmAdapter(repo_root, config)
        self.crew = DeepReviewCrew(repo_root, config)
        self.graph = self._build().compile(checkpointer=checkpointer)

    def _build(self) -> StateGraph:
        builder = StateGraph(CouncilState)
        builder.add_node("snapshot", self.snapshot)
        builder.add_node("plan", self.plan)
        builder.add_node("crew_review", self.crew_review)
        builder.add_node("await_approval", self.await_approval)
        builder.add_node("approval", self.approval)
        builder.add_node("implement", self.implement)
        builder.add_node("verify", self.verify)
        builder.add_node("review", self.review)
        builder.add_node("fix", self.fix)
        builder.add_node("finish", self.finish)

        builder.add_edge(START, "snapshot")
        builder.add_edge("snapshot", "plan")
        builder.add_conditional_edges(
            "plan", self.route_after_plan, {"crew": "crew_review", "approval": "await_approval"}
        )
        builder.add_edge("crew_review", "await_approval")
        builder.add_edge("await_approval", "approval")
        builder.add_conditional_edges(
            "approval", self.route_after_approval, {"implement": "implement", "finish": "finish"}
        )
        builder.add_edge("implement", "verify")
        builder.add_edge("verify", "review")
        builder.add_conditional_edges(
            "review", self.route_after_review, {"fix": "fix", "finish": "finish"}
        )
        builder.add_edge("fix", "verify")
        builder.add_edge("finish", END)
        return builder

    def snapshot(self, state: CouncilState) -> dict:
        with self._stage(state, "workspace"):
            runtime_relative = self.runtime_dir.relative_to(self.repo_root).as_posix()
            snapshot = capture_snapshot(
                self.repo_root, excluded_paths=(runtime_relative,)
            )
            self.audit.write(state["run_id"], "workspace_snapshotted")
        return {
            "safety_snapshot": snapshot.model_dump(),
            "status": "planning",
            "updated_at": _now(),
        }

    def plan(self, state: CouncilState) -> dict:
        with self._stage(state, "plan"):
            plan, result = self._read_only_network_retry(
                state,
                "plan",
                lambda: self.codex.plan(
                    state["task"], state["run_id"], dry_run=state.get("dry_run", False)
                ),
            )
            self.audit.write(
                state["run_id"], "codex_plan_completed", {"session_id": result.session_id}
            )
        return {"plan": plan.model_dump(), "updated_at": _now()}

    def crew_review(self, state: CouncilState) -> dict:
        with self._stage(state, "crew_review"):
            report = self._read_only_network_retry(
                state,
                "crew_review",
                lambda: self.crew.run(
                    task=state["task"],
                    plan=state["plan"],
                    dry_run=state.get("dry_run", False),
                ),
            )
            self.audit.write(state["run_id"], "crew_review_completed")
        return {"crew_report": report.model_dump(), "updated_at": _now()}

    def await_approval(self, state: CouncilState) -> dict:
        self.audit.write(state["run_id"], "awaiting_approval")
        self._emit(state["run_id"], "approval", "waiting")
        return {"status": "awaiting_approval", "updated_at": _now()}

    def approval(self, state: CouncilState) -> dict:
        decision = interrupt(
            {
                "kind": "plan_approval",
                "run_id": state["run_id"],
                "task": state["task"],
                "plan": state["plan"],
                "crew_report": state.get("crew_report"),
            }
        )
        approved = bool(decision.get("approved")) if isinstance(decision, dict) else False
        approval = decision if isinstance(decision, dict) else {"approved": False}
        self.audit.write(state["run_id"], "plan_decision", {"approved": approved})
        return {
            "approval": approval,
            "status": "implementing" if approved else "rejected",
            "updated_at": _now(),
        }

    def implement(self, state: CouncilState) -> dict:
        with self._stage(state, "implementation"):
            result = self.codex.implement(
                task=state["task"],
                plan=state["plan"],
                crew_report=state.get("crew_report"),
                run_id=state["run_id"],
                dry_run=state.get("dry_run", False),
            )
            if not result.ok:
                raise RuntimeError(result.error or "Codex implementation failed")
            self._assert_safe(state)
            self.audit.write(
                state["run_id"], "implementation_completed", {"session_id": result.session_id}
            )
        return {
            "implementation_result": result.model_dump(exclude={"events"}),
            "codex_session_id": result.session_id,
            "status": "verifying",
            "updated_at": _now(),
        }

    def verify(self, state: CouncilState) -> dict:
        with self._stage(state, "verification"):
            report = verify_project(
                self.repo_root, self.config, dry_run=state.get("dry_run", False)
            )
            self._assert_safe(state)
            self.audit.write(state["run_id"], "verification_completed", {"ok": report.ok})
        return {
            "verification": report.model_dump(),
            "status": "reviewing",
            "updated_at": _now(),
        }

    def review(self, state: CouncilState) -> dict:
        with self._stage(state, "glm_review"):
            def run_review():
                verdict, result = self.claude.review(
                    task=state["task"],
                    plan=state["plan"],
                    verification=state["verification"],
                    workspace_summary=workspace_summary(self.repo_root),
                    diff=full_diff(self.repo_root),
                    dry_run=state.get("dry_run", False),
                )
                if not result.ok:
                    raise RuntimeError(result.error or "Claude/GLM review failed")
                return verdict, result

            verdict, result = self._read_only_network_retry(state, "glm_review", run_review)
            self.audit.write(
                state["run_id"],
                "glm_review_completed",
                {"approved": verdict.approved, "session_id": result.session_id},
            )
        return {"review": verdict.model_dump(), "updated_at": _now()}

    def fix(self, state: CouncilState) -> dict:
        next_round = state.get("review_round", 0) + 1
        with self._stage(state, "correction", {"round": next_round}):
            result = self.codex.fix(
                task=state["task"],
                review=state["review"],
                verification=state["verification"],
                run_id=state["run_id"],
                session_id=state.get("codex_session_id"),
                review_round=next_round,
                dry_run=state.get("dry_run", False),
            )
            if not result.ok:
                raise RuntimeError(result.error or "Codex correction failed")
            self._assert_safe(state)
            self.audit.write(state["run_id"], "correction_completed", {"round": next_round})
        return {
            "implementation_result": result.model_dump(exclude={"events"}),
            "codex_session_id": result.session_id or state.get("codex_session_id"),
            "review_round": next_round,
            "status": "verifying",
            "updated_at": _now(),
        }

    def finish(self, state: CouncilState) -> dict:
        with self._stage(state, "finish"):
            if state.get("status") == "rejected":
                report = "Plan was rejected; no implementation was performed."
                status = "rejected"
            else:
                verification_ok = bool((state.get("verification") or {}).get("ok"))
                review = state.get("review") or {}
                review_ok = bool(review.get("approved"))
                scope_change = bool(review.get("requires_scope_change"))
                if verification_ok and review_ok:
                    status = "completed"
                    report = "Implementation, verification, and independent review completed successfully."
                else:
                    status = "blocked"
                    reason = "scope change required" if scope_change else "review limit reached"
                    report = f"Council stopped safely: {reason}."
            self.audit.write(state["run_id"], "run_finished", {"status": status})
        return {"status": status, "final_report": report, "updated_at": _now()}

    def route_after_plan(self, state: CouncilState) -> Literal["crew", "approval"]:
        return "crew" if state.get("deep_review", False) else "approval"

    def route_after_approval(self, state: CouncilState) -> Literal["implement", "finish"]:
        return "implement" if state.get("status") == "implementing" else "finish"

    def route_after_review(self, state: CouncilState) -> Literal["fix", "finish"]:
        verification_ok = bool((state.get("verification") or {}).get("ok"))
        review = state.get("review") or {}
        if verification_ok and bool(review.get("approved")):
            return "finish"
        if bool(review.get("requires_scope_change")):
            return "finish"
        if state.get("review_round", 0) >= self.config.limits.max_review_rounds:
            return "finish"
        return "fix"

    def _assert_safe(self, state: CouncilState) -> None:
        snapshot = SafetySnapshot.model_validate(state["safety_snapshot"])
        assert_snapshot_safe(self.repo_root, snapshot)

    @contextmanager
    def _stage(
        self, state: CouncilState, stage: str, details: dict | None = None
    ) -> Iterator[None]:
        self._emit(state["run_id"], stage, "started", details)
        try:
            yield
        except Exception as exc:
            self._emit(state["run_id"], stage, "failed", {"error": str(exc)[:2_000]})
            raise
        else:
            self._emit(state["run_id"], stage, "completed", details)

    def _read_only_network_retry(
        self, state: CouncilState, stage: str, operation: Callable[[], T]
    ) -> T:
        try:
            return operation()
        except Exception as exc:
            if not is_transient_network_error(exc):
                raise
            self._emit(
                state["run_id"], stage, "retrying", {"reason": "transient_network_error"}
            )
            time.sleep(2)
            return operation()

    def _emit(
        self,
        run_id: str,
        stage: str,
        phase: Literal["started", "completed", "waiting", "retrying", "failed"],
        details: dict | None = None,
    ) -> None:
        event = ProgressEvent(
            run_id=run_id,
            stage=stage,
            phase=phase,
            label=STAGE_LABELS.get(stage, stage),
            details=details or {},
        )
        self.audit.write(
            run_id,
            f"stage_{phase}",
            {"stage": stage, "label": event.label, **event.details},
        )
        if self.progress:
            self.progress(event)


def _now() -> str:
    return datetime.now(UTC).isoformat()
