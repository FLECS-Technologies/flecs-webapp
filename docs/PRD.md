# FLECS Webapp — Product Requirements Document

**Version:** 2.0
**Date:** 2026-03-02
**Author:** Head of Dev / UX Architecture
**Status:** Draft for CTO Review

---

## 1. Vision

> "Every click that doesn't deliver value is a failure of design."

FLECS is industrial device management. The webapp should feel like a **control tower** — everything visible, nothing hidden, every action one click away. Dark-mode-first. Information-dense. Zero guesswork.

The current webapp works. The next version must be **immersive**.

---

## 2. What's Wrong Today

### 2.1 Architecture Debt

| Problem | Impact |
|---------|--------|
| Mixed JS/TS (60% JSX, 40% TSX) | No type safety on critical paths |
| 9 nested context providers | Deep coupling, hard to test, re-renders cascade |
| Manual state management everywhere | No caching, no deduplication, 500ms polling loops |
| OpenAPI client is auto-generated but used with raw Axios | Lose type inference at call sites |
| `normalizeUrl` dependency causes crashes with relative URLs | Dev setup broke because of this |
| Marketplace API uses separate hand-rolled Axios calls | Inconsistent patterns, no types |
| No error boundaries | One crash kills the whole app |
| `throw 'string'` in production code | Silent failures, no stack traces |

### 2.2 UX Debt

| Problem | Impact |
|---------|--------|
| Installed Apps is a table — buried actions behind expandable rows | Users can't see instance status at a glance |
| Marketplace cards don't show install state clearly | Users don't know what's running |
| System page has two tabs with almost nothing in them | Wasted real estate |
| Service Mesh page is basically empty ("go install it") | Dead navigation item |
| No global toast/notification system | Users don't know if actions succeeded |
| Quest log is hidden behind a tiny AppBar icon | Users miss job progress |
| Onboarding is a modal dialog that blocks the entire UI | Feels like a setup wizard from 2005 |
| Profile page is a dead end — no meaningful actions | Just shows JWT claims |
| No keyboard shortcuts | Power users are slowed down |
| No empty states with clear CTAs | New users see blank pages |

### 2.3 Brand Misalignment

| Current | Brand Guidelines |
|---------|-----------------|
| Background: `#0A0A0A` | Should be: `#0B0B18` (FLECS Black) |
| Primary: generic MUI blue/red | Should be: `#FF2E63` (FLECS Red) |
| Font: system default | Should be: Inter + JetBrains Mono |
| Light-mode-first | Should be: Dark-mode-first |
| No gradient usage | Should use: `#FF2E63 → #FF6B8A` (135deg) |
| 8px spacing | Should be: 4px base grid |

---

## 3. Target Architecture

### 3.1 Principles

1. **One click away** — Every primary action visible. No hunting.
2. **Anti-monolithic** — Feature-based modules, lazy-loaded, independently testable.
3. **Type-safe end-to-end** — OpenAPI spec → generated client → typed hooks → typed components.
4. **Server state is not app state** — TanStack Query owns API data. Local state stays local.
5. **Dark-mode-first** — Design for `#0B0B18`, adapt to light.

### 3.2 Tech Stack (Updated)

| Layer | Current | Target | Why |
|-------|---------|--------|-----|
| Build | Vite 6.4 | Vite 6.x (latest) | Already current, keep updated |
| Framework | React 19 | React 19 | Keep, leverage `use()` and Actions |
| Language | JS + TS mixed | **100% TypeScript strict** | Kill `any`, kill `.jsx` |
| Styling | MUI `sx` prop + styled-components | **MUI v7 + CSS Modules** | Drop styled-components, use MUI theme tokens |
| API Client | `@flecs/core-client-ts` (Axios-based) | **@hey-api/openapi-ts** | Tree-shakeable, fetch-based, generates types + runtime |
| Server State | React Context + manual fetch | **TanStack Query v5** | Caching, deduplication, background refetch, optimistic updates |
| Client State | React Context (9 providers) | **Zustand** (2-3 stores max) | Flat, no provider nesting, selectors prevent re-renders |
| Routing | React Router v7 + HashRouter | **React Router v7 + BrowserRouter** | Clean URLs, proper OAuth callbacks |
| Forms | Manual useState | **React Hook Form + Zod** | Validation, performance, less boilerplate |
| Real-time | 500ms `setInterval` polling | **TanStack Query polling + future SSE** | Smart polling (only when visible), pause on blur |
| Error Handling | `console.error` | **Error boundaries + toast system** | Users see errors, devs get stack traces |
| Icons | MUI Icons | **Lucide React** (line-style, 1.5px stroke) | Matches brand guidelines |

### 3.3 Folder Structure (Feature-Based)

