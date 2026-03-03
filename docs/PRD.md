# FLECS Webapp — Product Requirements Document

**Version:** 3.0
**Date:** 2026-03-02
**Status:** Draft for CTO Review

---

## 1. Vision

> "Every click that doesn't deliver value is a failure of design."

FLECS is industrial device management. The webapp is a **control tower** — everything visible, nothing hidden, every action one click away. Dark-mode-first. Information-dense. Zero guesswork.

The current webapp works. The next version must be **immersive, fast, and type-safe end-to-end**.

---

## 2. Current State (Audited)

### 2.1 Codebase Facts

| Metric | Value |
|--------|-------|
| Total source files | 267 (.jsx + .tsx + .ts) |
| JavaScript files | 85 (.jsx: 78, .js: 7) — **32% of codebase** |
| TypeScript files | 189 (.tsx: 141, .ts: 48) — **68% of codebase** |
| Context providers (nested) | **11+ levels deep** |
| Error boundaries | **0** |
| TanStack Query / Zustand | **Not installed** |
| CSS-in-JS engines | **2** (styled-components + Emotion) |
| Dead dependencies | `draft-js`, `prop-types`, `oidc-client-ts`, `react-oidc-context` |
| `tsconfig.json` strict mode | `strict: true` — **already on** |
| `allowJs` | `true` — escape hatch keeping .jsx alive |

### 2.2 Architecture Debt

| Problem | Impact |
|---------|--------|
| 85 JS files with `PropTypes` instead of TypeScript interfaces | No compile-time safety on 32% of components |
| 11+ nested context providers in `Providers.tsx` | Deep coupling, cascade re-renders, untestable |
| Manual `useState` + `useEffect` for all API data | No caching, no deduplication, no background refetch |
| 500ms `setInterval` polling | Runs when tab is hidden, wastes resources |
| Dual CSS-in-JS (styled-components + Emotion) | Double runtime cost, inconsistent patterns |
| `throw 'string'` in production code | No stack traces, silent failures |
| `normalizeUrl` dependency | Crashes on relative URLs, broke dev setup |
| External OpenAPI clients (Axios-based) | No tree-shaking, version pinning fragility |
| Zero error boundaries | One component crash kills the entire app |
| `allowJs: true` in tsconfig | TypeScript strict mode is neutered for .jsx files |

### 2.3 UX Debt

| Problem | Impact |
|---------|--------|
| Installed Apps is a table with expandable rows | Instance status hidden, requires clicks to discover |
| Marketplace install flow: card → modal → install | 4 clicks minimum to install an app |
| System page: 2 tabs with minimal content | Wasted real estate |
| Service Mesh page is empty ("go install it") | Dead navigation item |
| No global toast/notification system | Users don't know if actions succeeded |
| Quest log hidden behind tiny AppBar icon | Users miss job progress |
| Onboarding is a blocking modal dialog | Feels like 2005 setup wizard |
| Profile page is a dead end | Just shows JWT claims, no actions |
| No keyboard shortcuts | Power users slowed down |
| No empty states with CTAs | New users see blank pages |

### 2.4 Brand Misalignment

| Current | Target |
|---------|--------|
| Background: `#0A0A0A` | `#0B0B18` (FLECS Black) |
| Primary: generic MUI default | `#FF2E63` (FLECS Red) |
| Font: system default | Inter + JetBrains Mono |
| Light-mode-first | Dark-mode-first |
| No gradients | `#FF2E63 → #FF6B8A` (135deg) |
| 8px spacing | 4px base grid |

---

## 3. Target Architecture

### 3.1 Principles

1. **KISS** — Simplest solution that works. No premature abstractions.
2. **Anti-monolithic** — Feature modules, lazy-loaded, independently testable.
3. **Type-safe end-to-end** — TypeScript strict, typed API hooks, typed stores.
4. **Server state ≠ app state** — TanStack Query owns API data. Zustand owns UI state.
5. **Dark-mode-first** — Design for `#0B0B18`, adapt to light.

### 3.2 Tech Stack

