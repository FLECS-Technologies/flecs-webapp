# FLECS Webapp — Codebase Restructuring PRD

**Version:** 5.0 SMART
**Date:** 2026-03-03
**Status:** CTO Review
**Predecessor:** PRD v3.0 (UX Redesign — Phases 0-2 complete), PRD v4.0 (Restructuring)

---

## 1. Executive Summary

Phases 0-2 delivered Vite 7, 100% TypeScript, TanStack Query hooks, Zustand stores, Lucide icons, and a full UX redesign. But new code was layered on old structure — the result is a **hybrid codebase** that ships but cannot scale.

This PRD defines a **SMART migration** (Specific, Measurable, Achievable, Relevant, Time-bound) from the current monolithic `src/components/` God directory to a hexagonal, feature-sliced architecture with enforced dependency boundaries, normalized state, and route-level code splitting.

---

## 2. Theoretical Foundations

These are not aspirational — they are **enforceable rules** baked into linting, types, and folder structure.

### 2.1 Hexagonal Architecture (Ports & Adapters)

The application core (features) never imports infrastructure directly. External systems (API clients, localStorage, WebSocket) are accessed through **ports** (TypeScript interfaces) and **adapters** (concrete implementations).

```
┌─────────────────────────────────────────────┐
│                   app/                       │  ← Composition root
├─────────────────────────────────────────────┤
│               pages/                         │  ← Thin route shells
├─────────────────────────────────────────────┤
│             features/                        │  ← Domain logic
│   ┌─────────┐  ┌─────────┐  ┌──────────┐   │
│   │  apps   │  │ market  │  │  system   │   │
│   │         │  │  place  │  │           │   │
│   └────┬────┘  └────┬────┘  └─────┬─────┘   │
│        │            │             │          │
│     PORTS (hooks.ts = read/write interface)  │
│        │            │             │          │
├────────┴────────────┴─────────────┴──────────┤
│              shared/                         │  ← Adapters + utilities
│   api/ (Axios adapters)                      │
│   lib/ (external integrations)               │
│   components/ (generic UI)                   │
└─────────────────────────────────────────────┘
```

**Rule:** Features never import from `shared/api/` directly. They import from their own `hooks.ts` which wraps TanStack Query, which calls `api.ts`, which calls the adapter.

### 2.2 Command-Query Separation (CQS)

Every data operation is either a **query** (read, idempotent, cacheable) or a **command** (write, side-effecting, invalidates cache). Never both.

```typescript
// QUERY — pure read, cached, background-refetchable
const { data: apps } = useApps();

// COMMAND — side effect, invalidates queries on success
const { mutate: installApp } = useInstallApp({
  onSuccess: () => queryClient.invalidateQueries({ queryKey: appKeys.all })
});
```

**Enforced by:** TanStack Query's `useQuery` / `useMutation` split. No `useState` + `useEffect` for server data.

### 2.3 Dependency Inversion

Components depend on **hook abstractions**, never on fetch implementations or API clients. The hook is the port; the API call is the adapter.

```
Component → useApps() → TanStack Query → api.ts → @flecs/core-client-ts
    ↑                                                        ↑
 depends on                                           swappable adapter
 hook interface                                      (mock in tests)
```

**Enforced by:** ESLint `import/no-restricted-paths` — components cannot import from `api/` or `lib/`.

### 2.4 Component Normalization (Container / Presenter)

Every non-trivial component splits into:

| Type | Responsibility | Imports hooks? | Has side effects? | Testable with? |
|------|---------------|---------------|-------------------|---------------|
| **Container** | Data fetching, mutations, orchestration | Yes | Yes | Integration test |
| **Presenter** | Pure rendering from props | No | No | Snapshot / unit test |

```typescript
// Container — owns data
function AppCardContainer({ appKey }: { appKey: AppKey }) {
  const { data: app } = useAppDetail(appKey);
  const { mutate: start } = useStartInstance();
  return <AppCardPresenter app={app} onStart={start} />;
}

// Presenter — pure props, zero hooks except useState for local UI
function AppCardPresenter({ app, onStart }: AppCardPresenterProps) {
  return <Card>...</Card>;
}
```

**Rule:** Presenters in `components/`. Containers either inline in pages or as `*.container.tsx` files.

### 2.5 State Normalization (3NF Analog)

State is split by **ownership** and **lifecycle**, never duplicated:

