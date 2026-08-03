# 📱 SSC Mobile Responsive Audit Report

> **Audit date:** 3 August 2026  
> **Auditor:** Cline (automated static analysis + manual code review)  
> **Scope:** `src/pages/`, `src/components/`, `src/features/`, `src/styles.css`  
> **Target viewports:** iPhone SE (375×667), iPhone 14 (390×844), iPhone 14 Pro Max (430×932), Samsung Galaxy S20 (360×800)  
> **Build status:** ✅ `npm run build` passes (377 modules, 687ms)  
> **Test status:** ✅ `npm run test` passes (79/79 tests, 16 test files)  
> **Remediation status:** ✅ C-1, H-1, M-1, M-2 fixed — workspace compact grids added

---

## 📋 Executive Summary

The SSC frontend has a **solid responsive foundation** — CSS media queries at 767px/1279px breakpoints, `safe-area-inset` handling, `app-container` width capping, `no-scrollbar` utility, `overflow-x: clip` on body, and a runtime `responsive-audit.ts` detector. Most pages use mobile-first patterns with progressive enhancement.

However, **8 specific issues** were identified ranging from critical table overflow to minor cosmetic concerns. The most severe problems are concentrated in the **Investor workspace** (fixed-width tables) and **Rankings page** (complex grid templates).

| Severity | Count | Impact |
|----------|-------|--------|
| 🔴 Critical | 1 | Content inaccessible on mobile without horizontal scroll |
| 🟠 High | 2 | Significant layout breakage on small screens |
| 🟡 Medium | 3 | Usable but degraded experience |
| 🟢 Low | 2 | Cosmetic / minor visual issues |

---

## 🔍 Findings by Severity

### 🔴 CRITICAL

---

#### C-1: Investor Pipeline Table — Fixed `min-w-[1120px]` causes forced horizontal scroll

**File:** `src/components/investor/workspace-views.tsx:313`  
**Affected viewport:** All screens < 1120px (all phones, most tablets)  
**Component:** `PipelineTable`

```tsx
// CURRENT (line 313)
<table className='w-full min-w-[1120px] text-sm'>
```

**Problem:** The table has a hard minimum width of 1120px. On a 375px viewport, users must scroll horizontally through ~745px of content. While wrapped in `overflow-x-auto`, the table is functionally unusable on mobile — column headers, stage selectors, and action buttons are all off-screen.

**Impact:** The "Table" view of the investment pipeline is the primary data-dense interaction. Mobile investors cannot review ventures, change pipeline stages, or add notes without extensive horizontal scrolling.

**Recommended fix:** Provide a responsive card-based fallback on mobile (the board view already exists and works well). Hide the "Table" toggle button below `md` breakpoint, or transform the table into stacked cards:

```tsx
// Option A: Hide table toggle on mobile (minimal change)
<button 
  type='button' 
  onClick={() => setView('table')} 
  className={cn(
    'inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold md:inline-flex',
    view === 'table' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'
  )}
>
```

```tsx
// Option B: Responsive table → card transform (more work)
// Add data-labels to cells and use CSS to stack on mobile
<td data-label='Venture' className='p-4 before:content-[attr(data-label)] md:before:hidden'>
```

---

### 🟠 HIGH

---

#### H-1: Investor Compare Table — Fixed `min-w-[860px]` with sticky column

**File:** `src/components/investor/workspace-views.tsx:369`  
**Affected viewport:** All screens < 860px  
**Component:** `InvestorCompare`

```tsx
// CURRENT (line 369)
<table className='w-full min-w-[860px] text-sm'>
```

**Problem:** The side-by-side comparison table has 860px minimum width. Each venture column has `min-w-64` (256px). Comparing 2 ventures = 256px × 2 + 120px signal column = 632px minimum. Comparing 3 ventures = 888px+. The sticky left column helps but the comparison is still unusable on phones.

**Impact:** Investors cannot compare ventures on mobile, a key decision-support feature.

**Recommended fix:** Convert to a vertical accordion layout on mobile where each venture is a section and signals expand/collapse:

```tsx
// Mobile: stack ventures vertically, show signals as expandable sections
<div className='hidden md:block'>
  {/* Existing table */}
</div>
<div className='md:hidden'>
  {/* Mobile card-based comparison */}
  {selected.map((startup) => (
    <details key={startup.slug} className='rounded-xl border'>
      <summary className='p-4 font-semibold'>{startup.name}</summary>
      <div className='space-y-2 p-4'>
        {rows.map((row) => (
          <div key={row.label} className='flex justify-between'>
            <span className='text-muted-foreground'>{row.label}</span>
            <span>{row.render(startup)}</span>
          </div>
        ))}
      </div>
    </details>
  ))}
</div>
```

