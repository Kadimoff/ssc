from pathlib import Path

from ai_council.config import CouncilConfig, load_config


def test_default_config_has_controlled_limits(tmp_path: Path) -> None:
    config = load_config(tmp_path)

    assert config.limits.max_review_rounds == 2
    assert config.codex.planning_sandbox == "read-only"
    assert config.codex.writing_sandbox == "workspace-write"
    assert config.claude.permission_mode == "plan"


def test_config_rejects_empty_verification_commands() -> None:
    try:
        CouncilConfig.model_validate({"verification": {"commands": []}})
    except ValueError as exc:
        assert "At least one verification command" in str(exc)
    else:
        raise AssertionError("Empty verification commands must be rejected")