| State type | Owner | Tool | Example |
|-----------|-------|------|---------|
| **Server state** | Remote API | TanStack Query | Apps, instances, system info |
| **Client state** | User session | Zustand | Sidebar open, theme, filters |
| **URL state** | Address bar | HashRouter search params | Active tab, search query |
| **Local state** | Single component | `useState` | Dialog open, hover state |

**Rules:**
1. Server state is **never** copied into Zustand or useState. Components read from TanStack Query cache.
2. Zustand stores are **flat** — no nested objects deeper than 2 levels. Selectors pick atomic values.
3. Derived data is **computed** (useMemo / selector), never stored.

### 2.6 Type System as Schema

TypeScript types are the single source of truth. No runtime shape validation inside the app boundary — trust the API client types. Validate only at system edges.

```typescript
// Discriminated union for async state — no boolean flags
type AsyncState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: Error };

// Query key factory — fully typed, prevents key collisions
const appKeys = {
  all:      ['apps'] as const,
  lists:    () => [...appKeys.all, 'list'] as const,
  detail:   (key: AppKey) => [...appKeys.all, 'detail', key] as const,
  instances:(appKey: AppKey) => [...appKeys.all, 'instances', appKey] as const,
} as const;
```

### 2.7 Immutability & Referential Transparency

- All Zustand state updates use **immer** or spread — never mutate.
- TanStack Query cache is immutable by default.
- Utility functions are **pure** — same input, same output, no side effects.
- `as const` on all constant objects and arrays.

---

## 3. Current State (Post-Phase 2 Audit)

### 3.1 Numbers

| Metric | Value |
|--------|-------|
| Total source files (TS/TSX) | 312 |
| Files in `src/components/` | **178 (57%)** |
| Files in `src/features/` | 26 (8%) |
| Files in `src/contexts/` | 29 |
| Files in `src/api/` | 20 |
| Files in `src/pages/` | 19 |
| Test files | 94 |
| Nested context providers | **10 levels** |
| React.lazy / code splitting | **0** |
| Bundle size (gzip) | **320KB single chunk** |
| `@contexts/` imports across codebase | **112** |

### 3.2 Structural Debt

| Problem | Impact | Severity |
|---------|--------|----------|
| `src/components/` is a God directory (178 files, 12 subdirs) | No feature ownership. Adding a feature means touching files across 4+ directories | Critical |
| Features import from components (`features/ → components/`) | 12 files violate dependency direction. Features should own their components | High |
| 10 nested context providers in `Providers.tsx` | Cascade re-renders, deep coupling, impossible to test in isolation | High |
| Zero code splitting — 320KB single chunk | Every user downloads everything. Marketplace code loads on Apps page | High |
| API layer scattered across 3 locations (`api/`, `data/`, `contexts/data/`) | No single source of truth for data fetching. Duplicated logic | High |
| `src/models/` is a shared grab-bag (6 files) | Types not co-located with the features that own them | Medium |
| `src/data/` still has legacy `AppList.tsx` and `SystemData.tsx` | Dead code superseded by TanStack Query | Medium |
| `src/whitelabeling/` is orphaned (3 files) | Not integrated into theme system | Low |

### 3.3 Dependency Direction Violations

```
CORRECT:   app → pages → features → shared
CURRENT:   pages → components ← features → contexts → data
                      ↑                      ↑
                      └── everything imports everything
```

### 3.4 What We Got Right

- TanStack Query hooks exist (`features/{apps,system,marketplace}/hooks.ts`)
- Zustand stores are clean (`stores/ui.ts`, `stores/notifications.ts`)
- Feature barrel exports work (`features/*/index.ts`)
- Brand tokens centralized (`styles/tokens.tsx`)
- Layout shell is solid (AppBar, Drawer, Frame, CommandPalette)
- 94 test files — good coverage foundation

---

## 4. Target Architecture

### 4.1 Folder Structure

