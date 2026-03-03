# FLECS Webapp — Product Requirements Document

**Version:** 4.0
**Date:** 2026-03-03
**Status:** Active

---

## 1. Vision

> "Every click that doesn't deliver value is a failure of design."

FLECS is industrial device management. The webapp is a **control tower** — everything visible, nothing hidden, every action one click away. Dark-mode-first. Information-dense. Zero guesswork.

This is a **device-local SPA** served over LAN to operators managing IoT controllers. It is not a cloud SaaS product. Every architectural decision flows from this constraint.

---

## 2. Architectural Principles

### 2.1 Core Theories

These principles are not aspirational — they are enforced by the stack and validated against the codebase.

| Principle | Implementation | Status |
|-----------|---------------|--------|
| **Single Source of Truth** | Server state in TanStack Query cache. Client state in Zustand stores. Never duplicated. | Active |
| **Command-Query Separation** | `useQuery` = read. `useMutation` = write. No mixed hooks. | Active |
| **Colocation** | Feature code lives with its feature. No cross-feature imports. Shared code in `shared/`. | Active (36 violations remaining) |
| **Dependency Inversion** | Components depend on hooks, hooks depend on API abstractions, never the reverse. | Active |
| **Immutability** | Zustand `set()` produces new state references. TanStack Query cache is read-only. No direct mutation. | Active |
| **Referential Transparency** | Pure components receive props, produce JSX. Side effects live in hooks. | Active |
| **KISS** | Simplest solution that works. No premature abstractions. Three similar lines > one premature helper. | Enforced |

### 2.2 Layered Architecture

Unidirectional dependency flow — each layer may only import from layers below it.

```
┌─────────────────────────────────────────────┐
│  app/          Shell, providers, router      │ ← orchestration only
├─────────────────────────────────────────────┤
│  pages/        Thin composition layers       │ ← composes features
├─────────────────────────────────────────────┤
│  features/     Domain modules (self-contained)│ ← business logic
├─────────────────────────────────────────────┤
│  shared/       Cross-cutting utilities       │ ← no business logic
├─────────────────────────────────────────────┤
│  stores/       Zustand client state          │ ← pure state
└─────────────────────────────────────────────┘
```

**Rule:** `features/apps/` may never import from `features/marketplace/`. If two features need shared logic, it moves to `shared/`.

### 2.3 Component Normalization

| Type | Role | State | Example |
|------|------|-------|---------|
| **Page** | Composition layer | None — delegates to features | `InstalledApps.tsx` |
| **Container** | Data + logic | Hooks (useQuery, useStore) | `AppCardGrid.tsx` |
| **Presenter** | Pure render | Props only | `AppCard.tsx` |

Pages are thin. Containers fetch. Presenters render. This is the Container/Presenter pattern adapted for hooks.

---

## 3. Deployment Architecture

### 3.1 Why Single Bundle + HashRouter

This webapp is not deployed to a CDN. It is served from an IoT controller's local filesystem over LAN. This fundamentally changes the architecture:

| Decision | Rationale |
|----------|-----------|
| **HashRouter** (not BrowserRouter) | Hash fragment (`#/apps`) never leaves the browser. No server-side routing config needed. Device serves `index.html` for all paths. Works behind any reverse proxy without rewrite rules. Industry standard for embedded device UIs. |
| **Single bundle** (no code splitting) | 320KB gzip is served from a device on the same LAN — latency is <1ms. Code splitting adds `React.lazy()` + Suspense complexity for zero user-perceived benefit. The entire app loads in one request. No waterfall. No loading spinners between routes. |
| **Static SPA** | `dist/` is a flat directory of static files. No Node.js server. No SSR. Copied to device filesystem and served by nginx/lighttpd. |

**Research validation:** Single bundles under 500KB gzip are standard for embedded device UIs (Grafana embedded panels, Home Assistant frontend, Portainer CE). Code splitting provides measurable benefit only when bundles exceed 1MB+ and are served over high-latency connections.

### 3.2 Build Configuration

```typescript
// vite.config.ts — single chunk output
build: {
  rollupOptions: {
    output: { manualChunks: undefined }  // force single bundle
  },
  chunkSizeWarningLimit: 1200
}
```

