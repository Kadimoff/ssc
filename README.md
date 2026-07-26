# Student Startup Community Partnership OS

Student Startup Community is a partnership-first operating system for student entrepreneurship. It combines a React 19 community workspace with a Bun/Hono API, PostgreSQL, Redis, MinIO evidence storage, and Mailpit for local email testing.

The UI foundation is derived from [shadcn-admin](https://github.com/satnaing/shadcn-admin) at commit `e16c87f`, under the included MIT license.

## Run locally

```bash
npm install
npm run dev
```

Open the URL printed by Vite. The default offline demo requires no backend.

## Demo accounts

- Platform administrator: `demo` / `demo123`
- Investor-only workspace: `investor` / `demo123`

Newly registered users receive the normal `student` role. They cannot see or open the
investor, partnership, or administration workspaces. API mode enforces the same role
boundaries server-side.

## Runtime modes

- `?mode=demo` uses the local typed demo client.
- `?mode=api` uses the HTTP client targeting `http://127.0.0.1:3443` by default.
- `?resetDemo=1` clears v3 and legacy v2 demo data and sessions.

Legacy v1 and v2 browser data is migrated once to the v3 partnership schema and backed up before conversion.

## SSC Copilot and matching API

Signed-in users can open SSC Copilot from the application header or visit `/assistant`.
SSC Copilot understands English, Turkish, and Azerbaijani discovery prompts and
returns explainable matches across people, ventures, jobs, mentors, programs, and authorized
partner records.

Demo mode keeps prompt history in browser storage and uses deterministic local matching.
API mode calls authenticated `/assistant/query` and `/investor/discovery` endpoints. Raw
prompts are not stored: the backend records a one-way fingerprint, structured criteria,
result identifiers, engine status, and latency. Email addresses and phone numbers are
redacted before an optional OpenAI-compatible provider sees the prompt.

The provider is disabled by default. Set `AI_ENABLED=true`, `AI_BASE_URL`, `AI_MODEL`, and
optionally `AI_API_KEY`; invalid output, timeouts, or provider failure automatically fall
back to deterministic extraction. The model extracts intent and filters only. PostgreSQL
retrieval, scoring, RBAC, and evidence fields remain authoritative.

Every score is an explainable relevance calculation with matched and missing signals.
The investor workspace adds thesis-based venture discovery, derived metrics, persistent
watchlists, evidence warnings, and three-way venture comparison. These values are not
investment advice or predictions.

Implemented assistant endpoints:

- `GET /assistant/capabilities`
- `POST /assistant/query`
- `POST /assistant/feedback`
- `POST /investor/discovery` (investor or platform administrator only)

The API also exposes authenticated startup, member, open-role, milestone, and mentor-profile
workflows. Assistant requests have a Redis-backed per-user limit of 20 per minute.

## Full local stack

```bash
cp .env.example .env
docker compose up --build -d
npm run dev
```

- API and health checks: `http://127.0.0.1:3443`
- MinIO console: `http://127.0.0.1:9001`
- Mailpit inbox: `http://127.0.0.1:8025`
- API mode: open the frontend with `?mode=api`

The seeded organizations, commitments, programs, and outcomes are explicitly illustrative. They must not be presented as real partnerships or impact.

## Strategy and operating documents

- [`SSC partnership architecture`](docs/ssc-partnership-architecture.md)
- [`Implementation and pilot runbook`](docs/implementation-and-pilot-runbook.md)
- [`QS evidence register`](docs/qs-submission-evidence-register.md)
- [`Polished transformation report`](docs/SSC_QS_Power_of_Partnerships_Transformation_Report.docx)
- [`Original research source`](docs/research/deep-research-report.md)

## Quality checks

```bash
npm test
npm run lint
npm run build
docker compose exec -T api bun test
npm run smoke:api
```

## AI Council workflow

This repository includes an optional, project-local LangGraph workflow that coordinates
Codex implementation with Claude Code/GLM review and an optional CrewAI expert committee.
It requires explicit approval before any agent writes project files.

```bash
uv sync --project tools/ai-council --python 3.12
uv run --project tools/ai-council ai-council doctor
uv run --project tools/ai-council ai-council start "Describe the task"
```

See [`tools/ai-council/README.md`](tools/ai-council/README.md) for normal, deep-review,
approval, live progress, `watch`, history, and recovery commands.