```
src/
├── app/                          # Composition root — boots the application
│   ├── App.tsx                   # Root component (< 30 lines)
│   ├── Router.tsx                # HashRouter + React.lazy route definitions
│   ├── Providers.tsx             # Max 4: QueryClient, Auth, API, Theme
│   └── theme/
│       ├── palette.ts            # Brand colors (from tokens.tsx)
│       ├── typography.ts         # Inter + JetBrains Mono
│       └── theme.ts              # MUI createTheme composition
│
├── features/                     # Domain modules — vertical slices
│   ├── apps/
│   │   ├── components/           # Presenters: AppCard, AppGrid, InstanceRow
│   │   ├── hooks.ts              # PORTS: useApps, useInstances, mutations
│   │   ├── api.ts                # ADAPTER: thin wrappers around @flecs/core-client-ts
│   │   ├── keys.ts               # Query key factory
│   │   ├── types.ts              # App, Instance, AppKey interfaces
│   │   ├── index.ts              # Public barrel (only exported API)
│   │   └── __tests__/
│   │
│   ├── marketplace/
│   │   ├── components/           # MarketplaceCard, MarketplaceGrid, Search
│   │   ├── hooks.ts              # useMarketplaceProducts, useInstallApp
│   │   ├── api.ts                # Replaces ProductService.ts
│   │   ├── keys.ts
│   │   ├── types.ts              # Product, Category
│   │   ├── index.ts
│   │   └── __tests__/
│   │
│   ├── system/
│   │   ├── components/           # SystemDashboard, ExportList, LicenseCard
│   │   ├── hooks.ts              # useSystemInfo, useExports, useLicense
│   │   ├── api.ts
│   │   ├── keys.ts
│   │   ├── types.ts
│   │   ├── index.ts
│   │   └── __tests__/
│   │
│   ├── auth/
│   │   ├── components/           # LoginForm, ProfileCard
│   │   ├── hooks.ts              # useAuth, useSession
│   │   ├── providers/            # AuthProvider (merged OAuth + DeviceState)
│   │   ├── types.ts
│   │   ├── index.ts
│   │   └── __tests__/
│   │
│   ├── jobs/                     # Replaces quests
│   │   ├── components/           # JobsRail, JobEntry
│   │   ├── hooks.ts              # useJobs, useJobProgress
│   │   ├── types.ts
│   │   ├── index.ts
│   │   └── __tests__/
│   │
│   ├── onboarding/
│   │   ├── components/
│   │   ├── hooks.ts
│   │   ├── index.ts
│   │   └── __tests__/
│   │
│   └── mesh/                     # Service mesh (future)
│       ├── components/
│       ├── index.ts
│       └── __tests__/
│
├── shared/                       # Cross-feature, zero domain logic
│   ├── components/               # ActionSnackbar, ContentDialog, Skeletons
│   ├── hooks/                    # useLocalStorage, usePagination
│   ├── utils/                    # html-utils, version-utils
│   ├── api/                      # createApi factory, API config, interceptors
│   ├── lib/                      # External integration adapters (future)
│   └── types/                    # Generic shared types only
│
├── pages/                        # Thin route shells (lazy-loaded)
│   ├── InstalledApps.tsx          # Composes features/apps
│   ├── Marketplace.tsx            # Composes features/marketplace
│   ├── System.tsx                 # Composes features/system
│   ├── Onboarding.tsx             # Composes features/onboarding
│   ├── DeviceLogin.tsx            # Composes features/auth
│   ├── Profile.tsx                # Composes features/auth
│   ├── ServiceMesh.tsx            # Composes features/mesh
│   ├── OpenSource.tsx
│   └── NotFound.tsx
│
├── stores/                       # Zustand client state (flat, 2 levels max)
│   ├── ui.ts                     # sidebar, theme, commandPalette
│   └── notifications.ts          # toast queue, job tracking
│
└── assets/
    ├── fonts/
    └── images/
```

### 4.2 Dependency Rules (Enforced)

```
Layer 0: shared/       ← imports NOTHING from src/ except other shared/
Layer 1: features/     ← imports from shared/ only
Layer 2: pages/        ← imports from features/ and shared/
Layer 3: app/          ← imports from pages/, features/, shared/
```

**Cross-feature rule:** `features/apps/` CANNOT import from `features/marketplace/`. If two features need shared logic, it goes in `shared/`.

**Enforcement:**

```javascript
// .eslintrc — import/no-restricted-paths
{
  "rules": {
    "import/no-restricted-paths": ["error", {
      "zones": [
        { "target": "./src/shared",   "from": "./src/features" },
        { "target": "./src/shared",   "from": "./src/pages" },
        { "target": "./src/shared",   "from": "./src/app" },
        { "target": "./src/features", "from": "./src/pages" },
        { "target": "./src/features", "from": "./src/app" }
      ]
    }]
  }
}
```

