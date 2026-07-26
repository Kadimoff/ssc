"""Claude Code CLI adapter, preserving the user's configured GLM provider."""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any

from ai_council.config import CouncilConfig
from ai_council.json_utils import extract_json
from ai_council.process import ProcessResult, run_process
from ai_council.schemas import AgentRunResult, ReviewFinding, ReviewVerdict


class ClaudeGlmAdapter:
    def __init__(self, repo_root: Path, config: CouncilConfig):
        self.repo_root = repo_root
        self.config = config

    def review(
        self,
        *,
        task: str,
        plan: dict,
        verification: dict,
        workspace_summary: str,
        diff: str,
        dry_run: bool = False,
    ) -> tuple[ReviewVerdict, AgentRunResult]:
        if dry_run:
            verdict = ReviewVerdict(approved=True, summary="Dry-run review approved")
            return verdict, AgentRunResult(ok=True, text=verdict.model_dump_json())

        prompt = f"""Act as an independent, read-only code reviewer. Do not edit files or execute
side-effecting commands. Review the repository changes against the task and approved plan.
Prioritize correctness, regressions, security, and missing tests. Report only actionable findings.
Return structured JSON matching the requested schema.

TASK:
{task}

APPROVED PLAN:
{json.dumps(plan, ensure_ascii=False, indent=2)}

VERIFICATION RESULTS:
{json.dumps(verification, ensure_ascii=False, indent=2)}

WORKSPACE SUMMARY:
{workspace_summary}

TRACKED DIFF (new untracked files may need repository inspection):
{diff}
"""
        schema = json.dumps(ReviewVerdict.model_json_schema(), ensure_ascii=False)
        last_error: Exception | None = None
        for attempt in range(2):
            attempt_prompt = prompt
            if attempt:
                attempt_prompt += (
                    "\nThe previous response was invalid. Return only a value matching the JSON schema."
                )
            result = self._run(
                attempt_prompt, schema=schema, max_turns=self.config.claude.max_turns
            )
            agent = self._agent_result(result)
            if not agent.ok:
                verdict = ReviewVerdict(
                    approved=False,
                    summary="Reviewer invocation failed",
                    findings=[
                        ReviewFinding(
                            severity="high",
                            title="Claude/GLM review failed",
                            details=agent.error or "Unknown reviewer error",
                        )
                    ],
                )
                return verdict, agent
            try:
                payload = _claude_payload(result.stdout)
                structured = payload.get("structured_output")
                if structured is None:
                    structured = extract_json(str(payload.get("result", agent.text)))
                return ReviewVerdict.model_validate(structured), agent
            except Exception as exc:
                last_error = exc
        verdict = ReviewVerdict(
            approved=False,
            summary="Reviewer returned invalid structured output twice",
            findings=[
                ReviewFinding(
                    severity="high",
                    title="Invalid reviewer output",
                    details=str(last_error),
                )
            ],
        )
        return verdict, agent

    def complete(self, messages: str, *, max_turns: int = 1) -> str:
        """Provide a text-only completion for CrewAI's custom LLM bridge."""
        result = self._run(messages, schema=None, max_turns=max_turns)
        if not result.ok:
            reason = "timed out" if result.timed_out else f"exited with {result.exit_code}"
            raise RuntimeError(f"Claude/GLM {reason}: {result.stderr or result.stdout}")
        payload = _claude_payload(result.stdout)
        value = payload.get("result")
        if not isinstance(value, str) or not value.strip():
            raise RuntimeError("Claude/GLM returned no text result")
        return value

    def _run(self, prompt: str, *, schema: str | None, max_turns: int) -> ProcessResult:
        args = [
            self.config.claude.executable,
            "--print",
            "--output-format",
            "json",
            "--permission-mode",
            self.config.claude.permission_mode,
            "--max-turns",
            str(max_turns),
        ]
        if schema:
            args.extend(["--json-schema", schema])
        return run_process(
            args,
            cwd=self.repo_root,
            input_text=prompt,
            timeout_seconds=self.config.limits.agent_timeout_seconds,
            max_output_chars=self.config.limits.max_output_chars,
        )

    def _agent_result(self, result: ProcessResult) -> AgentRunResult:
        error = None
        text = ""
        session_id = None
        if result.ok:
            try:
                payload = _claude_payload(result.stdout)
                text = str(payload.get("result") or payload.get("structured_output") or "")
                session_id = payload.get("session_id")
            except Exception as exc:
                error = f"Invalid Claude/GLM envelope: {exc}"
        else:
            reason = "timed out" if result.timed_out else f"exited with {result.exit_code}"
            error = f"Claude/GLM {reason}: {result.stderr or result.stdout}"
        return AgentRunResult(
            ok=result.ok and error is None,
            text=text,
            session_id=session_id if isinstance(session_id, str) else None,
            error=error,
            exit_code=result.exit_code,
        )


def _claude_payload(output: str) -> dict[str, Any]:
    value = extract_json(output)
    if not isinstance(value, dict):
        raise ValueError("Claude output envelope is not an object")
    return value