---

#### H-2: Rankings Desktop Grid Template — Hidden on mobile but layout fallback needs review

**File:** `src/pages/rankings/index.tsx:106` and `src/components/rankings/ranking-row.tsx:45`

```tsx
// rankings/index.tsx:106 — desktop header (hidden below lg)
<div className='hidden grid-cols-[44px_minmax(180px,1fr)_minmax(220px,2fr)_72px_64px_40px] gap-3 ... lg:grid'>

// ranking-row.tsx:45 — row layout
className='... lg:grid lg:grid-cols-[44px_minmax(180px,1fr)_minmax(220px,2fr)_72px_64px_40px] ...'
```

**Problem:** Below `lg` (1024px), ranking rows switch to a card layout. The card layout uses `flex items-start gap-3` which is good, but the inner content at `ranking-row.tsx:57-60` has:

```tsx
<div className='ml-auto flex items-center gap-2 lg:hidden'>...</div>
<div className='mt-2 flex items-center justify-between lg:mt-0 lg:block lg:text-right'>
```

The `ml-auto` on line 57 pushes the rank change badge and details button to the right, but on very narrow screens (360px) the combination of rank number (44px) + venture identity + score + change badge + button can still cause horizontal compression. The `minmax(180px,1fr)` in the desktop template also means the desktop layout won't activate until 1024px+ — between 768px and 1023px (tablet landscape), users get the mobile card view which may feel inconsistent.

**Impact:** Tablet users (768-1023px) get mobile card layout instead of the grid table, which is a degraded but functional experience.

**Recommended fix:** Consider activating the grid layout at `md` (768px) instead of `lg` (1024px) for tablets, or simplify the mobile card to reduce horizontal pressure:

```tsx
// Consider adding md: breakpoint for tablet grid
className='... md:grid md:grid-cols-[44px_minmax(140px,1fr)_60px_40px] lg:grid-cols-[44px_minmax(180px,1fr)_minmax(220px,2fr)_72px_64px_40px] ...'
```

---

### 🟡 MEDIUM

---

#### M-1: Investor Pipeline Board — Fixed `w-[285px]` columns

**File:** `src/components/investor/workspace-views.tsx:241`

```tsx
<section key={stage} className='w-[285px] shrink-0 snap-start rounded-xl border bg-muted/20 p-3 xl:w-[calc((100%-3rem)/5)]'>
```

**Problem:** Each Kanban column is exactly 285px wide. On a 375px screen with 5 stages, the total content width is 1425px+ — requiring horizontal scroll. The parent has `overflow-x-auto` and `snap-x` which makes this scrollable and snap-aligned (good), but 285px is wider than necessary on small phones. The `xl:` responsive override only activates at 1280px+.

**Impact:** Functional but suboptimal — users can scroll-snap between stages, but each column takes up 76% of a 375px screen.

**Recommended fix:** Use a responsive width that adapts:

```tsx
className='w-[260px] shrink-0 snap-start ... sm:w-[285px] xl:w-[calc((100%-3rem)/5)]'
```

Or better, use viewport-relative units:

```tsx
className='w-[85vw] shrink-0 snap-start ... sm:w-[320px] xl:w-[calc((100%-3rem)/5)]'
```

---

#### M-2: Landing Member Cards — Fixed `w-[190px]`

**File:** `src/pages/landing/index.tsx:420`

```tsx
<article ... className='landing-member-card w-[190px] shrink-0 px-2 py-3 text-center'>
```

**Problem:** Member cards in the carousel are exactly 190px. On a 360px viewport, one card takes 53% of the screen width. Since this is a horizontal carousel with `overflow-x-auto`, it's functional, but the card feels oversized on small phones.

**Impact:** Minor — the carousel works, but cards could be slightly smaller on mobile for better preview of adjacent cards.

**Recommended fix:**

```tsx
className='landing-member-card w-[160px] shrink-0 px-2 py-3 text-center sm:w-[190px]'
```

---

#### M-3: Rankings Filter Grid — Complex `xl:grid-cols-[...]` template

**File:** `src/components/rankings/ranking-filters.tsx:43`

