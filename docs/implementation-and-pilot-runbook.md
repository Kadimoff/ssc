# SSC Partnership OS — Implementation and Pilot Runbook

Version: 1.0  
Status: implementation baseline  
Data classification: internal operating document  
Last updated: 23 July 2026

## 1. Purpose

This runbook turns SSC’s partnership strategy into an operating system that can be piloted without overstating partnerships or outcomes. It covers local deployment, roles, data controls, pilot gates, evidence review, incident handling, and the path from an illustrative demo to verified production records.

The application currently has two modes:

- **Demo mode** stores typed v3 data in the browser. It is useful for product walkthroughs and automatically migrates legacy v1/v2 data with a backup.
- **API mode** uses the Docker stack and stores records in PostgreSQL, uses Redis for rate limiting, MinIO for evidence objects, and Mailpit for local email inspection.

## 2. Local deployment

Prerequisites: Docker Compose and Node.js.

```bash
cp .env.example .env
docker compose up --build -d
npm install
npm run dev
```

Open the Vite URL with `?mode=api`. The API defaults to `http://127.0.0.1:3443`.

Service endpoints:

| Service | Address | Purpose |
|---|---|---|
| Frontend | Vite output, normally `http://127.0.0.1:5173/ssc/` | User workspace |
| API | `http://127.0.0.1:3443` | Hono JSON API |
| PostgreSQL | `127.0.0.1:5432` | System of record |
| Redis | `127.0.0.1:6379` | Rate-limiting state |
| MinIO | `http://127.0.0.1:9000` | Evidence objects |
| MinIO console | `http://127.0.0.1:9001` | Local object administration |
| Mailpit | `http://127.0.0.1:8025` | Local email inspection |

Never reuse the development secrets in a shared or public environment.

## 3. Roles and separation of duties

| Role | Main authority | Must not self-approve |
|---|---|---|
| Student/founder | Profile, participation, evidence submission | Their own evidence |
| Mentor | Session evidence and scoped notes | Program outcomes |
| Partner admin | Organization, contacts, commitments, agreement drafts | Organization verification |
| Program manager | Programs, cohorts, contribution review, outcomes | Their own submitted evidence where avoidable |
| Moderator | Community safety actions | Partnership claims |
| Platform admin | Role assignment, organization verification, incident response | Production claims without a second reviewer |

Production policy requires a submitter and verifier to be different people for material contributions, outcomes, and evidence. The demo permits one administrator to exercise the complete workflow so it remains testable.

## 4. Canonical workflow

1. Register an organization as `prospect`.
2. Verify identity and authority; record the decision in the audit trail.
3. Draft an agreement with at least two parties, explicit responsibilities, data terms, review date, and intended outcomes.
4. Move the agreement through `draft → pending signature → active`.
5. Create the joint program in `draft`.
6. Add partner roles and commitments before opening recruitment.
7. Create a cohort and apply eligibility rules.
8. Record contributions as `pending`.
9. Attach evidence; compute and store a SHA-256 content hash.
10. Verify or reject evidence and contributions.
11. Record outcomes with attribution mode and supporting evidence.
12. Export verified-only program data and archive a dated report.

Terminal agreement states (`expired`, `terminated`) cannot be reopened. Create a new agreement or amendment instead.

## 5. Pilot design

Recommended controlled pilot: 8–12 weeks, 2–4 organizations, 1 program, 30–120 eligible participants, and no sensitive national identifiers.

### Gate A — governance ready

- Named data controller and program owner.
- Signed or test-approved agreement with purpose and retention terms.
- Partner admin authority verified.
- Demo labels removed only for organizations that have confirmed participation.
- Incident contact and escalation route agreed.

### Gate B — program ready

- Eligibility, milestones, and outcome definitions agreed.
- Every partner has a role and commitment.
- Consent text is published and versioned.
- Evidence visibility rules tested using least-privilege accounts.
- Backup and restore rehearsal completed.

### Gate C — delivery ready

- Participant onboarding sample reviewed.
- Mentor and program manager workflows rehearsed.
- Rate limits, audit logging, and upload limits confirmed.
- First weekly evidence review scheduled.

### Gate D — reporting ready

- Duplicate and unsupported outcomes removed.
- Every reportable outcome has at least one verified evidence artifact.
- Attribution confidence and mode reviewed.
- Partner receives a preview and correction window.
- Export and methodology version are archived together.

### Gate E — scale decision

- Pilot retrospective completed.
- Security and privacy issues resolved or accepted by an accountable owner.
- Partner renewal or exit decision recorded.
- Architecture capacity and support load reviewed.

## 6. Measures

Operational measures:

- verified organizations / total organizations;
- active agreements / agreements awaiting action;
- commitments delivered / commitments recorded;
- verified evidence / evidence submitted;
- median verification time;
- cohort activation and completion;
- partner correction requests;
- security, privacy, and moderation incidents.

Outcome measures:

- teams formed;
- MVPs completed;
- mentor sessions completed;
- pilot introductions;
- internships;
- investment meetings;
- award submissions;
- demo-day completion.

The built-in readiness score is an internal operational indicator. It is explicitly not a QS score, ranking prediction, or independent validation.

## 7. Data protection and retention

- Collect the minimum data necessary for program delivery and evidence.
- Do not store raw national identity numbers.
- Store consent purpose and policy version separately from profile data.
- Default partner access to aggregated or scoped records.
- Evidence objects use time-limited signed URLs.
- Store SHA-256 hashes to detect replacement or corruption.
- Keep audit records append-oriented; corrections create new events.
- Define production retention per agreement. A practical starting point is: inactive session tokens 12 hours, rejected uploads 30 days, participant operational data 12 months after program close, verified aggregate evidence according to the agreement, audit records 24 months or the applicable legal requirement.

Retention periods are policy starting points and require local legal review before a real pilot.

## 8. Security operations

Controls implemented in the baseline:

- Argon2id password hashing;
- 12-hour signed access tokens;
- route-level role checks;
- validated request bodies;
- PostgreSQL constraints and foreign keys;
- Redis-backed request rate limiting;
- security headers and explicit CORS origins;
- signed MinIO upload/download URLs;
- evidence content hashes;
- append-oriented audit records;
- verified-only exports.

Before production:

- rotate all secrets into a managed secret store;
- add TLS at the ingress;
- add refresh-token rotation and token revocation;
- require MFA for privileged users;
- add malware scanning to the object-finalization flow;
- encrypt backups and test restore;
- connect centralized logs and alerts;
- commission external penetration testing;
- complete a DPIA and local legal review.

## 9. Incident procedure

1. Contain: disable affected account/integration and preserve logs.
2. Classify: security, privacy, integrity, availability, or safeguarding.
3. Assess scope: organizations, programs, users, evidence, and time window.
4. Notify accountable owners according to the agreement and applicable law.
5. Correct data through new audit events; do not silently rewrite material history.
6. Restore service and verify evidence hashes.
7. Publish an internal post-incident review with actions and owners.

## 10. Validation commands

```bash
npm test
npm run lint
npm run build
docker compose exec -T api bun test
npm run smoke:api
docker compose ps
```

To stop the stack without deleting data:

```bash
docker compose down
```

Deleting named volumes is destructive and intentionally not part of the normal runbook.