### 4.3 Code Splitting Strategy

```typescript
// app/Router.tsx
import { lazy, Suspense } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import Frame from '@shared/components/Frame';
import PageSkeleton from '@shared/components/PageSkeleton';

const InstalledApps = lazy(() => import('@pages/InstalledApps'));
const Marketplace   = lazy(() => import('@pages/Marketplace'));
const System        = lazy(() => import('@pages/System'));
const Onboarding    = lazy(() => import('@pages/Onboarding'));
const DeviceLogin   = lazy(() => import('@pages/DeviceLogin'));
const Profile       = lazy(() => import('@pages/Profile'));
const ServiceMesh   = lazy(() => import('@pages/ServiceMesh'));
const OpenSource    = lazy(() => import('@pages/OpenSource'));

export default function Router() {
  return (
    <HashRouter>
      <Frame>
        <Suspense fallback={<PageSkeleton />}>
          <Routes>
            <Route path="/" element={<InstalledApps />} />
            <Route path="/marketplace" element={<Marketplace />} />
            <Route path="/system" element={<System />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/device-login" element={<DeviceLogin />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/service-mesh" element={<ServiceMesh />} />
            <Route path="/open-source" element={<OpenSource />} />
          </Routes>
        </Suspense>
      </Frame>
    </HashRouter>
  );
}
```

### 4.4 Provider Flattening

**Current (10 levels):**
```
PublicApi > PublicAuthProviderApi > DeviceState > OAuth4WebApi > ProtectedApi
> MarketplaceUser > QuestContext > FilterContext > SystemContext > ReferenceDataContext
```

**Target (4 levels):**
```
QueryClientProvider > AuthProvider > ApiProvider > ThemeProvider
```

| Current Provider | Migration | Justification |
|-----------------|-----------|---------------|
| `PublicApiProvider` | Merge → `ApiProvider` | Single adapter for all API access |
| `PublicAuthProviderApiProvider` | Merge → `ApiProvider` | Same adapter, conditional on auth |
| `DeviceStateProvider` | Merge → `AuthProvider` in `features/auth/` | Auth is one concern |
| `OAuth4WebApiAuthProvider` | Merge → `AuthProvider` | Auth is one concern |
| `ProtectedApiProvider` | Merge → `ApiProvider` | Single adapter |
| `MarketplaceUserProvider` | Replace → `useMarketplaceUser()` hook | CQS: query hook |
| `QuestContextProvider` | Replace → `useJobs()` hook in `features/jobs/` | CQS: query hook |
| `FilterContextProvider` | Replace → Zustand store or URL params | Client state belongs in Zustand |
| `SystemContextProvider` | Replace → `useSystemInfo()` hook | Already TQ-powered, inline it |
| `ReferenceDataContextProvider` | Replace → `useApps()` + `useInstances()` | Already TQ-powered, inline it |

### 4.5 Path Aliases

```typescript
// vite.config.ts
resolve: {
  alias: {
    '@app':      path.resolve(__dirname, 'src/app'),
    '@features': path.resolve(__dirname, 'src/features'),
    '@shared':   path.resolve(__dirname, 'src/shared'),
    '@pages':    path.resolve(__dirname, 'src/pages'),
    '@stores':   path.resolve(__dirname, 'src/stores'),
    '@assets':   path.resolve(__dirname, 'src/assets'),
  },
}
```

**Remove old aliases:** `@components`, `@contexts`, `@hooks`, `@utils`, `@models`, `@data`, `@styles`, `@api`, `@test`.

---

## 5. SMART Migration Plan

### Principles

- **No big bang.** Every commit builds and passes tests.
- **Barrel exports absorb moves.** Update the barrel, old imports keep working.
- **Feature by feature.** Complete one module before starting the next.
- **Tests move with source.** Never break test ↔ source co-location.

---

### Phase 3A: Scaffold & Plumbing

**Time:** Days 1-2
**Goal:** Create the target directory tree and enforce boundaries without moving any files.

