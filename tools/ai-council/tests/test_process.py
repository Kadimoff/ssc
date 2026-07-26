import sys
from pathlib import Path

from ai_council.process import run_process


def test_process_runner_captures_output(tmp_path: Path) -> None:
    result = run_process(
        [sys.executable, "-c", "print('ok')"],
        cwd=tmp_path,
        timeout_seconds=10,
        max_output_chars=1000,
    )

    assert result.ok
    assert result.stdout.strip() == "ok"


def test_process_runner_reports_timeout(tmp_path: Path) -> None:
    result = run_process(
        [sys.executable, "-c", "import time; time.sleep(2)"],
        cwd=tmp_path,
        timeout_seconds=1,
        max_output_chars=1000,
    )

    assert result.timed_out
    assert result.exit_code == 124

