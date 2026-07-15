# SSC — Design System & Build Prompt

> A textual spec of the Student Startup Community (SSC) frontend. Use this as a handoff or as a prompt to continue the work. SSC is an **Azerbaijan-first, English-language, web-first, verified-founder operating system** — not a student social network. North-star metric: **activated builder density** (verified users who, each month, join/create a startup, contribute to a task/discussion, engage a mentor, and publish a visible update).

Stack: **React 19 · Vite 8 · TypeScript 6 · Tailwind CSS 4 · TanStack Router/Query · shadcn/ui (Radix) · lucide-react · GSAP**. Monolithic `src/app.tsx` holds most pages; `src/pages/*` holds auth + community-detail. Data: `src/data/` with a localStorage **demo client** (default) and an **HTTP client** for a future Bun+Hono+Postgres backend.

---

## 1. Design language

### Palette (OKLCH, in `src/styles.css`)
Dark is the premium default (`index.html` ships `class="dark"`). Light is a clean secondary.

**Dark (`.dark`):**
- `--background: oklch(0.145 0.022 255)` — deep navy-near-black
- `--foreground: oklch(0.96 0.012 240)` — near-white, cool
- `--card: oklch(0.195 0.028 255)` — navy card surface
- `--primary: oklch(0.70 0.16 162)` — **emerald**
- `--primary-foreground: oklch(0.12 0.03 255)`
- `--accent: oklch(0.83 0.13 84)` — **soft gold**
- `--accent-foreground: oklch(0.20 0.05 84)`
- `--muted / --muted-foreground` on hue 245; `--border: oklch(1 0 0 / 10%)` glass hairline; `--input: oklch(1 0 0 / 14%)`; `--ring: var(--primary)`

**Light (`:root`):** emerald/gold on near-white navy-tint (`--background: oklch(0.985 0.004 255)`, `--primary: oklch(0.55 0.17 162)`, `--accent: oklch(0.78 0.14 80)`).

Rules: the entire neutral+primary ramp sits on hue ~255 (navy) with primary at hue 162 (emerald) and accent at hue 84 (gold). Alpha via trailing slash. Tints via `color-mix(in oklch, …)`. No purple, no generic SaaS blue.

### Glass & glow tokens
- `--glass-bg / --glass-border / --glass-blur / --glass-highlight`
- `.glass-header` (blur + saturate + inset highlight), **`.glass-card`** (opt-in glassmorphism: alpha bg, hairline border, `backdrop-filter`, inset top light, soft shadow)
- `--glow-primary`, `--glow-accent` (color-mix shadow rings) for CTAs/badges

### Typography & spacing
- Inter on `html`. Display sizes via Tailwind (`text-5xl…8xl`, tight `tracking-[-.04em]`), `tracking-tight` on titles.
- `.app-container { width: min(100% - 2rem, 1240px); margin: auto }`. `--radius: 0.75rem`; sm/md/lg/xl derived.
- `PageContainer` = `app-container py-8 lg:py-10`; `PageHeading` = eyebrow `Badge` + title + description.

---

## 2. Signature surfaces

### Shader background (`src/components/shader-background.tsx`)
Global, fixed, `-z-10`, WebGL1 fragment shader. Flowing 4-octave sine field in **navy→emerald→gold**, with:
- **Jelly/rubber mouse interaction** — velocity-driven elastic warp around the cursor; **mousedown = strong grab**; spring decay → snap back on release.
- Cursor glow, scroll parallax (`u_scroll`), dark/light palette uniform (`u_dark`).
- Guards: `prefers-reduced-motion` → static frame; `visibilitychange` → pause; DPR cap 1.5; WebGL fallback → navy body bg.

### Landing hero (`LandingPage` in `app.tsx`)
- Headline with `.animated-gradient-text` (emerald→gold loop).
- **Hero stats diamond** (`src/components/landing/hero-stats.tsx`): 3×3 CSS grid — 4 stat cards in corners, SSC badge center (safe cell, no overlap); responsive (md stack / lg diamond). Each stat uses a **custom 3D inline-SVG icon** (`hero-icons.tsx`) with gradient + radial shine + colored drop-shadow glow + float animation.

### Founder profile cards (`src/components/landing/founder-cards/*`)
Real founder profiles — **no membership tiers, no fake trust scores, no barcode/ID aesthetic**. Each card: Verified-student badge, avatar (initials), name/role/startup/university, “Building:” line, **stage tracker** (Idea→Validation→MVP→Revenue, gold ring on current), skill tags, traction, “Looking for:” row. Glass + hover glow.

