"""Serializable contracts exchanged between workflow nodes."""

from __future__ import annotations

from typing import Literal, TypedDict

from pydantic import BaseModel, Field


Severity = Literal["info", "low", "medium", "high", "critical"]
RunStatus = Literal[
    "planning",
    "awaiting_approval",
    "implementing",
    "verifying",
    "reviewing",
    "completed",
    "rejected",
    "blocked",
    "failed",
]


class PlanStep(BaseModel):
    title: str
    details: str


class CodexPlan(BaseModel):
    summary: str
    scope: list[str] = Field(default_factory=list)
    steps: list[PlanStep] = Field(default_factory=list)
    tests: list[str] = Field(default_factory=list)
    risks: list[str] = Field(default_factory=list)
    assumptions: list[str] = Field(default_factory=list)


class AgentRunResult(BaseModel):
    ok: bool
    text: str = ""
    session_id: str | None = None
    error: str | None = None
    exit_code: int | None = None
    events: list[dict] = Field(default_factory=list)


class CrewReport(BaseModel):
    architecture: list[str] = Field(default_factory=list)
    testing: list[str] = Field(default_factory=list)
    security: list[str] = Field(default_factory=list)
    blockers: list[str] = Field(default_factory=list)
    recommendation: str = ""


class ReviewFinding(BaseModel):
    severity: Severity
    title: str
    details: str
    file: str | None = None
    line: int | None = None


class ReviewVerdict(BaseModel):
    approved: bool
    summary: str
    findings: list[ReviewFinding] = Field(default_factory=list)
    requires_scope_change: bool = False


class VerificationCommandResult(BaseModel):
    command: str
    ok: bool
    exit_code: int
    output: str


class VerificationReport(BaseModel):
    ok: bool
    commands: list[VerificationCommandResult] = Field(default_factory=list)


class SafetySnapshot(BaseModel):
    head: str
    protected_files: dict[str, str] = Field(default_factory=dict)
    initial_status: list[str] = Field(default_factory=list)


class CouncilState(TypedDict, total=False):
    run_id: str
    task: str
    deep_review: bool
    dry_run: bool
    status: RunStatus
    created_at: str
    updated_at: str
    plan: dict
    crew_report: dict | None
    approval: dict | None
    codex_session_id: str | None
    implementation_result: dict | None
    verification: dict | None
    review: dict | None
    review_round: int
    final_report: str | None
    error: str | None
    safety_snapshot: dict

