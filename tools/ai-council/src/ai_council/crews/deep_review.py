"""CrewAI expert committee invoked only by --deep-review runs."""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any

from crewai import Agent, Crew, Process, Task
from crewai.llms.base_llm import BaseLLM

from ai_council.adapters.claude_glm import ClaudeGlmAdapter
from ai_council.config import CouncilConfig
from ai_council.json_utils import extract_json
from ai_council.schemas import CrewReport


class ClaudeCliLLM(BaseLLM):
    """Expose the existing Claude Code/GLM CLI as a CrewAI LLM."""

    def __init__(self, adapter: ClaudeGlmAdapter):
        super().__init__(model="claude-code-configured-provider", temperature=0)
        self.adapter = adapter

    def call(
        self,
        messages: str | list[dict[str, str]],
        tools: list[dict] | None = None,
        callbacks: list[Any] | None = None,
        available_functions: dict[str, Any] | None = None,
        from_task: Any | None = None,
        from_agent: Any | None = None,
        **kwargs: Any,
    ) -> str:
        del tools, callbacks, available_functions, from_task, from_agent, kwargs
        if isinstance(messages, str):
            prompt = messages
        else:
            prompt = "\n\n".join(
                f"{item.get('role', 'user').upper()}: {item.get('content', '')}"
                for item in messages
            )
        return self.adapter.complete(prompt, max_turns=1)

    def supports_stop_words(self) -> bool:
        return False

    def get_context_window_size(self) -> int:
        return 100_000


class DeepReviewCrew:
    def __init__(self, repo_root: Path, config: CouncilConfig):
        self.repo_root = repo_root
        self.config = config
        self.llm = ClaudeCliLLM(ClaudeGlmAdapter(repo_root, config))

    def run(self, *, task: str, plan: dict, dry_run: bool = False) -> CrewReport:
        if dry_run:
            return CrewReport(
                architecture=["Dry-run architecture review"],
                testing=["Dry-run test review"],
                security=["Dry-run security review"],
                recommendation="Proceed with the dry-run workflow",
            )
        if not self.config.crew.enabled:
            raise RuntimeError("CrewAI deep review is disabled in .ai-council.toml")

        architect = Agent(
            role="Software Architect",
            goal="Find architectural risks and simplify the approved implementation plan",
            backstory="You are a conservative software architect reviewing an existing repository.",
            llm=self.llm,
            allow_delegation=False,
            max_iter=self.config.crew.max_iter_per_agent,
            verbose=False,
        )
        qa = Agent(
            role="Test and QA Specialist",
            goal="Find missing acceptance criteria, regression risks, and focused tests",
            backstory="You design practical tests for incremental changes in established projects.",
            llm=self.llm,
            allow_delegation=False,
            max_iter=self.config.crew.max_iter_per_agent,
            verbose=False,
        )
        security = Agent(
            role="Security Reviewer and Council Synthesizer",
            goal="Identify security concerns and merge expert advice into a concise JSON report",
            backstory="You are a defensive reviewer who rejects speculative or unactionable findings.",
            llm=self.llm,
            allow_delegation=False,
            max_iter=self.config.crew.max_iter_per_agent,
            verbose=False,
        )

        common = (
            "The crew is read-only. Do not request file edits, shell commands, commits, or external "
            "side effects. Analyze only the supplied task and plan.\n\n"
            f"TASK:\n{task}\n\nPLAN:\n{json.dumps(plan, ensure_ascii=False, indent=2)}"
        )
        architecture_task = Task(
            description=f"Review architecture, scope boundaries, and maintainability.\n\n{common}",
            expected_output="A concise list of concrete architecture advice and blockers.",
            agent=architect,
        )
        qa_task = Task(
            description=f"Review acceptance criteria, regressions, and test coverage.\n\n{common}",
            expected_output="A concise list of concrete testing advice and blockers.",
            agent=qa,
            context=[architecture_task],
        )
        synthesis_task = Task(
            description=(
                "Review security implications and synthesize all expert results. Return only a JSON "
                "object with keys architecture, testing, security, blockers, and recommendation. "
                f"Each category except recommendation is an array of strings.\n\n{common}"
            ),
            expected_output="A CrewReport-compatible JSON object.",
            agent=security,
            context=[architecture_task, qa_task],
            output_pydantic=CrewReport,
        )
        crew = Crew(
            agents=[architect, qa, security],
            tasks=[architecture_task, qa_task, synthesis_task],
            process=Process.sequential,
            verbose=False,
            memory=False,
            cache=False,
        )
        result = crew.kickoff()
        parsed = getattr(result, "pydantic", None)
        if isinstance(parsed, CrewReport):
            return parsed
        raw = getattr(result, "raw", str(result))
        try:
            return CrewReport.model_validate(extract_json(raw))
        except Exception:
            repaired = self.llm.adapter.complete(
                "Convert the following expert report into JSON with array fields architecture, "
                "testing, security, blockers, and a string recommendation. Return JSON only.\n\n"
                + raw,
                max_turns=1,
            )
            return CrewReport.model_validate(extract_json(repaired))