| Layer | Current | Target | Why |
|-------|---------|--------|-----|
| Build | Vite 6.3.5 | **Vite 7.x** | Rolldown-powered, faster builds, latest stable |
| Framework | React 19.1 | React 19.x | Already current, keep updated |
| Language | JS + TS mixed | **100% TypeScript strict** | Convert 85 .js/.jsx files, disable `allowJs` |
| Routing | React Router 7.6 (HashRouter) | **Keep HashRouter** | CTO decision — HashRouter works, customer paths matter, stable before API layer |
| Styling | MUI 7 + Emotion + styled-components | **MUI 7 + Emotion only** | Drop styled-components, use MUI theme tokens + `sx` prop |
| Server State | React Context + manual fetch | **TanStack Query v5** | Caching, dedup, background refetch, optimistic updates, smart polling |
| Client State | 11+ Context providers | **Zustand** (2-3 stores max) | Flat, no provider nesting, selectors prevent re-renders |
| Forms | Manual `useState` | **React Hook Form + Zod** | Validation, performance, schema-driven |
| Icons | MUI Icons | **Lucide React** | Thin line style (1.5px stroke), modern aesthetic, tree-shakeable |
| Error Handling | Nothing | **react-error-boundary + toast** | Graceful degradation, user-visible errors |
| Real-time | 500ms `setInterval` | **TanStack Query `refetchInterval`** | Smart polling — pauses on blur, deduplicates |

### 3.3 API Client Strategy

**Current:** External packages `@flecs/core-client-ts` and `@flecs/auth-provider-client-ts` (openapi-generator 7.12.0, Axios-based, hosted on GitHub).

**Now:** Keep external packages. Wrap with TanStack Query hooks for caching and smart polling.

**Future (when OpenAPI specs are available):** Generate inline with `@hey-api/openapi-ts` into `src/generated/`. Tree-shakeable, fetch-based, full type inference. This eliminates the external package dependency and version pinning issues.

### 3.4 Dependency Cleanup

**Remove:**
| Package | Reason |
|---------|--------|
| `prop-types` | Replaced by TypeScript interfaces |
| `styled-components` | Redundant — Emotion is MUI's default |
| `draft-js` | Dead weight, not used in any active component |
| `normalize-url` | Crashes on relative URLs, use native `URL` constructor |
| `oidc-client-ts` | Redundant — `oauth4webapi` handles OAuth |
| `react-oidc-context` | Redundant — custom OAuth hooks already exist |
| `@mui/icons-material` | Replaced by Lucide React |

**Add:**
| Package | Purpose |
|---------|---------|
| `@tanstack/react-query` | Server state management |
| `@tanstack/react-query-devtools` | Dev-only query debugging |
| `zustand` | Client state (UI, notifications, sidebar) |
| `react-hook-form` | Form management |
| `zod` | Schema validation (forms + API responses) |
| `lucide-react` | Icon system |
| `react-error-boundary` | Error boundaries |
| `sonner` | Toast notifications (lightweight, accessible) |

### 3.5 Folder Structure

```
src/
├── app/                    # App shell, providers, router
│   ├── App.tsx
│   ├── Router.tsx          # React Router HashRouter
│   ├── Providers.tsx       # Flat: QueryClient + Auth + Theme (3 max)
│   └── theme/
│       ├── palette.ts
│       ├── typography.ts
│       └── theme.ts
│
├── features/               # Feature modules (lazy-loaded)
│   ├── apps/               # Installed apps + instances
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── api.ts          # TanStack Query hooks
│   │   └── index.ts
│   ├── marketplace/
│   ├── system/
│   ├── mesh/
│   ├── auth/
│   ├── onboarding/
│   └── notifications/      # Toast + job tracking (replaces quests)
│
├── shared/                 # Cross-feature utilities
│   ├── components/         # Button, Dialog, Toast, Card, Table
│   ├── hooks/
│   ├── api/                # Query client config, API wrapper
│   └── utils/
│
└── stores/                 # Zustand stores
    ├── ui.ts               # Sidebar, theme toggle
    └── notifications.ts    # Toast queue, active jobs
```

---

## 4. UX Redesign

### 4.1 Layout — The Control Tower

```
┌─────────────────────────────────────────────────────────────┐
│  ◆ FLECS                              [?] [🔔 3] [◐] [👤]  │  ← Header
├────────┬────────────────────────────────────────────────────┤
│        │                                                    │
│  Apps  │   Main Content Area                                │
│        │                                                    │
│  Market│   (full width, no wasted space)                    │
│        │                                                    │
│  Mesh  │                                                    │
│        │                                                    │
│  System│                                                    │
│        │                                                    │
├────────┤                                                    │
│        │                                                    │
│  ▼ Jobs│   ← Collapsible bottom rail                        │
│  3 act.│                                                    │
└────────┴────────────────────────────────────────────────────┘
```

