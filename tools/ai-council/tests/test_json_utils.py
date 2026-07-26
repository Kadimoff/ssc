import pytest

from ai_council.json_utils import extract_json


def test_extracts_plain_and_fenced_json() -> None:
    assert extract_json('{"ok": true}') == {"ok": True}
    assert extract_json('Result:\n```json\n{"ok": true}\n```') == {"ok": True}


def test_rejects_missing_json() -> None:
    with pytest.raises(ValueError):
        extract_json("no structured value")

