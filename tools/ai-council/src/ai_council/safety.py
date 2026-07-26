"""Read-only workspace baselining and post-write safety checks."""

from __future__ import annotations

import hashlib
import subprocess
from pathlib import Path

from ai_council.schemas import SafetySnapshot


class SafetyViolation(RuntimeError):
    """Raised when an agent touches pre-existing user work or repository history."""


def capture_snapshot(
    repo_root: Path, *, excluded_paths: tuple[str, ...] = ()
) -> SafetySnapshot:
    head = _git(repo_root, "rev-parse", "HEAD").strip()
    status_entries = _status_entries(repo_root)
    protected: dict[str, str] = {}
    for entry in status_entries:
        path = _entry_path(entry)
        if not path:
            continue
        if any(path == prefix or path.startswith(f"{prefix}/") for prefix in excluded_paths):
            continue
        absolute = repo_root / path
        if absolute.is_file() or absolute.is_symlink():
            protected[path] = _fingerprint(absolute)
    return SafetySnapshot(
        head=head,
        protected_files=protected,
        initial_status=status_entries,
    )


def assert_snapshot_safe(repo_root: Path, snapshot: SafetySnapshot) -> None:
    violations: list[str] = []
    current_head = _git(repo_root, "rev-parse", "HEAD").strip()
    if current_head != snapshot.head:
        violations.append("Git HEAD changed during the agent run")

    for relative, expected_hash in snapshot.protected_files.items():
        path = repo_root / relative
        if not path.exists() and not path.is_symlink():
            violations.append(f"pre-existing user file was removed: {relative}")
            continue
        if _fingerprint(path) != expected_hash:
            violations.append(f"pre-existing user file was modified: {relative}")

    if violations:
        raise SafetyViolation("; ".join(violations))


def workspace_summary(repo_root: Path, limit: int = 30_000) -> str:
    status = _git(repo_root, "status", "--short", "--untracked-files=all")
    diff = _git(repo_root, "diff", "--no-ext-diff", "--stat")
    value = f"Git status:\n{status}\nDiff stat:\n{diff}".strip()
    return value[-limit:]


def full_diff(repo_root: Path, limit: int = 80_000) -> str:
    diff = _git(repo_root, "diff", "--no-ext-diff", "--no-color")
    return diff[-limit:]


def _status_entries(repo_root: Path) -> list[str]:
    raw = subprocess.run(
        ["git", "status", "--porcelain=v1", "-z", "--untracked-files=all"],
        cwd=repo_root,
        text=True,
        capture_output=True,
        check=True,
    ).stdout
    return [entry for entry in raw.split("\0") if entry]


def _entry_path(entry: str) -> str | None:
    if len(entry) < 4:
        return None
    value = entry[3:]
    if " -> " in value:
        value = value.split(" -> ", 1)[1]
    return value


def _fingerprint(path: Path) -> str:
    digest = hashlib.sha256()
    if path.is_symlink():
        digest.update(f"symlink:{path.readlink()}".encode())
        return digest.hexdigest()
    with path.open("rb") as handle:
        while chunk := handle.read(1024 * 1024):
            digest.update(chunk)
    return digest.hexdigest()


def _git(repo_root: Path, *args: str) -> str:
    completed = subprocess.run(
        ["git", *args],
        cwd=repo_root,
        text=True,
        capture_output=True,
        check=True,
    )
    return completed.stdout