- **Notification bell** with badge count replaces hidden QuestLog
- **Jobs panel** — collapsible bottom rail with progress bars (like a download manager)
- **Sidebar** — always visible on desktop, icons + labels, never collapses
- **No tabs inside pages** — every section gets its own route

### 4.2 Apps Page — Card Grid with Live Status

```
┌─────────────────────────────────────────────────┐
│ Installed Apps                    [+ Sideload]   │
│ 3 apps, 7 instances running                      │
├─────────────────────────────────────────────────┤
│ ┌──────────────┐ ┌──────────────┐ ┌────────────┐│
│ │ ● Node-RED   │ │ ● Mosquitto  │ │ ○ Grafana  ││
│ │ v3.1.0       │ │ v2.0.18      │ │ v10.2.0    ││
│ │              │ │              │ │            ││
│ │ 2 running    │ │ 1 running    │ │ stopped    ││
│ │ [Open UI]    │ │              │ │ [Start]    ││
│ │         [⋯]  │ │         [⋯]  │ │       [⋯]  ││
│ └──────────────┘ └──────────────┘ └────────────┘│
└─────────────────────────────────────────────────┘
```

- `●` green = running, `○` gray = stopped, `◉` red = error
- Primary action visible on card — "Open UI" or "Start"
- `[⋯]` menu: configure, logs, update, uninstall
- Click card → slide-over panel with full instance details (not modal)

### 4.3 Marketplace — Search-First

- **Full-width search bar** at top, auto-focused
- **Category chips** (horizontal scroll, not toggle panel)
- **Install button on card** — one click, version selector dropdown on card
- **Installed indicator** — green left border on installed apps
- Virtual list for performance (no pagination)

### 4.4 System Page — Single Dashboard

```
┌──────────────────────────────────────────────────┐
│ System                                            │
├──────────────┬───────────────────────────────────┤
│ Device       │ flecs-dev                          │
│ Platform     │ arm64 / Ubuntu 22.04              │
│ FLECS Core   │ v5.1.0 ✓ up to date              │
│ License      │ Pro Trial (29 days left)          │
│ Uptime       │ 3d 14h 22m                        │
├──────────────┴───────────────────────────────────┤
│ Quick Actions                                     │
│ [Export All]  [Import Config]  [Activate License] │
├──────────────────────────────────────────────────┤
│ Recent Exports                                    │
│ 2026-03-02  apps+instances  [Download]            │
│ 2026-02-28  apps only       [Download]            │
└──────────────────────────────────────────────────┘
```

No tabs. One page. Everything visible.

### 4.5 Onboarding — Route-Based, Not Modal

- First visit → `/onboarding` route (not a blocking modal)
- Step 1: Auth provider auto-configures. Show progress spinner.
- Step 2: Create admin. Single form, large inputs, password strength bar.
- Step 3: "You're ready" → one button → Apps page.
- Skip button always visible.
- Target: **under 30 seconds**.

### 4.6 Notifications & Job Tracking

- **sonner toast** (top-right) for instant feedback: "Node-RED installed"
- **Bottom rail** (collapsible) for active jobs with progress bars
- **Bell icon** with badge in header — click for dropdown with recent activity
- TanStack Query polling — only when tab is focused

### 4.7 Auth Flow (Polish Only)

No flow changes. Visual polish:
- Login page: centered card, gradient background
- Loading: skeleton shimmer, not spinner
- Error: clear message + retry + help text
- Token refresh: silent, in-memory

---

## 5. Migration Strategy

### Phase 0: Foundation ✅

- [x] **Vite 7 upgrade** — Vite 7.3.1 with Rolldown
- [x] **Brand theme** — FLECS palette, Inter font, 4px grid applied
- [x] **TanStack Query** — QueryClient configured (staleTime: 30s, retry: 1, refetchOnWindowFocus)
- [x] **Zustand** — `ui` store (sidebar, theme) + `notifications` store
- [x] **Error boundary** — `react-error-boundary` at app root
- [x] **Toast system** — `sonner` integrated
- [x] **Dependency cleanup** — removed `prop-types`, `styled-components`, `draft-js`, `normalize-url`, `oidc-client-ts`, `react-oidc-context`, `@mui/icons-material`

### Phase 1: Convert & Rewire ✅

