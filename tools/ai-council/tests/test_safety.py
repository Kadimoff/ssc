import subprocess
from pathlib import Path

import pytest

from ai_council.safety import SafetyViolation, assert_snapshot_safe, capture_snapshot


def _git(repo: Path, *args: str) -> None:
    subprocess.run(["git", *args], cwd=repo, check=True, capture_output=True)


def test_preexisting_untracked_file_is_protected(tmp_path: Path) -> None:
    _git(tmp_path, "init")
    _git(tmp_path, "config", "user.email", "tests@example.com")
    _git(tmp_path, "config", "user.name", "Tests")
    (tmp_path / "tracked.txt").write_text("tracked", encoding="utf-8")
    _git(tmp_path, "add", "tracked.txt")
    _git(tmp_path, "commit", "-m", "initial")
    user_file = tmp_path / "user.txt"
    user_file.write_text("mine", encoding="utf-8")
    snapshot = capture_snapshot(tmp_path)

    user_file.write_text("changed", encoding="utf-8")

    with pytest.raises(SafetyViolation, match="user.txt"):
        assert_snapshot_safe(tmp_path, snapshot)