| # | Task | Acceptance Criteria |
|---|------|-------------------|
| 1 | Create target directories | `app/`, `app/theme/`, `shared/{components,hooks,utils,api,lib,types}/`, all `features/*/` dirs exist |
| 2 | Add new path aliases to `vite.config.ts` | `@app`, `@features`, `@shared`, `@pages`, `@stores`, `@assets` resolve correctly |
| 3 | Add matching paths to `tsconfig.json` | IDE autocomplete works for all new aliases |
| 4 | Add ESLint `import/no-restricted-paths` | `eslint --max-warnings 0` passes (rules active but no violations yet since no files moved) |
| 5 | Verify build + tests | `npm run build` exits 0, `npm run test` — 94 tests pass, bundle < 325KB |

**SMART check:**
- **S:** Create dirs + aliases + lint rules
- **M:** Build passes, 94 tests pass, 6 new aliases resolve, lint rule active
- **A:** Zero file moves, zero risk
- **R:** Foundation for all subsequent phases
- **T:** 2 days

---

### Phase 3B: Move Shared Infrastructure

**Time:** Days 3-5
**Goal:** Relocate cross-feature code to `shared/` and `app/theme/`. Delete dead code.

| # | Task | Files moved | Acceptance Criteria |
|---|------|------------|-------------------|
| 1 | `src/styles/` → `src/app/theme/` | 3 | Theme resolves, brand colors unchanged |
| 2 | `src/components/layout/` → `src/shared/components/layout/` | 8 | AppBar, Drawer, Frame render correctly |
| 3 | `src/components/ui/` → `src/shared/components/` | 11 | ActionSnackbar, VersionSelector, etc. work |
| 4 | `src/components/help/` → `src/shared/components/` | 2 | Help components render |
| 5 | `src/components/steppers/` → `src/shared/components/steppers/` | 11 | Stepper flows work |
| 6 | `src/hooks/` → `src/shared/hooks/` | 2 | Hooks callable from features |
| 7 | `src/utils/` → `src/shared/utils/` | ~8 | All utility imports resolve |
| 8 | `src/api/flecs-core/` + `api-config.ts` → `src/shared/api/` | ~3 | API client factory works |
| 9 | Delete `src/data/AppList.tsx`, `src/data/SystemData.tsx` | -2 | No runtime references |
| 10 | Delete `src/whitelabeling/` or merge into theme | -3 or move 3 | No orphan files |
| 11 | Update all import paths | — | Zero `@styles/`, `@hooks/`, `@utils/` imports remaining |

**Exit criteria:**
- `npm run build` exits 0, bundle < 325KB
- 94 tests pass
- `grep -r "@styles\|@hooks\|@utils" src/ --include="*.ts" --include="*.tsx"` returns 0 results
- ~48 files moved or deleted

---

### Phase 3C: Consolidate `features/apps`

**Time:** Days 6-8
**Goal:** All installed-apps and instance-management code lives in `features/apps/`.

| # | Task | Files | Acceptance Criteria |
|---|------|-------|-------------------|
| 1 | Move `src/components/apps/` → `features/apps/components/` | 16 | App cards render, install/uninstall works |
| 2 | Move `src/components/instances/` → `features/apps/components/instances/` | 26 | Instance list, tabs, editors all functional |
| 3 | Move `src/models/app.tsx` → `features/apps/types.ts` | 1 | Type imports resolve |
| 4 | Create `features/apps/api.ts` | 1 new | Extracts API calls from ReferenceDataContext |
| 5 | Extract `features/apps/keys.ts` from hooks.ts | 1 new | Query keys typed and used by hooks |
| 6 | Move tests to `features/apps/__tests__/` | ~15 | Tests pass from new location |
| 7 | Update barrel export `features/apps/index.ts` | 1 | Pages import from `@features/apps` only |

**Exit criteria:**
- `npm run build` exits 0
- 94 tests pass
- `src/components/apps/` directory is **empty and deleted**
- `src/components/instances/` directory is **empty and deleted**
- Zero imports from `@components/apps` or `@components/instances` remain

---

### Phase 3D: Consolidate `features/marketplace`

**Time:** Days 9-10
**Goal:** All marketplace browse/install code lives in `features/marketplace/`.

| # | Task | Files | Acceptance Criteria |
|---|------|-------|-------------------|
| 1 | Move `src/components/apps/cards/` → `features/marketplace/components/` | ~5 | Marketplace cards render |
| 2 | Move `src/api/marketplace/` → `features/marketplace/api.ts` | ~5 | API calls work |
| 3 | Move `src/models/marketplace.ts` → `features/marketplace/types.ts` | 1 | Types resolve |
| 4 | Replace `FilterContextProvider` → Zustand store or URL params | 1 | Filters persist, no context |
| 5 | Replace `MarketplaceUserProvider` → `useMarketplaceUser()` hook | 1 | User data loads |
| 6 | Move tests | ~5 | Tests pass |