- [x] **JSX → TSX** — all 85 files converted, PropTypes removed, interfaces added
- [x] **Disable `allowJs`** — `allowJs: false` in tsconfig
- [x] **TanStack Query hooks** — `useApps`, `useInstances`, `useInstanceDetail`, `useInstanceLogs`, `useStartInstance`, `useStopInstance`, `useDeleteInstance`, `useCreateInstance`, `useUninstallApp`, `useSystemPing`, `useSystemInfo`, `useSystemVersion`, `useLicenseStatus`, `useActivateDevice`, `useExports`, `useCreateExport`, `useMarketplaceProducts`
- [x] **Context providers internally rewired** — `SystemProvider` and `ReferenceDataContext` now powered by TanStack Query internally (backward-compatible shape preserved)
- [x] **Lucide React** — 100% migration, `@mui/icons-material` uninstalled
- [x] **Drop styled-components** — removed, Emotion only

### Phase 2: UX & Polish (in progress)

- [x] **Apps page** — card grid with live status dots, expand/collapse instances
- [x] **Marketplace** — search-first layout, category chips, inline install
- [x] **System page** — single dashboard, no tabs
- [x] **Onboarding** — route-based flow at `/onboarding`, skip button
- [x] **Notification rail** — collapsible bottom jobs panel
- [x] **Keyboard shortcuts** — Cmd+K command palette with search + navigation
- [ ] **Empty states** — illustrations + CTAs for every empty page
- [x] **Loading skeletons** — skeleton shimmer on all pages
- [x] **Responsive pass** — mobile drawer, hamburger menu, adaptive padding, full-width jobs rail
- [x] **Accessibility** — ARIA labels, roles, aria-expanded on all interactive elements

---

## 6. Success Metrics

| Metric | Current | Target |
|--------|---------|--------|
| Install an app | 4 clicks + modal | **1 click** from card |
| See instance status | Expand row → scan | **Visible on card** (0 clicks) |
| TypeScript coverage | 68% | **100% strict** |
| Context providers | 11+ nested | **3 flat** (Query + Auth + Theme) |
| Error boundaries | 0 | **Per-feature + root** |
| Bundle size (gzip) | ~320KB | **< 200KB initial** (needs code splitting) |
| Lighthouse Performance | Audit needed | **> 90** |
| Onboarding time | ~2 min | **< 30 seconds** |

---

## 7. Non-Goals

- **No micro-frontends** — feature code splitting is enough for this app size
- **No SSR/SSG** — device-local UI, SPA is correct
- **No GraphQL** — backend is REST, stay with REST
- **No WebSocket yet** — TanStack Query smart polling is sufficient, add SSE later
- **No design system package** — MUI theme tokens are enough
- **No router migration** — HashRouter works, CTO decision, focus on API layer first
- **No inline OpenAPI generation yet** — no specs available, keep external packages

---

## 8. Open Questions

1. **Marketplace OpenAPI spec** — does the marketplace backend have a spec? Needed for future inline generation.
2. **Service Mesh nav item** — remove from nav if it's just "go install the app"? Or keep as marketplace feature highlight?
3. **Dual auth unification** — OAuth (device) + Marketplace JWT (cloud) — should these merge into one session?

---

## 9. Brand Tokens

```typescript
// src/app/theme/palette.ts
export const brand = {
  primary:    '#FF2E63',
  primaryEnd: '#FF6B8A',
  dark:       '#0B0B18',
  darkEnd:    '#1A1A2E',
  white:      '#FFFFFF',
  muted:      '#6B7280',
  success:    '#10B981',
  warning:    '#F59E0B',
  error:      '#EF4444',
} as const;

export const gradients = {
  primary: 'linear-gradient(135deg, #FF2E63, #FF6B8A)',
  dark:    'linear-gradient(180deg, #0B0B18, #1A1A2E)',
} as const;
```

```typescript
// src/app/theme/typography.ts
export const typography = {
  fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
  fontFamilyMono: '"JetBrains Mono", "Fira Code", monospace',
  h1: { fontWeight: 700, fontSize: '48px' },
  h2: { fontWeight: 700, fontSize: '36px' },
  h3: { fontWeight: 700, fontSize: '32px' },
  h4: { fontWeight: 600, fontSize: '24px' },
  h5: { fontWeight: 600, fontSize: '20px' },
  body1: { fontWeight: 400, fontSize: '16px' },
  body2: { fontWeight: 400, fontSize: '14px' },
  caption: { fontWeight: 400, fontSize: '12px' },
} as const;
```