| Metric | Value |
|--------|-------|
| Build tool | Vite 7.3.1 (Rolldown) |
| Bundle size | **320KB gzip** |
| Build time | **~2s** |
| Output | Single JS + single CSS + index.html |

---

## 4. Current State (Audited 2026-03-03)

### 4.1 Codebase Metrics

| Metric | Value |
|--------|-------|
| Total source files | ~270 |
| TypeScript coverage | **100%** (`allowJs: false`) |
| Provider nesting depth | **6 levels** (down from 11+) |
| Zustand stores | **6** (device-state, quests, ui, notifications, marketplace-filters, marketplace-user) |
| Error boundaries | **1** (root — `react-error-boundary`) |
| CSS-in-JS engine | **Emotion only** (styled-components removed) |
| Icon system | **Lucide React** (100% migrated, `@mui/icons-material` removed) |
| Test files | **61** |
| Test cases | **415** (100% pass rate) |
| Dead dependencies | **None** (all cleaned in Phase 0) |

### 4.2 Tech Stack (Current)

| Layer | Package | Version |
|-------|---------|---------|
| Build | Vite | 7.3.1 |
| Framework | React | 19.1 |
| UI Library | MUI | 7.3.4 |
| CSS-in-JS | Emotion | latest |
| Routing | React Router | 7.6.2 (HashRouter) |
| Server State | TanStack Query | v5 |
| Client State | Zustand | latest |
| Icons | Lucide React | latest |
| Error Handling | react-error-boundary | latest |
| Toasts | sonner | latest |
| Testing | Vitest 4.0.18 + RTL 16.3 | latest |

### 4.3 State Architecture

```
┌──────────────────────────────────────────────────────┐
│                    State Map                          │
├────────────────────┬─────────────────────────────────┤
│ Server State       │ TanStack Query cache             │
│ (API data)         │ useQuery / useMutation           │
│                    │ Cache keys: appKeys, systemKeys   │
├────────────────────┼─────────────────────────────────┤
│ Client State       │ Zustand stores                    │
│ (UI state)         │ ui.ts — sidebar, theme            │
│                    │ notifications.ts — toast queue     │
│                    │ device-state.ts — auth, onboarded  │
│                    │ quests.ts — job tracking            │
│                    │ marketplace-filters.ts — search     │
│                    │ marketplace-user.ts — user prefs    │
├────────────────────┼─────────────────────────────────┤
│ URL State          │ HashRouter — route = page          │
│                    │ No query params for app state      │
├────────────────────┼─────────────────────────────────┤
│ Form State         │ Component-local (useState)         │
│                    │ React Hook Form for complex forms   │
└────────────────────┴─────────────────────────────────┘
```

**Rule:** Server data is never copied into Zustand. TanStack Query is the single source of truth for anything that came from an API call.

### 4.4 Remaining Architecture Debt

| Problem | Impact | Fix |
|---------|--------|-----|
| 6 nested providers (target: 4) | Unnecessary re-render scope | Flatten auth + device state |
| 36 cross-feature imports across 29 files | Couples feature modules | Move shared logic to `shared/` |
| No empty states with CTAs | New users see blank pages | Add illustrations + action buttons |
| Quest polling via module-level Map | Not reactive, manual sync | Migrate to TanStack Query polling |
| Zod + React Hook Form installed but unused | No runtime validation at API boundaries | Wire Zod schemas for API responses + forms |

---

## 5. Folder Structure