**Exit criteria:**
- `npm run build` exits 0
- `src/api/marketplace/` and `src/contexts/marketplace/` are **deleted**
- Marketplace search, install, category filter all work
- Provider count: **8 or fewer** (down from 10)

---

### Phase 3E: Consolidate `features/system`

**Time:** Days 11-12
**Goal:** Device info, license, and exports live in `features/system/`.

| # | Task | Files | Acceptance Criteria |
|---|------|-------|-------------------|
| 1 | Move `src/components/device/` → `features/system/components/` | 6 | Device info renders |
| 2 | Move `src/components/export/` → `features/system/components/` | 2 | Export list works |
| 3 | Move `src/api/device/` → `features/system/api.ts` | ~8 | API calls work |
| 4 | Move `src/models/system.ts` → `features/system/types.ts` | 1 | Types resolve |
| 5 | Inline `SystemContextProvider` → consumers use `useSystemInfo()` directly | — | No SystemContext imports remain |
| 6 | Inline `ReferenceDataContextProvider` → consumers use `useApps()` directly | — | No ReferenceDataContext imports remain |
| 7 | Move tests | ~5 | Tests pass |

**Exit criteria:**
- `npm run build` exits 0
- `src/contexts/data/SystemProvider.tsx` and `ReferenceDataContext.tsx` are **deleted**
- `grep -r "SystemContext\|ReferenceDataContext" src/` returns 0 results (except migration notes)
- Provider count: **6 or fewer**

---

### Phase 3F: Consolidate `features/auth`

**Time:** Days 13-14
**Goal:** All auth flows (OAuth, device state, JWT) live in `features/auth/`.

| # | Task | Files | Acceptance Criteria |
|---|------|-------|-------------------|
| 1 | Move `src/components/auth/` → `features/auth/components/` | 2 | Login/profile render |
| 2 | Merge OAuth + DeviceState providers → `features/auth/providers/AuthProvider.tsx` | ~15 → 1 | Single auth provider |
| 3 | Move `src/contexts/api/` → `src/shared/api/` | ~5 | API context accessible from shared |
| 4 | Move `src/utils/auth/` + `jwt-utils.ts` → `features/auth/utils.ts` | ~3 | Auth utils co-located |
| 5 | Move tests | ~5 | Tests pass |

**Exit criteria:**
- `npm run build` exits 0
- `src/contexts/auth/`, `src/contexts/device/` are **deleted**
- Auth flow works: login → token refresh → protected routes
- Provider count: **4 or fewer** (target reached)

---

### Phase 3G: Consolidate `features/jobs` + `features/onboarding`

**Time:** Days 15-16
**Goal:** Quest system becomes jobs feature. Onboarding owns its components.

| # | Task | Files | Acceptance Criteria |
|---|------|-------|-------------------|
| 1 | Move `src/components/quests/` → `features/jobs/components/` | 7 | Jobs rail renders |
| 2 | Move `src/contexts/quests/` → `features/jobs/hooks.ts` | ~3 | Job tracking works without context provider |
| 3 | Move `src/models/job.tsx` → `features/jobs/types.ts` | 1 | Types resolve |
| 4 | Move `src/components/onboarding/` → `features/onboarding/components/` | 17 | Onboarding wizard works |
| 5 | Move tests | ~8 | Tests pass |

**Exit criteria:**
- `npm run build` exits 0
- `src/contexts/quests/` is **deleted**
- QuestContextProvider replaced with `useJobs()` hook
- `grep -r "QuestContext" src/` returns 0 results

---

### Phase 3H: Code Splitting + Final Cleanup

**Time:** Days 17-19
**Goal:** Route-level lazy loading, delete all old directories, flatten providers to 4.