```
src/
├── app/                    # App shell, providers, router
│   ├── App.tsx
│   ├── Router.tsx
│   ├── Providers.tsx       # Flat: QueryClient + Auth + Theme
│   └── theme/              # MUI theme, tokens, brand colors
│       ├── palette.ts      # FLECS color palette
│       ├── typography.ts   # Inter + JetBrains Mono
│       └── theme.ts        # createTheme with dark/light
│
├── features/               # Feature modules (lazy-loaded)
│   ├── apps/               # Installed apps + instances
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── api.ts          # TanStack Query hooks for apps
│   │   └── index.ts
│   │
│   ├── marketplace/        # Browse + install
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── api.ts
│   │   └── index.ts
│   │
│   ├── system/             # Device info, exports, license
│   ├── mesh/               # Service mesh
│   ├── auth/               # OAuth, profile, guards
│   ├── onboarding/         # Setup wizard
│   └── quests/             # Job tracking, notifications
│
├── shared/                 # Shared across features
│   ├── components/         # Button, Dialog, Toast, Card, Table
│   ├── hooks/              # useToast, useDebounce, useKeyboard
│   ├── api/                # Generated OpenAPI client, base config
│   └── utils/
│
└── generated/              # Auto-generated from OpenAPI spec
    ├── flecs-core/         # From FLECS Core OpenAPI
    └── auth-provider/      # From Auth Provider OpenAPI
```

---

## 4. UX Redesign

### 4.1 Layout — The Control Tower

```
┌─────────────────────────────────────────────────────────────┐
│  ◆ FLECS                              [?] [🔔 3] [◐] [👤]  │  ← Header: logo, help, notifications, theme, avatar
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
│  ▼ Jobs│   ← Collapsible job/quest panel (bottom rail)      │
│  3 act.│                                                    │
└────────┴────────────────────────────────────────────────────┘
```

**Key changes:**
- **Notification bell** replaces hidden QuestLog icon — badge shows active count
- **Jobs panel** — collapsible bottom rail shows active operations (like a download manager)
- **Sidebar** — always visible, never collapses on desktop. Icons + labels.
- **No tabs inside pages** — every section gets its own route

### 4.2 Apps Page — The Dashboard

Current: Table with expandable rows. Hidden instance details.

**Redesign: Card grid with live status.**

```
┌─────────────────────────────────────────────────┐
│ Installed Apps                    [+ Sideload]   │
│ 3 apps, 7 instances running                      │
├─────────────────────────────────────────────────┤
│ ┌──────────────┐ ┌──────────────┐ ┌────────────┐│
│ │ ◉ Node-RED   │ │ ◉ Mosquitto  │ │ ○ Grafana  ││
│ │ v3.1.0       │ │ v2.0.18      │ │ v10.2.0    ││
│ │              │ │              │ │            ││
│ │ ● 2 running  │ │ ● 1 running  │ │ ○ stopped  ││
│ │ ▸ Open UI    │ │              │ │ ▸ Start    ││
│ │              │ │              │ │            ││
│ │ [⋯]         │ │ [⋯]         │ │ [⋯]       ││
│ └──────────────┘ └──────────────┘ └────────────┘│
└─────────────────────────────────────────────────┘
```

**Rules:**
- Green dot `●` = running. Gray dot `○` = stopped. Red dot `◉` = error.
- **Primary action visible on card** — "Open UI" if running, "Start" if stopped.
- `[⋯]` menu for secondary actions: configure, logs, update, uninstall.
- Click card → **slide-over panel** (not modal) with full instance details.
- Instance count and status visible at a glance — no expanding rows.

### 4.3 Marketplace — The App Store

Current: Card grid with category filters. Working OK.

**Refinements:**

- **Search is the hero** — full-width search bar at top, auto-focus on page load
- **Smart filters** — categories as horizontal chips (not a toggle panel)
- **Install button directly on card** — one click, not "MORE DETAILS" → modal → install
- **Status overlay** — installed apps show a subtle green border, not just a chip
- **Version selector on card** — dropdown before install, not hidden in modal
- Infinite scroll instead of pagination (or virtual list for performance)

### 4.4 System Page — Device Overview

Current: Two tabs (System Info, Exports) with minimal content.

**Redesign: Single page, information-dense dashboard.**

```
┌──────────────────────────────────────────────────┐
│ System                                            │
├──────────────┬───────────────────────────────────┤
│ Device       │ flecs-dev                          │
│ Platform     │ arm64 / Ubuntu 22.04              │
│ FLECS Core   │ v5.1.0-red-deer ✓ up to date     │
│ License      │ Pro Trial (29 days left)          │
│ Uptime       │ 3d 14h 22m                        │
├──────────────┴───────────────────────────────────┤
│                                                    │
│ Quick Actions                                      │
│ [Export All]  [Import Config]  [Activate License]  │
│                                                    │
├────────────────────────────────────────────────────┤
│ Recent Exports                                     │
│ ┌────────────────────────────────────────────────┐ │
│ │ 2026-03-02 14:30  apps+instances  [Download]   │ │
│ │ 2026-02-28 09:15  apps only       [Download]   │ │
│ └────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────┘
```

### 4.5 Onboarding — Zero Friction

Current: Full-screen modal dialog with 3 steps.

**Redesign: Inline page flow, not a blocking modal.**

