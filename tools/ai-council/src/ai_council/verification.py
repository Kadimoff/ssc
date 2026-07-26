"""Deterministic project verification commands."""

from __future__ import annotations

import shlex
from pathlib import Path

from ai_council.config import CouncilConfig
from ai_council.process import run_process
from ai_council.schemas import VerificationCommandResult, VerificationReport


def verify_project(
    repo_root: Path, config: CouncilConfig, *, dry_run: bool = False
) -> VerificationReport:
    if dry_run:
        return VerificationReport(
            ok=True,
            commands=[
                VerificationCommandResult(
                    command="dry-run",
                    ok=True,
                    exit_code=0,
                    output="Verification commands were not executed",
                )
            ],
        )

    results: list[VerificationCommandResult] = []
    for command in config.verification.commands:
        args = shlex.split(command)
        if not args:
            continue
        process = run_process(
            args,
            cwd=repo_root,
            timeout_seconds=config.limits.agent_timeout_seconds,
            max_output_chars=config.limits.max_output_chars,
        )
        output = "\n".join(value for value in (process.stdout, process.stderr) if value)
        results.append(
            VerificationCommandResult(
                command=command,
                ok=process.ok,
                exit_code=process.exit_code,
                output=output,
            )
        )
    return VerificationReport(ok=all(item.ok for item in results), commands=results)

