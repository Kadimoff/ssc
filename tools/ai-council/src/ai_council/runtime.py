"""Persistent council runtime backed by LangGraph's SQLite checkpointer."""

from __future__ import annotations

import sqlite3
from datetime import UTC, datetime
from pathlib import Path
from typing import Any
from uuid import uuid4

from langgraph.checkpoint.sqlite import SqliteSaver
from langgraph.types import Command

from ai_council.audit import AuditLog
from ai_council.config import CouncilConfig, find_repo_root, load_config
from ai_council.graph import CouncilGraph
from ai_council.progress import ProgressCallback


class CouncilRuntime:
    def __init__(
        self,
        repo_root: Path | None = None,
        progress: ProgressCallback | None = None,
    ):
        self.repo_root = (repo_root or find_repo_root()).resolve()
        self.config: CouncilConfig = load_config(self.repo_root)
        self.runtime_dir = self.repo_root / self.config.runtime.directory
        self.runtime_dir.mkdir(parents=True, exist_ok=True)
        self.connection = sqlite3.connect(
            self.runtime_dir / self.config.runtime.database,
            check_same_thread=False,
        )
        self.checkpointer = SqliteSaver(self.connection)
        self.audit = AuditLog(self.runtime_dir / self.config.runtime.audit_log)
        self.council = CouncilGraph(
            repo_root=self.repo_root,
            runtime_dir=self.runtime_dir,
            config=self.config,
            checkpointer=self.checkpointer,
            audit=self.audit,
            progress=progress,
        )

    def __enter__(self) -> "CouncilRuntime":
        return self

    def __exit__(self, *_args: object) -> None:
        self.close()

    def close(self) -> None:
        self.connection.close()

    def start(self, task: str, *, deep_review: bool, dry_run: bool) -> tuple[str, dict]:
        run_id = str(uuid4())
        now = datetime.now(UTC).isoformat()
        initial = {
            "run_id": run_id,
            "task": task,
            "deep_review": deep_review,
            "dry_run": dry_run,
            "status": "planning",
            "created_at": now,
            "updated_at": now,
            "crew_report": None,
            "approval": None,
            "codex_session_id": None,
            "implementation_result": None,
            "verification": None,
            "review": None,
            "review_round": 0,
            "final_report": None,
            "error": None,
        }
        self.audit.write(run_id, "run_started", {"deep_review": deep_review, "dry_run": dry_run})
        try:
            self.council.graph.invoke(initial, self._thread_config(run_id))
        except Exception as exc:
            self.audit.write(run_id, "run_error", {"error": str(exc)})
            raise
        return run_id, self.state(run_id)

    def decide(self, run_id: str, *, approved: bool, reason: str = "") -> dict:
        snapshot = self.council.graph.get_state(self._thread_config(run_id))
        if "approval" not in snapshot.next:
            raise RuntimeError(f"Run {run_id} is not waiting for plan approval")
        command = Command(resume={"approved": approved, "reason": reason})
        try:
            self.council.graph.invoke(command, self._thread_config(run_id))
        except Exception as exc:
            self.audit.write(run_id, "run_error", {"error": str(exc)})
            raise
        return self.state(run_id)

    def resume(self, run_id: str) -> dict:
        snapshot = self.council.graph.get_state(self._thread_config(run_id))
        if not snapshot.values:
            raise RuntimeError(f"Unknown run: {run_id}")
        if "approval" in snapshot.next:
            raise RuntimeError("This run is waiting for approve or reject, not resume")
        if not snapshot.next:
            return dict(snapshot.values)
        try:
            self.council.graph.invoke(None, self._thread_config(run_id))
        except Exception as exc:
            self.audit.write(run_id, "run_error", {"error": str(exc)})
            raise
        return self.state(run_id)

    def state(self, run_id: str) -> dict:
        snapshot = self.council.graph.get_state(self._thread_config(run_id))
        if not snapshot.values:
            raise RuntimeError(f"Unknown run: {run_id}")
        value = dict(snapshot.values)
        value["next_nodes"] = list(snapshot.next)
        value["checkpoint_id"] = snapshot.config.get("configurable", {}).get("checkpoint_id")
        return value

    def history(self, run_id: str) -> list[dict[str, Any]]:
        snapshots = self.council.graph.get_state_history(self._thread_config(run_id))
        history: list[dict[str, Any]] = []
        for snapshot in snapshots:
            values = snapshot.values or {}
            history.append(
                {
                    "checkpoint_id": snapshot.config.get("configurable", {}).get("checkpoint_id"),
                    "created_at": snapshot.created_at,
                    "status": values.get("status"),
                    "next_nodes": list(snapshot.next),
                    "step": snapshot.metadata.get("step") if snapshot.metadata else None,
                }
            )
        return history

    @staticmethod
    def _thread_config(run_id: str) -> dict:
        return {"configurable": {"thread_id": run_id}}