```
src/
├── app/                      # App shell, providers, router
│   ├── App.tsx               # Root: ErrorBoundary → QueryClient → Providers
│   ├── Providers.tsx          # 6 providers (target: 4)
│   └── theme/
│       ├── palette.ts         # FLECS brand tokens
│       ├── typography.ts      # Inter + JetBrains Mono
│       ├── theme.ts           # MUI createTheme
│       └── WhiteLabelLogo.tsx
│
├── pages/                     # Thin composition layers (one per route)
│   ├── InstalledApps.tsx
│   ├── Marketplace.tsx
│   ├── ServiceMesh.tsx
│   ├── System.tsx
│   ├── Onboarding.tsx
│   ├── Profile.tsx
│   ├── DeviceLogin.tsx
│   ├── OAuthCallback.tsx
│   ├── NotFound.tsx
│   ├── OpenSource.tsx
│   └── ui-routes.tsx          # HashRouter route definitions
│
├── features/                  # Self-contained domain modules
│   ├── apps/                  # Installed apps + instances
│   │   ├── components/
│   │   ├── hooks.ts           # TanStack Query: useApps, useInstances, etc.
│   │   └── index.ts           # Public barrel export
│   ├── marketplace/           # App store + search
│   ├── system/                # Device info, exports, license
│   ├── auth/                  # OAuth, guards, device activation
│   ├── jobs/                  # Quest/job tracking (Zustand + polling)
│   ├── onboarding/            # First-run flow
│   └── notifications/         # Toast + notification rail
│
├── shared/                    # Cross-feature utilities (no business logic)
│   ├── components/            # Button, Dialog, Toast, Card, Layout
│   ├── api/                   # ApiProvider, useProtectedApi, usePublicApi
│   ├── hooks/
│   └── utils/
│
├── stores/                    # Zustand stores (pure state, no side effects)
│   ├── ui.ts
│   ├── notifications.ts
│   ├── device-state.ts
│   ├── quests.ts
│   ├── marketplace-filters.ts
│   └── marketplace-user.ts
│
├── __mocks__/                 # Centralized test mocks
│   ├── core-client-ts.ts
│   └── auth-provider-client-ts.ts
│
└── test/                      # Test infrastructure
    ├── setup.ts
    ├── test-utils.ts
    ├── oauth-test-utils.tsx
    └── README.md
```

---

## 6. API Client Strategy

**Current:** External packages `@flecs/core-client-ts` and `@flecs/auth-provider-client-ts` (openapi-generator 7.12.0, Axios-based).

**Integration pattern:**
```typescript
// Feature hook wraps external client with TanStack Query
export function useApps() {
  const api = useProtectedApi();
  return useQuery({
    queryKey: appKeys.list(),
    queryFn: () => api.apps.appsGet(),
    staleTime: 30_000,
  });
}
```

**Future (when OpenAPI specs available):** Generate inline with `@hey-api/openapi-ts` into `src/generated/`. Tree-shakeable, fetch-based, full type inference. Eliminates external package dependency.

---

## 7. UX Design

### 7.1 Layout — The Control Tower

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

### 7.2 Apps Page — Card Grid with Live Status

- `●` green = running, `○` gray = stopped, `◉` red = error
- Primary action visible on card — "Open UI" or "Start"
- `[⋯]` menu: configure, logs, update, uninstall
- Click card → slide-over panel with full instance details

### 7.3 Marketplace — Search-First

- Full-width search bar, auto-focused
- Category chips (horizontal scroll)
- Install button on card — one click, version dropdown
- Installed indicator — green left border

### 7.4 System — Single Dashboard

No tabs. One page. Device info, license, quick actions, recent exports — all visible.

### 7.5 Onboarding — Route-Based

- First visit → `/onboarding` route (not blocking modal)
- 3 steps: auth config → admin creation → ready
- Skip button always visible
- Target: **under 30 seconds**

### 7.6 Notifications

- **sonner toast** (top-right) for instant feedback
- **Bottom rail** (collapsible) for active jobs with progress bars
- **Bell icon** with badge — click for recent activity dropdown
- TanStack Query polling — pauses when tab is hidden

---

## 8. Completed Phases

### Phase 0: Foundation ✅

- [x] Vite 7.3.1 with Rolldown
- [x] Brand theme — FLECS palette, Inter font, 4px grid
- [x] TanStack Query v5 — QueryClient configured (staleTime: 30s, retry: 1)
- [x] Zustand — 6 stores
- [x] react-error-boundary at root
- [x] sonner toast system
- [x] Dependency cleanup — removed `prop-types`, `styled-components`, `draft-js`, `normalize-url`, `oidc-client-ts`, `react-oidc-context`, `@mui/icons-material`

### Phase 1: TypeScript + API Layer ✅

- [x] 100% TypeScript — 91 file renames, PropTypes removed, interfaces added
- [x] `allowJs: false` in tsconfig
- [x] TanStack Query hooks for all features (apps, system, marketplace)
- [x] Lucide React — 100% migration
- [x] Emotion-only CSS-in-JS

### Phase 2: UX Redesign ✅