### Activity feed (`FeedPage` in `app.tsx`)
Evidence-oriented, three-column:
- **Composer** (`FeedComposer`): expands on focus; **6 typed chips** (Update/Milestone/Raise/Hiring/Launch/Question), tag input, link URL/title, kind-colored gradient strip, Publish.
- **Filter chips**: All / Following / Milestones / Hiring / Launches / Updates (real counts).
- **PostCard**: kind badge (icon+color), `#tags`, rich link-preview card (kind gradient), `timeAgo`, admin delete.
- **Inline CommentThread**: real comments + reply composer → `addComment`.
- **Left rail**: verified badge + profile-completion bar + Next-steps checklist + quick links.
- **Right rail**: People-to-meet (non-connected), Upcoming events, Trending (real tag frequency), Ecosystem pulse (live tiles).

### Admin panel (`AdminPage`)
Tabbed control tower: **Overview** (real KPIs from `useSnapshot` + startups/mentors counts), **Startups** (verify/feature/suspend), **Mentors** (approve/suspend/reactivate), **Verification** (approve/reject queue), **Moderation** (dismiss flag / remove post via `deletePost`). Every action toasts + updates immediately. Glass cards.

### Investor panel (`InvestorsPage`, `/investors`)
Evidence-first per the research brief — no social noise:
- Watchlist strip, stage + sector filters, search.
- **Venture cards**: logo tile, sector/stage badges, readiness bar, summary, current milestone, team/roles count, backer + mentor-backed chip, Watch / Request intro / View evidence.
- **Mentor directory** below (expertise, rating, book office hours).

---

## 3. Data model (`src/data/types.ts`)
- `User` (id, username, name, title, company, industry, location, skills, about, availability, website, role `'admin'|'member'`)
- **`PostKind`** = `'update'|'milestone'|'raise'|'hiring'|'launch'|'question'`
- `Post` (id, authorId, content, type, `kind?`, `link?: PostLink`, `tags?`, `commentsList?: Comment[]`, `media?`, createdAt, reactions, comments, reposts, liked, saved)
- `Comment` (id, authorId, text, createdAt), `PostLink` (title, subtitle, url)
- `Community`, `CommunityDetail`, `Job`, `Conversation`, `Message`
- `Snapshot extends DemoState` + `currentUser`

Module-level mock datasets (sibling of the rich `startups: StartupData[]`): **`mentors: MentorData[]`** (id, name, title, expertise[], company, rating, sessions, availability, focusStage, bio, status `'active'|'pending'|'suspended'`).

### Data flow
- `useSnapshot()` → `useQuery({ queryKey: ['snapshot'] })` → `apiClient.snapshot()`.
- `useAction(action, success?)` → `useMutation` that invalidates `['snapshot']` + toasts on success/error.
- Mutations: `createPost(content, {kind, tags, link})`, `addComment(postId, text)`, `togglePost`, `repost`, `deletePost`, `connect`, `toggleCommunity`, `sendMessage`, `toggleJob`, `createJob`, `updateProfile`.
- Demo seed: 7 users (founders + mentor + admin), 10 typed posts (every kind, with tags/link/comments), 3 communities, 3 jobs, connections.

---

## 4. Conventions
- **Path alias** `@/` → `./src/`. **`cn()`** (`@/lib/utils`) for class merging.
- shadcn primitives in `@/components/ui/*`; icons from `lucide-react`.
- **Type-only imports** enforced (`@typescript-eslint/consistent-type-imports`); **no `console.log`**; unused vars prefixed `_`.
- GSAP hooks in `src/hooks/use-animations.ts` (`useStaggerCards`, `useLikeAnimation`, `useBookmarkAnimation`, `useScrollReveal`, `useHeroEntrance`, `useMagneticHover`, `useTiltCards`, `useMarquee`) — all `prefers-reduced-motion` aware via `useReducedMotion` + `gsap.matchMedia`. `gsap.registerPlugin(ScrollTrigger)` once in `main.tsx`.
- Routes in `main.tsx` (`createRootRoute → createRoute`, no file-based routing). `rootRoute` mounts `<ShaderBackground />` globally.
- **Runtime**: default offline demo (localStorage); `?mode=api` → HTTP client (`127.0.0.1:3443`); `?resetDemo=1` → fresh seed. **Demo login** `demo` / `demo123` (admin).
- Vite manual vendor chunks (animation/react/tanstack/radix/ui) via `rolldownOptions`. Netlify SPA fallback.

---

## 5. Do / Don’t
**Do:** evidence over noise; real-sounding names/startups/traction; verified-student trust signal; kind-typed posts; glass cards + emerald/gold accents; reduced-motion safe; empty states; dark-first.
**Don’t:** fake trust scores; paid membership tiers / credit-card aesthetics; generic blue SaaS palette; childish icons; counter-only comments/reactions; hardcoded right rails (derive from data).

---

## 6. Quality gate
`npm run lint` (ESLint, type-only imports, no console) · `npm run build` (`tsc -b && vite build`) · `npm test` (Vitest) · `npm run dev` to verify visually. See `FRONTEND_GAPS.md` for the build roadmap (mentor booking, trust registry, `/events`, MVP tracker, team-finding, application dashboard, investor evidence, admin moderation).