- First visit → `/onboarding` route (not a modal overlay)
- Step 1: Auth provider auto-configures silently. Show progress, not a form.
- Step 2: Create admin account. Single form, large inputs, password strength.
- Step 3: "You're ready" → one button → goes to Apps page.
- **Skip button always visible** for dev/testing.
- Total time target: **under 30 seconds**.

### 4.6 Notifications & Job Tracking

Current: QuestLog hidden behind AppBar icon. 500ms polling.

**Redesign: Persistent bottom rail + toast notifications.**

- **Toast** (top-right) for immediate feedback: "Node-RED installed", "Export complete"
- **Bottom rail** (collapsible) for active jobs with progress bars
- **Notification bell** with badge count in header
- Click bell → dropdown with recent activity (last 10 items)
- TanStack Query handles polling — only when tab is focused

### 4.7 Auth Flow

Current: DeviceLogin page → OAuth redirect → callback. Works but fragile.

**Improvements (no flow change, just polish):**
- Login page: large centered card, gradient background (`#0B0B18 → #1A1A2E`)
- Loading state: skeleton shimmer, not spinner
- Error state: clear message + retry button + "Check backend connection" help text
- Token refresh: silent, in-memory (not sessionStorage for access tokens)
- Session timeout: gentle warning 5 min before expiry

---

## 5. Migration Strategy

### Phase 0: Foundation (Week 1-2)
- [ ] Apply brand theme (colors, fonts, spacing) to existing MUI theme
- [ ] Set up `tsconfig.json` strict mode
- [ ] Add TanStack Query provider (alongside existing contexts)
- [ ] Add Zustand store for UI state (sidebar, theme, notifications)
- [ ] Add error boundary at app root
- [ ] Add toast notification system (shared component)
- [ ] Switch from HashRouter to BrowserRouter

### Phase 1: API Layer (Week 3-4)
- [ ] Generate new API client with `@hey-api/openapi-ts` from OpenAPI spec
- [ ] Create TanStack Query hooks for each API domain (apps, instances, system, quests)
- [ ] Migrate Marketplace API to generated client (add OpenAPI spec or type manually)
- [ ] Replace 500ms polling with TanStack Query `refetchInterval` (smart polling)
- [ ] Remove `normalizeUrl` dependency — use `URL` constructor directly

### Phase 2: Feature Migration (Week 5-8)
- [ ] Convert all `.jsx` files to `.tsx` with strict types
- [ ] Migrate Apps page to card grid layout
- [ ] Migrate System page to single-page dashboard
- [ ] Migrate Marketplace to refined card grid with inline install
- [ ] Replace onboarding modal with route-based flow
- [ ] Build notification rail + toast system
- [ ] Kill all 9 context providers → TanStack Query + 2 Zustand stores

### Phase 3: Polish (Week 9-10)
- [ ] Responsive design pass (mobile/tablet)
- [ ] Keyboard shortcuts (Cmd+K for search, etc.)
- [ ] Empty states with illustrations and CTAs
- [ ] Loading skeletons for every page
- [ ] Accessibility audit (ARIA, focus management, contrast)
- [ ] Performance audit (bundle size, lazy loading, tree shaking)

---

## 6. Success Metrics

| Metric | Current | Target |
|--------|---------|--------|
| Time to install an app | 4 clicks + modal | **1 click** from marketplace card |
| Time to see instance status | Expand row → scan sub-table | **Visible on card** (0 clicks) |
| Bundle size (gzip) | TBD — audit needed | **< 200KB initial** |
| Lighthouse Performance | TBD | **> 90** |
| TypeScript coverage | ~40% | **100% strict** |
| Test coverage | TBD | **> 70%** |
| Time to onboard | ~2 min (3 modal steps) | **< 30 seconds** |

---

## 7. Non-Goals

- **No micro-frontend split** — the app is small enough for a single SPA. Feature-based code splitting is sufficient.
- **No SSR/SSG** — this is a device-local UI, not a public website. SPA is correct.
- **No design system package** — MUI + theme tokens is enough. Don't over-abstract.
- **No GraphQL** — the backend is REST with OpenAPI. Stay with REST.
- **No WebSocket (yet)** — TanStack Query smart polling is good enough for now. Add SSE later when the backend supports it.

---

## 8. Open Questions

1. **BrowserRouter migration** — the backend nginx serves the app from `/ui/`. BrowserRouter needs nginx `try_files` for all routes. Is the nginx config in our control?
2. **Marketplace OpenAPI spec** — does the marketplace backend (`console.flecs.tech`) have an OpenAPI spec? If not, should we type it manually or create one?
3. **Service Mesh page** — should it remain a navigation item if it's just "go install the app"? Consider removing it from nav and showing it as a marketplace feature.
4. **Dual auth** — the app has OAuth (device) + Marketplace JWT (cloud). Should these be unified?

---

## 9. Brand Token Reference

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

---

*"Design is not just what it looks like and feels like. Design is how it works." — Steve Jobs*