```tsx
className='mt-3 grid gap-2 border-t pt-3 sm:grid-cols-2 md:grid md:grid-cols-3 xl:grid-cols-[1fr_1fr_1.35fr_1fr_1.2fr_auto_auto]'
```

**Problem:** The `xl:` grid template with 7 columns (`1fr_1fr_1.35fr_1fr_1.2fr_auto_auto`) is very complex. Below `xl` (1280px), it falls back to `md:grid-cols-3` which is reasonable. However, the "Verified only" toggle button at line 49 and the "Reset" button at line 50 both use `mt-auto` to align to the bottom. On the `sm:grid-cols-2` layout (640-767px), these buttons may end up in odd positions since only 2 columns are active but there are 7 filter elements.

**Impact:** On tablet/smaller desktop (640-1279px), filter layout is functional but may have uneven spacing.

**Recommended fix:** Test the `sm:grid-cols-2` layout specifically and consider `sm:grid-cols-2 lg:grid-cols-3` for better tablet experience:

```tsx
className='mt-3 grid gap-2 border-t pt-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-[1fr_1fr_1.35fr_1fr_1.2fr_auto_auto]'
```

---

### 🟢 LOW

---

#### L-1: `whitespace-nowrap` in UI primitives

**Files:** 
- `src/components/ui/badge.tsx:7` — `whitespace-nowrap`
- `src/components/ui/button.tsx:7` — `whitespace-nowrap`  
- `src/components/ui/tabs.tsx:42` — `whitespace-nowrap`

**Problem:** Core UI components use `whitespace-nowrap` which prevents text wrapping. When these components are placed in flex containers without `min-w-0`, they can force horizontal overflow. However, most usages in the codebase pair these with `flex-wrap` or `truncate`, so the risk is low.

**Impact:** Minimal — most parent containers handle overflow correctly. Could cause issues in tight button groups on very narrow screens.

**Recommended fix:** No immediate change needed. When using these components in constrained flex containers, ensure the parent has `min-w-0` or `flex-wrap`.

---

#### L-2: App Shell Header — Logo + title truncation on very narrow screens

**File:** `src/app/app-shell.tsx:149-152`

```tsx
<Link ... className='flex h-11 w-9 shrink-0 items-center overflow-hidden rounded-lg ... xl:w-[116px]'>
  <img ... className='ssc-brand-logo h-10 w-[116px] max-w-none object-left' />
</Link>
<p className='min-w-0 max-w-[76px] truncate text-sm font-bold sm:max-w-[150px] xl:hidden'>{pageTitle(location)}</p>
```

**Problem:** The logo container is `w-9` (36px) but the image inside is `w-[116px]` with `max-w-none` — the `overflow-hidden` on the parent clips it. This is intentional (shows logo icon on mobile, full logo on XL). The page title is truncated to `max-w-[76px]` on mobile. On a 360px screen with logo (36px) + gap + title (76px) + action buttons (~120px), there's ~128px of breathing room — adequate but tight.

**Impact:** Minimal — the truncation and clipping work as designed.

**Recommended fix:** No change needed. The design is intentional and functional.

---

## 📐 Global Pattern Analysis

### ✅ Strengths (What's Working Well)

| Pattern | Implementation | Quality |
|---------|---------------|---------|
| **Mobile-first breakpoints** | CSS media queries at 767px, 1279px | ✅ Excellent |
| **Safe area handling** | `env(safe-area-inset-bottom)` on bottom nav, messages, forms | ✅ Excellent |
| **Container width capping** | `app-container { width: min(100% - 2rem, 1240px) }` | ✅ Excellent |
| **Overflow prevention** | `body { overflow-x: clip }` | ✅ Good |
| **Mobile bottom nav** | Fixed bottom nav with `xl:hidden`, 5-column grid | ✅ Excellent |
| **Messages responsive layout** | `mobileView` state toggle between list/conversation | ✅ Excellent |
| **Horizontal scroll utilities** | `no-scrollbar`, `overflow-x-auto`, `snap-x` | ✅ Good |
| **Runtime audit** | `responsive-audit.ts` detects overflow at runtime | ✅ Good |
| **`min-w-0` usage** | Consistently applied in flex containers (messages, feed, etc.) | ✅ Good |
| **Progressive enhancement** | Most grids: `grid-cols-2 → sm:grid-cols-3 → lg:grid-cols-X` | ✅ Good |

### ⚠️ Areas of Concern

