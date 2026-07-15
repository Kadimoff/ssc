# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start Vite dev server
npm run build    # TypeScript check + Vite build (tsc -b && vite build)
npm run lint     # ESLint — type imports enforced, no console.log
npm test         # Vitest (unit + integration)
npm run preview  # Preview production build
```

## Architecture

**Stack:** React 19, Vite 8, TypeScript 6, Tailwind CSS 4, TanStack Router/Query, shadcn/ui (Radix primitives), GSAP.

**Routing** (`src/main.tsx`):
- Two route trees: landing (`/`) and app shell (`/feed`, `/network`, `/communities`, `/messages`, `/jobs`, `/profile`)
- Auth pages (`/sign-in`, `/sign-up`) are independent of the app shell
- Router uses `createRootRoute` → `createRoute` pattern, no file-based routing

**Pages** (monolithic `src/app.tsx` contains most page components):
- `LandingPage`, `FeedPage`, `NetworkPage`, `CommunitiesPage`, `JobsPage`, `MessagesPage`, `ProfilePage`, `AuthPage`
- Separate page modules in `src/pages/`: `sign-in`, `sign-up`, `community-detail`

**Data layer** (`src/data/`):
- `types.ts` defines `ApiClient` interface and shared types (`User`, `Post`, `Community`, `Job`, `Snapshot`, `Message`, etc.)
- `client.ts` selects runtime mode: `?mode=demo` (default, localStorage) or `?mode=api` (HTTP at 127.0.0.1:3443)
- `demo-client.ts` — `DemoApiClient` persists state to localStorage under `studentStartupCommunityDemoData.v2`, includes v1→v2 migration
- `http-client.ts` — `HttpApiClient` hits REST endpoints
- `landing-content.ts` — static mock data for landing page (ecosystem metrics, members, news, events)
- Query key convention: `['snapshot']` as const

**Animations** (`src/hooks/use-animations.ts`): GSAP hooks for page transitions, scroll reveals, stagger cards, counter animation, marquee, parallax, tilt, magnetic hover. All respect `prefers-reduced-motion: reduce`.

**UI** (`src/components/ui/`): shadcn/ui components using Radix primitives (Avatar, Button, Card, Dialog, Input, Label, Tabs, Textarea, Badge).

**Styling** (`src/styles.css`): Tailwind CSS 4 `@import 'tailwindcss'` with custom CSS variables in OKLCH. `@theme inline` block for Tailwind theme values. Custom glass, aurora, gradient text effects. Dark mode via `.dark` class.

**Code splitting** (`vite.config.ts`): Split vendors into animation, react, tanstack, radix, ui groups via rolldownOptions.

**Netlify** (`netlify.toml`): SPA fallback — `/*` → `/index.html` (200).

## Conventions

- **Path alias**: `@/` → `./src/` (configured in tsconfig.json and vite.config.ts)
- **Imports**: type-only imports enforced (`@typescript-eslint/consistent-type-imports`)
- **No console.log**: ESLint rule `no-console: error`
- **Unused vars**: prefix with `_` to suppress ESLint
- **Components**: `cn()` utility from `@/lib/utils` for merging Tailwind classes
- **Icons**: lucide-react (iconLibrary in components.json)
- **QueryClient**: default staleTime 10s, retry disabled

## Runtime

- **Default**: fully offline demo with localStorage — works with zero backend
- **API mode**: `?mode=api` query param toggles to HTTP client
- **Reset demo**: `?resetDemo=1` clears stored data
- **Demo account**: `demo` / `demo123` (role: admin)