- [x] Apps page — card grid with live status
- [x] Marketplace — search-first, category chips, inline install
- [x] System page — single dashboard
- [x] Onboarding — route-based flow
- [x] Notification rail — collapsible bottom panel
- [x] Keyboard shortcuts — Cmd+K command palette
- [x] Loading skeletons on all pages
- [x] Responsive — mobile drawer, hamburger, adaptive padding
- [x] Accessibility — ARIA labels, roles, aria-expanded

### Phase 2.5: Test Infrastructure ✅

- [x] Deleted 30 broken test files (imported dead modules)
- [x] Fixed 5 failing tests (moved imports, changed button text, constructor mocks)
- [x] Cleaned dead code (QuestContext, DeviceStateProvider, old mocks)
- [x] Rewrote test-utils for Zustand + hooks
- [x] Smoke tests for all 6 Zustand stores (31 tests)
- [x] Component smoke tests (3 tests)
- [x] **61 files, 415 tests, 100% pass rate**

### Phase 3: Wire TanStack Query into Components ✅

- [x] Legacy `src/data/AppList.tsx` and `src/data/SystemData.tsx` deleted — replaced by TanStack Query hooks
- [x] All data fetching uses `useQuery` / `useMutation` hooks (useApps, useInstances, useSystemInfo, etc.)
- [x] Smart polling configured: apps (10s), instances (5s), system ping (30s) via `refetchInterval`
- [x] Remaining `useState` + `useEffect` is local UI state only (modals, forms) — not data fetching

---

## 9. Remaining Phases

### Phase 4: Provider Flattening

**Goal:** Reduce provider nesting from 6 to 4.

| Current Provider | Action |
|-----------------|--------|
| QueryClientProvider | Keep — TanStack Query requires it |
| ThemeHandler | Keep — MUI theming |
| PublicApiProvider | Keep — public API access |
| PublicAuthProviderApiProvider | **Merge into PublicApiProvider** |
| OAuth4WebApiAuthProvider | Keep — auth context |
| ProtectedApiProvider | Keep — authenticated API access |
| OnboardingGuard | **Convert to route-level guard** (not a provider) |
| DeviceActivationProvider | **Merge into OAuth4WebApiAuthProvider** |

**Pattern:** Use a `composeProviders` utility to flatten remaining providers:
```typescript
const Providers = composeProviders(
  [QueryClientProvider, { client: queryClient }],
  [ThemeProvider, { theme }],
  [AuthProvider],
  [HashRouter],
);
```

### Phase 5: Cross-Feature Import Cleanup

**Goal:** Zero cross-feature imports. Features are self-contained modules.

Current violations (36 imports across 29 files):
- `features/apps/` importing from `features/jobs/` (7 instances)
- `features/apps/` importing from `features/system/` (4 instances)
- `features/marketplace/` importing from `features/apps/` (3 instances)
- `features/marketplace/` importing from `features/system/` (2 instances)
- `features/system/` importing from `features/jobs/` (4 instances)
- `features/system/` importing from `features/apps/` (2 instances)
- `features/onboarding/` importing from `features/auth/` (1 instance)
- `features/onboarding/` importing from `features/jobs/` (1 instance)
- `features/notifications/` importing from `features/jobs/` (1 instance)

**Resolution pattern:** Extract shared types/hooks to `shared/`:
```
features/apps/hooks.ts imports from features/jobs/hooks.ts
→ Move shared quest types to shared/types/quest.ts
→ Both features import from shared/
```

### Phase 6: Polish

- [ ] Empty states — illustrations + CTAs for every page when no data (Apps + Marketplace done, others missing)
- [ ] Per-feature error boundaries (currently only root)
- [ ] Quest polling migration from module-level Map to TanStack Query
- [ ] Type safety at boundaries — wire Zod schemas for API response validation (Zod installed, zero usage)
- [ ] Form validation with React Hook Form + Zod for complex forms (RHF installed, zero usage)

---

## 10. Success Metrics