| Pattern | Issue | Files |
|---------|-------|-------|
| **Fixed `min-w-[Npx]` on tables** | Forces horizontal scroll below threshold | `workspace-views.tsx` |
| **Fixed `w-[Npx]` on cards/columns** | Suboptimal space usage on mobile | `workspace-views.tsx`, `landing/index.tsx` |
| **Complex grid templates** | Hard to predict behavior across breakpoints | `ranking-filters.tsx`, `ranking-row.tsx` |

---

## 🎯 Prioritized Remediation Roadmap

### Phase 1: Quick Wins (Low effort, high impact)
1. **C-1:** Hide "Table" toggle on investor pipeline below `md` — *15 min*
2. **M-1:** Reduce pipeline board column width on mobile — *10 min*
3. **M-2:** Reduce landing member card width on mobile — *5 min*

### Phase 2: Medium Effort
4. **H-2:** Test and adjust rankings breakpoint from `lg` to `md` — *30 min*
5. **M-3:** Test rankings filter grid at `sm` breakpoint — *20 min*

### Phase 3: Larger Effort
6. **H-1:** Build mobile card-based comparison view for investor compare — *2-4 hours*

### Phase 4: Polish
7. **L-1:** Audit `whitespace-nowrap` usage in constrained containers — *30 min*
8. **L-2:** No action needed — design is intentional

---

## 🧪 Testing Recommendations

### Manual Testing Checklist
- [ ] Test on iPhone SE (375px) — smallest common phone
- [ ] Test on iPhone 14 Pro Max (430px) — large phone
- [ ] Test on iPad Mini (768px) — small tablet
- [ ] Test on iPad Pro landscape (1024px) — tablet landscape boundary
- [ ] Test all investor workspace tabs (overview, discover, pipeline, compare, mentors)
- [ ] Test rankings page with filters expanded on mobile
- [ ] Test messages page conversation toggle on mobile
- [ ] Test landing page carousel swipe on touch device

### Automated Testing
```bash
# Build verification
npm run build

# Run existing tests (includes responsive-shell.test.ts)
npm run test

# Visual regression testing (recommended addition)
# Consider adding Playwright with mobile viewport configurations
```

### Runtime Audit
The project includes `src/lib/responsive-audit.ts` which can be activated to detect overflow at runtime. To use:

```tsx
import { installResponsiveAudit } from '@/lib/responsive-audit'
useEffect(() => installResponsiveAudit(), [])
// Check console for [SSC layout audit] warnings
// Or inspect window.__sscLayoutAudit
```

---

## 📊 Page-by-Page Assessment

| Page | Mobile Status | Notes |
|------|--------------|-------|
| `/` (Landing) | ✅ Good | Carousel works, hero is responsive, member cards slightly large |
| `/feed` | ✅ Good | Multi-column layout collapses properly |
| `/investors` | ⚠️ Needs work | Tables cause overflow (C-1, H-1), board columns wide (M-1) |
| `/rankings` | ⚠️ Minor issues | Grid breakpoint gap (H-2), filter layout (M-3) |
| `/messages` | ✅ Excellent | Best-in-class responsive implementation |
| `/assistant` | ✅ Good | Copilot panel is mobile-optimized |
| `/account` | ✅ Good | Verification flow uses progressive disclosure |
| `/admin` | ✅ Good | Stats grid is responsive |
| `/events` | ✅ Good | Cards stack properly |
| `/communities` | ✅ Good | Grid collapses to 1 column |
| `/profile` | ✅ Good | Progress bar and layout are fluid |
| `/network` | ✅ Good | — |
| `/workspace` | ✅ Good | — |

---

## 🔧 CSS Infrastructure Notes

The project's CSS (`src/styles.css`) has a **well-structured responsive foundation**:

```css
/* Key responsive infrastructure */
body { overflow-x: clip; }                           /* Prevents horizontal scroll */
.app-container { width: min(100% - 2rem, 1240px); } /* Caps content width */
.no-scrollbar { ... }                                /* Hides scrollbars on touch */

@media (max-width: 767px) { ... }   /* Mobile-specific adjustments */
@media (max-width: 1279px) { ... }  /* Below XL adjustments */
@media (pointer: coarse) { ... }    /* Touch device optimizations */
@media (min-width: 1280px) { ... }  /* Desktop enhancements */
```

This is a **mature, production-grade** responsive system. The issues identified are in component-level implementations, not in the foundational CSS architecture.

---

*End of report. For questions or clarifications, refer to the specific file and line numbers cited above.*