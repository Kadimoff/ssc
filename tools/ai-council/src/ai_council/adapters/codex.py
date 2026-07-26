"""Non-interactive Codex CLI adapter."""

from __future__ import annotations

import json
import re
from pathlib import Path
from typing import Any

from ai_council.config import CouncilConfig
from ai_council.json_utils import extract_json
from ai_council.process import ProcessResult, run_process
from ai_council.schemas import AgentRunResult, CodexPlan


class CodexAdapter:
    def __init__(self, repo_root: Path, runtime_dir: Path, config: CouncilConfig):
        self.repo_root = repo_root
        self.runtime_dir = runtime_dir
        self.config = config

    def plan(self, task: str, run_id: str, *, dry_run: bool = False) -> tuple[CodexPlan, AgentRunResult]:
        if dry_run:
            plan = CodexPlan(
                summary=f"Dry-run plan for: {task}",
                scope=["No files will be changed"],
                steps=[{"title": "Dry run", "details": "Exercise graph routing only"}],
                tests=["Mock verification"],
            )
            return plan, AgentRunResult(ok=True, text=plan.model_dump_json())

        run_dir = self._run_dir(run_id)
        schema_path = run_dir / "codex-plan.schema.json"
        output_path = run_dir / "codex-plan.json"
        schema_path.write_text(
            json.dumps(CodexPlan.model_json_schema(), ensure_ascii=False), encoding="utf-8"
        )
        prompt = f"""You are the planning engineer for a controlled multi-agent workflow.
Inspect the repository and produce an implementation plan for the task below.
Do not edit files, install dependencies, commit, or make external changes.
Respect CLAUDE.md and repository conventions. Return only the requested structured output.

TASK:
{task}
"""
        args = [
            self.config.codex.executable,
            "exec",
            "--json",
            "--sandbox",
            self.config.codex.planning_sandbox,
            "--cd",
            str(self.repo_root),
            "--output-schema",
            str(schema_path),
            "--output-last-message",
            str(output_path),
            "-",
        ]
        last_error: Exception | None = None
        for attempt in range(2):
            attempt_prompt = prompt
            if attempt:
                attempt_prompt += (
                    "\nYour previous response was not valid for the required JSON schema. "
                    "Return a corrected structured response only."
                )
            result = self._run(args, attempt_prompt)
            agent = self._agent_result(result, output_path)
            if not agent.ok:
                raise RuntimeError(agent.error or "Codex planning failed")
            try:
                plan = CodexPlan.model_validate(extract_json(agent.text))
                return plan, agent
            except Exception as exc:
                last_error = exc
        raise RuntimeError(f"Codex returned an invalid plan twice: {last_error}")

    def implement(
        self,
        *,
        task: str,
        plan: dict,
        crew_report: dict | None,
        run_id: str,
        dry_run: bool = False,
    ) -> AgentRunResult:
        if dry_run:
            return AgentRunResult(ok=True, text="Dry-run implementation skipped")
        run_dir = self._run_dir(run_id)
        output_path = run_dir / "codex-implementation.txt"
        prompt = f"""Implement the approved task in the current repository.
You are the only writer in this workflow. Make the smallest scoped changes that satisfy the plan.
Do not modify pre-existing untracked or dirty user files unless the task explicitly names them.
Do not commit, push, reset Git history, bypass safeguards, or perform destructive operations.
Run focused checks when useful; the coordinator will run the full verification suite afterward.

TASK:
{task}

APPROVED PLAN:
{json.dumps(plan, ensure_ascii=False, indent=2)}

OPTIONAL EXPERT ADVICE:
{json.dumps(crew_report, ensure_ascii=False, indent=2) if crew_report else "None"}
"""
        result = self._run(
            [
                self.config.codex.executable,
                "exec",
                "--json",
                "--sandbox",
                self.config.codex.writing_sandbox,
                "--cd",
                str(self.repo_root),
                "--output-last-message",
                str(output_path),
                "-",
            ],
            prompt,
        )
        return self._agent_result(result, output_path)

    def fix(
        self,
        *,
        task: str,
        review: dict,
        verification: dict,
        run_id: str,
        session_id: str | None,
        review_round: int,
        dry_run: bool = False,
    ) -> AgentRunResult:
        if dry_run:
            return AgentRunResult(ok=True, text="Dry-run fix skipped", session_id=session_id)
        run_dir = self._run_dir(run_id)
        output_path = run_dir / f"codex-fix-{review_round}.txt"
        prompt = f"""Correct the verified issues from the review for the original task.
Remain inside the approved scope. Do not touch pre-existing user work, commit, push, reset,
or perform destructive operations. If a requested correction requires expanding scope, stop and explain.

ORIGINAL TASK:
{task}

REVIEW:
{json.dumps(review, ensure_ascii=False, indent=2)}

VERIFICATION:
{json.dumps(verification, ensure_ascii=False, indent=2)}
"""
        if session_id:
            args = [
                self.config.codex.executable,
                "exec",
                "resume",
                "--json",
                "--config",
                f'sandbox_mode="{self.config.codex.writing_sandbox}"',
                "--output-last-message",
                str(output_path),
                session_id,
                "-",
            ]
        else:
            args = [
                self.config.codex.executable,
                "exec",
                "--json",
                "--sandbox",
                self.config.codex.writing_sandbox,
                "--cd",
                str(self.repo_root),
                "--output-last-message",
                str(output_path),
                "-",
            ]
        return self._agent_result(self._run(args, prompt), output_path)

    def _run(self, args: list[str], prompt: str) -> ProcessResult:
        return run_process(
            args,
            cwd=self.repo_root,
            input_text=prompt,
            timeout_seconds=self.config.limits.agent_timeout_seconds,
            max_output_chars=self.config.limits.max_output_chars,
        )

    def _agent_result(self, result: ProcessResult, output_path: Path) -> AgentRunResult:
        events = _jsonl_events(result.stdout)
        text = output_path.read_text(encoding="utf-8") if output_path.exists() else ""
        error = None
        if not result.ok:
            reason = "timed out" if result.timed_out else f"exited with {result.exit_code}"
            error = f"Codex {reason}: {result.stderr or result.stdout}"
        return AgentRunResult(
            ok=result.ok,
            text=text,
            session_id=_find_session_id(events),
            error=error,
            exit_code=result.exit_code,
            events=events[-100:],
        )

    def _run_dir(self, run_id: str) -> Path:
        path = self.runtime_dir / "runs" / run_id
        path.mkdir(parents=True, exist_ok=True)
        return path


def _jsonl_events(output: str) -> list[dict]:
    events: list[dict] = []
    for line in output.splitlines():
        try:
            value = json.loads(line)
        except json.JSONDecodeError:
            continue
        if isinstance(value, dict):
            events.append(value)
    return events


def _find_session_id(events: list[dict]) -> str | None:
    uuid_pattern = re.compile(
        r"^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$"
    )

    def visit(value: Any, key: str = "") -> str | None:
        if isinstance(value, dict):
            for child_key, child in value.items():
                found = visit(child, child_key)
                if found:
                    return found
        elif isinstance(value, list):
            for child in value:
                found = visit(child, key)
                if found:
                    return found
        elif isinstance(value, str) and key in {
            "thread_id",
            "session_id",
            "conversation_id",
            "id",
        } and uuid_pattern.match(value):
            return value
        return None

    for event in events:
        found = visit(event)
        if found:
            return found
    return None