| # | Task | Acceptance Criteria |
|---|------|-------------------|
| 1 | Add `React.lazy()` to all route definitions in `Router.tsx` | 8 routes lazy-loaded |
| 2 | Add `<Suspense fallback={<PageSkeleton />}>` | Skeleton shows during chunk load |
| 3 | Delete `src/components/` | Directory does not exist. 0 files. |
| 4 | Delete `src/contexts/` | Directory does not exist (or only empty Providers.tsx re-export). |
| 5 | Delete `src/models/` | Directory does not exist. |
| 6 | Delete `src/api/` (moved to shared + features) | Directory does not exist. |
| 7 | Remove old path aliases from `vite.config.ts` | `@components`, `@contexts`, `@models`, `@api`, `@data` are gone |
| 8 | Flatten `Providers.tsx` to 4 levels | QueryClient > Auth > API > Theme |
| 9 | Verify bundle splits | `npm run build` produces 8+ chunks |
| 10 | Measure initial chunk | **< 200KB gzip** |

**Exit criteria:**
- `npm run build` exits 0
- Initial chunk: **< 200KB gzip**
- Largest route chunk: **< 60KB gzip**
- Old directories fully deleted
- No old alias imports in codebase

---

### Phase 3I: Validation & Sign-off

**Time:** Day 20
**Goal:** Full regression, metrics verification, documentation.

| # | Check | Pass Criteria |
|---|-------|--------------|
| 1 | Full build | `npm run build` exits 0, no warnings |
| 2 | All tests pass | 94+ tests green |
| 3 | Bundle size | Initial < 200KB, per-route < 60KB |
| 4 | Dev server | `npm run dev` + Caddy proxy works |
| 5 | No old imports | `grep -r "@contexts\|@components\|@models" src/` returns 0 |
| 6 | ESLint boundaries | `eslint --max-warnings 0` passes |
| 7 | Provider count | Exactly 4 in Providers.tsx |
| 8 | Smoke test | All 8 routes load, install/uninstall works, auth flow works |
| 9 | Code splitting verified | Network tab shows lazy chunks on navigation |

---

## 6. Success Metrics (SMART)

| Metric | Current | Target | Measured by | Deadline |
|--------|---------|--------|-------------|----------|
| Initial bundle (gzip) | 320KB single chunk | **< 200KB** | `npm run build` output | Day 19 |
| Largest route chunk | N/A | **< 60KB** | `npm run build` output | Day 19 |
| Files in `src/components/` | 178 | **0** (deleted) | `ls src/components/` fails | Day 19 |
| Files in `src/features/` | 26 | **~180** | `find src/features -type f \| wc -l` | Day 19 |
| Context providers | 10 nested | **4 flat** | Count in `Providers.tsx` | Day 17 |
| `@contexts/` imports | 112 | **0** | `grep -r "@contexts" src/` | Day 19 |
| Cross-layer violations | 12 | **0** | ESLint `import/no-restricted-paths` | Day 2 (enforced) |
| Build time | 1.8s | **< 2.5s** (no regression) | `npm run build` timer | Day 20 |
| Test count | 94 | **94+** (no regressions) | `npm run test` | Every phase |
| CQS compliance | ~30% | **100%** | No `useState+useEffect` for server data | Day 16 |
| Container/Presenter split | 0% | **100% of non-trivial components** | Code review checklist | Day 16 |

---

## 7. File Move Map

| Current Location | Target Location | Files | Phase |
|-----------------|----------------|-------|-------|
| `src/styles/` | `src/app/theme/` | 3 | 3B |
| `src/components/layout/` | `src/shared/components/layout/` | 8 | 3B |
| `src/components/ui/` | `src/shared/components/` | 11 | 3B |
| `src/components/help/` | `src/shared/components/` | 2 | 3B |
| `src/components/steppers/` | `src/shared/components/steppers/` | 11 | 3B |
| `src/hooks/` | `src/shared/hooks/` | 2 | 3B |
| `src/utils/` | `src/shared/utils/` | ~8 | 3B |
| `src/api/flecs-core/` | `src/shared/api/` | ~3 | 3B |
| `src/data/` | **DELETE** | 2 | 3B |
| `src/whitelabeling/` | Merge into theme or **DELETE** | 3 | 3B |
| `src/components/apps/` | `src/features/apps/components/` | 16 | 3C |
| `src/components/instances/` | `src/features/apps/components/instances/` | 26 | 3C |
| `src/models/app.tsx` | `src/features/apps/types.ts` | 1 | 3C |
| `src/components/apps/cards/` | `src/features/marketplace/components/` | ~5 | 3D |
| `src/api/marketplace/` | `src/features/marketplace/api.ts` | ~5 | 3D |
| `src/components/device/` | `src/features/system/components/` | 6 | 3E |
| `src/components/export/` | `src/features/system/components/` | 2 | 3E |
| `src/api/device/` | `src/features/system/api.ts` | ~8 | 3E |
| `src/components/auth/` | `src/features/auth/components/` | 2 | 3F |
| `src/contexts/auth/` | `src/features/auth/providers/` | ~10 | 3F |
| `src/contexts/device/` | `src/features/auth/providers/` | ~5 | 3F |
| `src/contexts/api/` | `src/shared/api/` | ~5 | 3F |
| `src/components/quests/` | `src/features/jobs/components/` | 7 | 3G |
| `src/contexts/quests/` | `src/features/jobs/hooks.ts` | ~3 | 3G |
| `src/components/onboarding/` | `src/features/onboarding/components/` | 17 | 3G |

