"""Small, bounded subprocess runner shared by agent adapters."""

from __future__ import annotations

import subprocess
from dataclasses import dataclass
from pathlib import Path
from typing import Sequence


@dataclass(frozen=True)
class ProcessResult:
    args: tuple[str, ...]
    exit_code: int
    stdout: str
    stderr: str
    timed_out: bool = False

    @property
    def ok(self) -> bool:
        return self.exit_code == 0 and not self.timed_out


def run_process(
    args: Sequence[str],
    *,
    cwd: Path,
    timeout_seconds: int,
    max_output_chars: int,
    input_text: str | None = None,
) -> ProcessResult:
    """Run a command without a shell and cap retained output."""
    normalized = tuple(str(value) for value in args)
    try:
        completed = subprocess.run(
            normalized,
            cwd=cwd,
            input=input_text,
            text=True,
            capture_output=True,
            timeout=timeout_seconds,
            check=False,
        )
        return ProcessResult(
            args=normalized,
            exit_code=completed.returncode,
            stdout=_tail(completed.stdout, max_output_chars),
            stderr=_tail(completed.stderr, max_output_chars),
        )
    except subprocess.TimeoutExpired as exc:
        return ProcessResult(
            args=normalized,
            exit_code=124,
            stdout=_tail(_as_text(exc.stdout), max_output_chars),
            stderr=_tail(_as_text(exc.stderr), max_output_chars),
            timed_out=True,
        )


def _as_text(value: str | bytes | None) -> str:
    if value is None:
        return ""
    if isinstance(value, bytes):
        return value.decode(errors="replace")
    return value


def _tail(value: str, limit: int) -> str:
    if len(value) <= limit:
        return value
    return f"[...output truncated...]\n{value[-limit:]}"

