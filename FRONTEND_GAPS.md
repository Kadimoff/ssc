# SSC — Frontend Gaps Audit

Synthesized from the page/component map, the research report (`World_Class_Student_Startup_Community_Platform_Research_Report.pdf`), and the platform's stated goal: a **trust-based execution platform** for verified student founders (north-star = *activated builder density*), not a social network.

Items use **current state → target**. Priorities: **P0** credibility blockers · **P1** MVP execution loop · **P2** institution-ready (v1).

---

## P0 — credibility blockers

### Mentorship is a stub
- **Now:** `MentorshipPage` (`src/app.tsx`) is ~18 lines — no mentor cards, no booking, no ratings.
- **Target (PDF flow):** discover → expertise/format/rating → goal sheet → confirm calendar/video → session → rate + comment. Mentor entity in `src/data/types.ts`, mock mentors in `demo-client.ts`, booking mutation, mentor cards, rating UI. Reuse the new feed `CommentThread`/rating patterns.

### Trust registry is decorative only
- **Now:** `BadgeCheck` icons and "Verified" copy are ornamentation. No registry, no verification entity. Trust score on the old founder card was removed (fake).
- **Target:** `/trust-registry` route + `TrustBadge`/`Verification` entity in `types.ts` (identity = verified student, role = founder/mentor/investor, reputation = mentor ratings + peer feedback). Surface a real badge on profiles and the founder cards. Grounded in the PDF's "three layers of trust."

### No dedicated events surface
- **Now:** events ride inside landing `UpdatesSection` and `NewsPage`; nav "Events" link points at `/programs`. The new feed right-rail has mock events.
- **Target:** `/events` route with a calendar/list, filter by type (office hours, workshop, demo day), "Add to calendar", host attribution. Promote the feed rail mock into a real page.

### Verification not present in the flow
- **Now:** sign-up has no verification step; everyone is implicitly "verified."
- **Target (PDF):** verification separate from profile completion — `.edu` email / student ID / FIN-based local check, progress UI, "why we collect this" transparency.

---

## P1 — execution loop (PDF MVP)

### Idea-to-MVP tracker is buried
- **Now:** milestone timeline only lives inside `StartupDetailPage`. `ProfilePage` has a `ReadinessBar`. No standalone tracker.
- **Target:** extract a reusable `MilestoneTracker` (idea → validation → MVP → revenue stages, like the founder-card stage tracker) usable on startup pages and profile.

### Team-finding is a directory
- **Now:** `NetworkPage` is a searchable people grid. No cofounder-match or team-formation flow; startups list "open roles" inline.
- **Target:** cofounder-match (skills/stage/availability filters + "looking for" signal on profiles, mirroring the founder-card `lookingFor` field), role applications with a short pitch + trial period (PDF: "Join a startup" flow).

### Application dashboard is a sidebar
- **Now:** `ProgramsPage` renders `ApplicationProgress` rows in a sidebar — not a full dashboard.
- **Target:** `/applications` (or expand Programs) into a full dashboard: status pipeline, cohorts, deadlines, program cards, application composer.

### Real comments/reactions only on feed
- **Now:** the new feed has real comment threads. Community detail, startup updates, etc. still use counter-only or nothing.
- **Target:** propagate the `CommentThread` + reaction pattern to community discussions and startup updates.

### Search & filtering missing
- **Now:** only `NetworkPage` has a search input. No global search, no cross-entity filters.
- **Target:** global search (people, startups, communities, jobs), filters by stage/skill/industry (PDF v1: "richer search and filters").

---

## P2 — institution-ready (PDF v1)

### Investor / evidence view
- **Now:** no investor surface; old feed had a hardcoded "investor interest" card (removed).
- **Target:** compact venture cards (team, milestones, updates, mentor endorsements, traction), watchlist, introduction-request flow. "Investors need compact evidence, not chat-first experiences" (PDF).

### Startup scorecards & benchmarks
- **Now:** `StartupDetailPage` has a readiness score but no comparative benchmarking.
- **Target:** scorecards, ecosystem benchmarking, portfolio export (PDF future: "venture benchmarking", "portfolio export").

### Notifications engine
- **Now:** `NotificationsPage` is a static list of `SystemAlert` rows.
- **Target:** real notification entity, triggers (mentions, comments, application status, mentor booking), unread state, preferences.

### Admin tooling
- **Now:** `AdminPage` is a thin shell; `deletePost`/`deleteCommunity` exist but no moderation queue.
- **Target:** verification queue, moderation queue (auditable + reversible per PDF/OWASP), reports, SLA timers, analytics KPI cards (verified users, active startups, mentor utilization, application conversion).

### Content depth & polish
- **Now:** several pages are thin (`CommunitiesPage`, `NotificationsPage`, `AdminPage`).
- **Target:** bring each to the bar set by the new feed + founder cards (glass cards, kind/type systems, evidence-oriented copy, empty states).

---

## Cross-cutting

- **Data layer is localStorage-only.** `backend-plan.md` specifies Bun + Hono + Drizzle + Postgres. The new typed `kind`/`Comment`/`PostLink` model and `addComment`/`createPost(opts)` already match what a real API would expose — keep shapes in sync when backend lands.
- **No empty states except Network + now feed.** Add to every list page.
- **No infinite scroll / pagination.** Fine at demo scale; needed once posts/users grow.
- **Accessibility:** avatars are initials-only (no `AvatarImage` sources in mock data) — fine; ensure new chips/buttons have `aria-label`s where icon-only (feed Send button has one).
- **Reduced motion:** feed relies on `useStaggerCards` which is reduced-motion aware; new chips/threads are CSS-transition only — safe.

---

## Suggested build order

1. **Mentorship page** (P0) — highest narrative value, biggest stub.
2. **Trust registry + verification badge** (P0) — wire the "verified student" signal that the new feed/profile already imply.
3. **`/events` route** (P0) — small, unblocks nav honesty.
4. **MVP tracker extraction + team-finding** (P1) — completes the "build" loop.
5. **Application dashboard + search** (P1).
6. **Investor evidence view + admin moderation** (P2).
