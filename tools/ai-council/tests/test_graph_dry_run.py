import subprocess
from datetime import UTC, datetime
from pathlib import Path

from langgraph.checkpoint.memory import InMemorySaver
from langgraph.types import Command

from ai_council.audit import AuditLog
from ai_council.config import CouncilConfig
from ai_council.graph import CouncilGraph
from ai_council.schemas import AgentRunResult, ReviewFinding, ReviewVerdict


def _git(repo: Path, *args: str) -> None:
    subprocess.run(["git", *args], cwd=repo, check=True, capture_output=True)


def test_deep_review_dry_run_stops_for_approval_and_completes(tmp_path: Path) -> None:
    _git(tmp_path, "init")
    _git(tmp_path, "config", "user.email", "tests@example.com")
    _git(tmp_path, "config", "user.name", "Tests")
    (tmp_path / "README.md").write_text("test", encoding="utf-8")
    _git(tmp_path, "add", "README.md")
    _git(tmp_path, "commit", "-m", "initial")
    runtime_dir = tmp_path / ".ai-council"
    config = CouncilConfig.model_validate({"verification": {"commands": ["true"]}})
    progress_events = []
    council = CouncilGraph(
        repo_root=tmp_path,
        runtime_dir=runtime_dir,
        config=config,
        checkpointer=InMemorySaver(),
        audit=AuditLog(runtime_dir / "audit.jsonl"),
        progress=progress_events.append,
    )
    run_id = "dry-run-test"
    thread = {"configurable": {"thread_id": run_id}}
    now = datetime.now(UTC).isoformat()
    state = {
        "run_id": run_id,
        "task": "Exercise the graph",
        "deep_review": True,
        "dry_run": True,
        "status": "planning",
        "created_at": now,
        "updated_at": now,
        "review_round": 0,
    }

    council.graph.invoke(state, thread)
    waiting = council.graph.get_state(thread)
    assert waiting.values["status"] == "awaiting_approval"
    assert waiting.values["crew_report"]["architecture"]
    assert waiting.next == ("approval",)

    council.graph.invoke(Command(resume={"approved": True, "reason": "test"}), thread)
    finished = council.graph.get_state(thread)
    assert finished.values["status"] == "completed"
    assert finished.values["verification"]["ok"] is True
    assert finished.values["review"]["approved"] is True
    assert finished.next == ()
    assert any(event.stage == "plan" and event.phase == "started" for event in progress_events)
    assert any(event.stage == "approval" and event.phase == "waiting" for event in progress_events)
    assert any(
        event.stage == "implementation" and event.phase == "completed"
        for event in progress_events
    )


def test_review_corrections_stop_at_configured_limit(tmp_path: Path, monkeypatch) -> None:
    _git(tmp_path, "init")
    _git(tmp_path, "config", "user.email", "tests@example.com")
    _git(tmp_path, "config", "user.name", "Tests")
    (tmp_path / "README.md").write_text("test", encoding="utf-8")
    _git(tmp_path, "add", "README.md")
    _git(tmp_path, "commit", "-m", "initial")
    runtime_dir = tmp_path / ".ai-council"
    config = CouncilConfig.model_validate(
        {"limits": {"max_review_rounds": 2}, "verification": {"commands": ["true"]}}
    )
    council = CouncilGraph(
        repo_root=tmp_path,
        runtime_dir=runtime_dir,
        config=config,
        checkpointer=InMemorySaver(),
        audit=AuditLog(runtime_dir / "audit.jsonl"),
    )
    verdict = ReviewVerdict(
        approved=False,
        summary="Changes requested",
        findings=[
            ReviewFinding(severity="medium", title="Test", details="Still unresolved")
        ],
    )
    monkeypatch.setattr(
        council.claude,
        "review",
        lambda **_kwargs: (verdict, AgentRunResult(ok=True, text=verdict.model_dump_json())),
    )
    run_id = "review-limit-test"
    thread = {"configurable": {"thread_id": run_id}}
    now = datetime.now(UTC).isoformat()
    state = {
        "run_id": run_id,
        "task": "Exercise review limits",
        "deep_review": False,
        "dry_run": True,
        "status": "planning",
        "created_at": now,
        "updated_at": now,
        "review_round": 0,
    }

    council.graph.invoke(state, thread)
    council.graph.invoke(Command(resume={"approved": True, "reason": "test"}), thread)
    finished = council.graph.get_state(thread)

    assert finished.values["status"] == "blocked"
    assert finished.values["review_round"] == 2
    assert finished.next == ()


def test_read_only_network_stage_retries_once(tmp_path: Path, monkeypatch) -> None:
    _git(tmp_path, "init")
    _git(tmp_path, "config", "user.email", "tests@example.com")
    _git(tmp_path, "config", "user.name", "Tests")
    (tmp_path / "README.md").write_text("test", encoding="utf-8")
    _git(tmp_path, "add", "README.md")
    _git(tmp_path, "commit", "-m", "initial")
    runtime_dir = tmp_path / ".ai-council"
    events = []
    council = CouncilGraph(
        repo_root=tmp_path,
        runtime_dir=runtime_dir,
        config=CouncilConfig(),
        checkpointer=InMemorySaver(),
        audit=AuditLog(runtime_dir / "audit.jsonl"),
        progress=events.append,
    )
    original_plan = council.codex.plan
    attempts = 0

    def flaky_plan(*args, **kwargs):
        nonlocal attempts
        attempts += 1
        if attempts == 1:
            raise RuntimeError("failed to lookup address information")
        return original_plan(*args, **kwargs)

    monkeypatch.setattr(council.codex, "plan", flaky_plan)
    monkeypatch.setattr("ai_council.graph.time.sleep", lambda _seconds: None)
    run_id = "network-retry-test"
    now = datetime.now(UTC).isoformat()
    council.graph.invoke(
        {
            "run_id": run_id,
            "task": "Retry planning",
            "deep_review": False,
            "dry_run": True,
            "status": "planning",
            "created_at": now,
            "updated_at": now,
            "review_round": 0,
        },
        {"configurable": {"thread_id": run_id}},
    )

    assert attempts == 2
    assert any(event.stage == "plan" and event.phase == "retrying" for event in events)