| Metric | Baseline (pre-redesign) | Current | Target |
|--------|------------------------|---------|--------|
| TypeScript coverage | 68% | **100%** | 100% ✅ |
| Bundle size (gzip) | ~320KB | **320KB** | < 400KB (single bundle) |
| Build time | ~4s | **~2s** | < 3s ✅ |
| Provider nesting | 11+ levels | **6** | 4 |
| Zustand stores | 0 | **6** | 6 ✅ |
| Error boundaries | 0 | **1** | Per-feature + root |
| Test files | ~30 broken | **61** | 80+ |
| Test cases | unknown | **415** | 600+ |
| Pass rate | unknown | **100%** | 100% ✅ |
| Cross-feature imports | unknown | **36** | 0 |
| Install an app | 4 clicks | **1 click** | 1 click ✅ |
| See instance status | Expand row | **Visible on card** | 0 clicks ✅ |
| Onboarding time | ~2 min | **< 30s** | < 30s ✅ |

---

## 11. Non-Goals

| Decision | Rationale |
|----------|-----------|
| **No code splitting** | 320KB gzip on LAN. React.lazy adds complexity for zero user benefit. Revisit only if bundle exceeds 800KB. |
| **No SSR/SSG** | Device-local SPA. No server rendering needed. |
| **No BrowserRouter** | HashRouter is correct for device-local deployment. Hash never sent to server. No rewrite rules needed. |
| **No GraphQL** | Backend is REST. Stay with REST. |
| **No WebSocket** | TanStack Query smart polling is sufficient. Add SSE if polling proves insufficient. |
| **No micro-frontends** | App is <400KB. Feature modules provide sufficient isolation. |
| **No design system package** | MUI theme tokens + `sx` prop is enough. |
| **No inline OpenAPI generation** | Specs not yet available. Keep external `@flecs/core-client-ts`. |

---

## 12. Open Questions

1. **Marketplace OpenAPI spec** — does the marketplace backend have a spec? Needed for future inline generation.
2. **Service Mesh nav item** — remove from nav if it's just "go install the app"? Or keep as marketplace feature highlight?
3. **Dual auth unification** — OAuth (device) + Marketplace JWT (cloud) — should these merge into one session?

---

## 13. Brand Tokens

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

## Appendix A: Architecture Decision Records

### ADR-001: HashRouter over BrowserRouter

**Context:** Device-local SPA served from IoT controller filesystem.
**Decision:** HashRouter.
**Rationale:** Hash fragments (`#/apps`) are client-only — they never reach the server. This means:
- No server-side routing configuration needed
- Works behind any reverse proxy without URL rewrite rules
- Works with `file://` protocol during development
- Standard pattern for embedded device UIs (Portainer, Home Assistant, Grafana embedded)

### ADR-002: Single Bundle over Code Splitting

**Context:** 320KB gzip bundle served over LAN (<1ms latency).
**Decision:** Single bundle, no `React.lazy()`.
**Rationale:**
- Code splitting benefits are proportional to latency × bundle size
- On LAN, latency is negligible — the entire 320KB loads in <50ms
- Code splitting introduces: Suspense boundaries, loading states between routes, chunk loading failures, increased build complexity
- Industry precedent: Grafana, Portainer, and Home Assistant all ship single bundles for embedded/local deployment
- **Revisit trigger:** Bundle exceeds 800KB gzip

### ADR-003: Zustand + TanStack Query over Context Providers

**Context:** 11+ nested React Context providers causing cascade re-renders and testing difficulty.
**Decision:** TanStack Query for server state, Zustand for client state.
**Rationale:**
- TanStack Query provides caching, deduplication, background refetch, and smart polling — none of which Context provides
- Zustand stores are singleton modules — no Provider component needed, testable with `getState()`/`setState()`
- Combined, they replace 7+ Context providers with 0 additional Provider components (only QueryClientProvider)
- This is the 2025-2026 industry standard pairing for React applications

### ADR-004: External API Client Packages

**Context:** `@flecs/core-client-ts` and `@flecs/auth-provider-client-ts` are external npm packages generated with openapi-generator.
**Decision:** Keep external packages, wrap with TanStack Query hooks.
**Rationale:**
- Changing API client strategy while redesigning the entire frontend is too much scope
- The external packages work correctly and are type-safe
- TanStack Query hooks provide the caching/polling layer on top
- **Future migration:** When OpenAPI specs are directly available, generate inline with `@hey-api/openapi-ts` for tree-shaking and fetch-based transport
