# SSC AI Council

Project-local, controlled orchestration for Codex and the configured Claude Code/GLM
provider. LangGraph owns durable workflow state. CrewAI is optional and runs only in
`--deep-review` mode.

## Setup

From the SSC-Honor repository root:

```bash
uv sync --project tools/ai-council --python 3.12
uv run --project tools/ai-council ai-council doctor
```

The tool inherits existing Codex and Claude Code authentication. It never writes API
keys to the repository.

## Use

Start a normal run:

```bash
uv run --project tools/ai-council ai-council start "Describe the task"
```

Add the read-only CrewAI architecture, QA, and security committee:

```bash
uv run --project tools/ai-council ai-council start --deep-review "Describe the task"
```

Both commands stop before project writes. Review the printed plan, then continue:

```bash
uv run --project tools/ai-council ai-council approve RUN_ID
```

Other commands:

```bash
uv run --project tools/ai-council ai-council reject RUN_ID --reason "Reason"
uv run --project tools/ai-council ai-council status RUN_ID
uv run --project tools/ai-council ai-council history RUN_ID
uv run --project tools/ai-council ai-council resume RUN_ID
uv run --project tools/ai-council ai-council watch RUN_ID
```

`start`, `approve`, and `resume` show the active stage and elapsed time. To watch a run
from another terminal, use `watch`; it reads the local audit stream and SQLite state
without affecting the agent process.

Transient DNS, HTTP, and WebSocket failures are retried once during read-only planning
and review stages. Write stages stop instead of retrying automatically. By default the
CLI prints a short recovery message; set `AI_COUNCIL_DEBUG=1` to include the full Python
traceback when diagnosing the tool itself.

Use `--dry-run` with `start` to exercise graph routing without model calls or project
verification commands. The approval gate still applies.

## Safety model

- Codex plans in `read-only` and is the only writer in `workspace-write`.
- Claude Code/GLM and CrewAI are reviewers operating in plan mode.
- Existing dirty and untracked files are fingerprinted before the run and protected.
- Git history changes stop the workflow.
- No automatic commit, push, reset, or sandbox bypass is used.
- Review corrections are capped by `.ai-council.toml`.
- Checkpoints and audit records stay in the git-ignored `.ai-council/` directory.
