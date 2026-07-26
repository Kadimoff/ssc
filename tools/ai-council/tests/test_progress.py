import json
from pathlib import Path

from ai_council.cli import _read_audit_events
from ai_council.progress import friendly_error, is_transient_network_error


def test_network_errors_have_short_actionable_message() -> None:
    error = RuntimeError("failed to connect to websocket: failed to lookup address information")

    assert is_transient_network_error(error)
    assert "resume" in friendly_error(error)


def test_audit_reader_filters_run_and_tracks_position(tmp_path: Path) -> None:
    path = tmp_path / "audit.jsonl"
    path.write_text(
        json.dumps({"run_id": "one", "event": "stage_started"})
        + "\n"
        + json.dumps({"run_id": "two", "event": "stage_started"})
        + "\n",
        encoding="utf-8",
    )

    position, events = _read_audit_events(path, "two", 0)
    next_position, no_events = _read_audit_events(path, "two", position)

    assert [event["run_id"] for event in events] == ["two"]
    assert next_position == position
    assert no_events == []
