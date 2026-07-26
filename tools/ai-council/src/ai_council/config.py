"""Project-local configuration loading."""

from __future__ import annotations

import tomllib
from pathlib import Path

from pydantic import BaseModel, Field, model_validator


class LimitsConfig(BaseModel):
    max_review_rounds: int = Field(default=2, ge=0, le=5)
    agent_timeout_seconds: int = Field(default=900, ge=30, le=3600)
    max_output_chars: int = Field(default=40_000, ge=2_000, le=200_000)


class VerificationConfig(BaseModel):
    commands: list[str] = Field(
        default_factory=lambda: ["npm test", "npm run lint", "npm run build"]
    )


class CodexConfig(BaseModel):
    executable: str = "codex"
    planning_sandbox: str = "read-only"
    writing_sandbox: str = "workspace-write"


class ClaudeConfig(BaseModel):
    executable: str = "claude"
    permission_mode: str = "plan"
    max_turns: int = Field(default=4, ge=1, le=20)


class CrewConfig(BaseModel):
    enabled: bool = True
    process: str = "sequential"
    max_iter_per_agent: int = Field(default=2, ge=1, le=5)


class RuntimeConfig(BaseModel):
    directory: str = ".ai-council"
    database: str = "checkpoints.sqlite3"
    audit_log: str = "audit.jsonl"


class CouncilConfig(BaseModel):
    limits: LimitsConfig = Field(default_factory=LimitsConfig)
    verification: VerificationConfig = Field(default_factory=VerificationConfig)
    codex: CodexConfig = Field(default_factory=CodexConfig)
    claude: ClaudeConfig = Field(default_factory=ClaudeConfig)
    crew: CrewConfig = Field(default_factory=CrewConfig)
    runtime: RuntimeConfig = Field(default_factory=RuntimeConfig)

    @model_validator(mode="after")
    def validate_commands(self) -> "CouncilConfig":
        if not self.verification.commands:
            raise ValueError("At least one verification command is required")
        return self


def find_repo_root(start: Path | None = None) -> Path:
    current = (start or Path.cwd()).resolve()
    for candidate in (current, *current.parents):
        if (candidate / ".git").exists():
            return candidate
    raise RuntimeError("No Git repository found from the current directory")


def load_config(repo_root: Path) -> CouncilConfig:
    config_path = repo_root / ".ai-council.toml"
    if not config_path.exists():
        return CouncilConfig()
    with config_path.open("rb") as handle:
        return CouncilConfig.model_validate(tomllib.load(handle))

