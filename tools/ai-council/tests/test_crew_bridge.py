from pathlib import Path

from ai_council.config import CouncilConfig
from ai_council.crews.deep_review import DeepReviewCrew


def test_crew_uses_custom_claude_bridge_without_network(
    tmp_path: Path, monkeypatch
) -> None:
    crew = DeepReviewCrew(tmp_path, CouncilConfig())
    response = (
        '{"architecture":["ok"],"testing":["ok"],"security":["ok"],'
        '"blockers":[],"recommendation":"proceed"}'
    )
    monkeypatch.setattr(crew.llm.adapter, "complete", lambda *_args, **_kwargs: response)

    report = crew.run(task="Test the bridge", plan={"summary": "test"})

    assert report.recommendation == "proceed"
    assert report.architecture == ["ok"]