---

## 8. Non-Goals

- **No rewriting component logic** — files move, internal code stays the same
- **No new features** — pure structural refactoring
- **No test rewrites** — tests move with source, import paths update
- **No router migration** — HashRouter stays (CTO decision)
- **No new dependencies** — everything needed is already installed
- **No CSS changes** — styles stay as-is
- **No API changes** — same endpoints, same clients
- **No micro-frontends** — feature code splitting is sufficient
- **No SSR/SSG** — device-local SPA is correct

---

## 9. Risks & Mitigations

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|-----------|
| Breaking imports during moves | Medium | High | Barrel exports absorb changes. CI catches failures. Each phase verified. |
| Test failures from path changes | Medium | Medium | Tests move with source. Mock paths update in same commit. |
| Merge conflicts with parallel work | Low | Medium | Feature branches rebase frequently. Moves are atomic per-feature. |
| Bundle size regression | Low | Medium | Measure per phase. Vite auto-preloads shared chunks. |
| Provider removal breaks auth flow | Medium | High | Auth providers merged carefully in Phase 3F with manual smoke test. |
| Build time regression from more chunks | Low | Low | Vite 7 Rolldown handles splitting efficiently. Target < 2.5s. |

---

## 10. Architecture Decision Records

### ADR-001: Keep HashRouter
**Decision:** HashRouter stays. No migration to TanStack Router or BrowserRouter.
**Rationale:** CTO decision. Works for device-local deployment. Customer paths matter. Stable before API layer.

### ADR-002: 4-Layer Dependency Direction
**Decision:** `app → pages → features → shared`. Enforced by ESLint at lint time.
**Rationale:** Prevents the `components ← features → contexts` spaghetti. Unidirectional deps = predictable impact analysis.

### ADR-003: CQS via TanStack Query
**Decision:** All server data through `useQuery` (reads) and `useMutation` (writes). No `useState+useEffect` for API data.
**Rationale:** Separation of reads/writes enables caching, optimistic updates, and background refetch without custom code.

### ADR-004: Container/Presenter Pattern
**Decision:** Non-trivial components split into data-fetching containers and pure presenters.
**Rationale:** Presenters are testable with props alone. Containers are integration-tested. Clear separation of concerns.

### ADR-005: State Normalization
**Decision:** Server state in TanStack Query. Client state in Zustand. URL state in search params. Local state in useState.
**Rationale:** No state duplication. Single source of truth per data type. Derived data computed, never stored.

### ADR-006: Feature-Owns-Everything
**Decision:** Each feature directory contains its components, hooks, API calls, types, and tests. No reaching outside except to `shared/`.
**Rationale:** Adding a feature = adding a directory. Removing a feature = deleting a directory. Zero cross-feature coupling.

---

## 11. References

- [Feature-Sliced Design](https://feature-sliced.design/) — layer definitions, unidirectional dependencies
- [Hexagonal Architecture](https://alistair.cockburn.us/hexagonal-architecture/) — ports & adapters pattern
- [Bulletproof React](https://github.com/alan2207/bulletproof-react) — feature-based React architecture
- [Vite Code Splitting](https://vite.dev/guide/features) — CSS auto-splitting, async chunk preloading
- [Martin Fowler — Modularizing React Apps](https://martinfowler.com/articles/modularizing-react-apps.html) — component structure
- [TanStack Query — Thinking in React Query](https://tkdodo.eu/blog/thinking-in-react-query) — CQS patterns with React Query
