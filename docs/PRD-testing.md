# FLECS Webapp — Testing PRD

**Version:** 1.0
**Date:** 2026-03-03
**Status:** Active

---

## 1. Current State

| Metric | Value |
|--------|-------|
| Test runner | Vitest 4.0.18 |
| DOM env | jsdom 26.1 |
| Component testing | @testing-library/react 16.3 |
| Test files | 61 |
| Test cases | 415 |
| Pass rate | 100% |
| Run time | ~8s |
| E2E tests | None |
| Coverage | Not enforced |

### Test Distribution

| Layer | Files | Tests | Coverage |
|-------|-------|-------|----------|
| Stores (Zustand smoke) | 1 | 31 | All 6 stores |
| Component smoke | 1 | 3 | App bootstrap, pages |
| Shared components | 14 | ~120 | Dialogs, buttons, layout |
| Feature: apps | 12 | ~100 | Install, instance config, tabs |
| Feature: jobs | 6 | ~40 | Quest state, icons, progress |
| Feature: auth | 2 | ~30 | AuthGuard, DeviceActivation |
| Feature: marketplace | 3 | ~20 | ProductService, VersionService |
| Feature: system | 5 | ~30 | Export, import, version, license |
| Feature: onboarding | 3 | ~20 | Dialog, steps |
| API providers | 1 | 15 | Public/Protected API |
| Pages | 3 | ~20 | DeviceLogin, NotFound, OpenSource, Profile |

---

## 2. Testing Strategy

### 2.1 Test Pyramid

```
        /  E2E  \          ← Playwright (future)
       /  Smoke  \         ← Vitest + RTL (stores, pages)
      / Component \        ← Vitest + RTL (current bulk)
     /    Unit     \       ← Vitest (pure functions, utils)
    /   Mock Infra  \      ← Centralized mocks (core-client-ts, OAuth)
```

### 2.2 Test Types

| Type | Tool | Purpose | Run frequency |
|------|------|---------|--------------|
| **Unit** | Vitest | Pure functions, utils, store logic | Every commit |
| **Component** | Vitest + RTL | Individual components with mocked deps | Every commit |
| **Smoke** | Vitest + RTL | App renders, stores initialize, pages load | Every commit |
| **Integration** | Vitest + RTL | Multi-component flows with real stores | Every PR |
| **E2E** | Playwright | Full user journeys against running app | Nightly / pre-release |

---

## 3. Infrastructure

### 3.1 Mock Architecture

```
src/
├── __mocks__/
│   ├── core-client-ts.ts          # createMockApi() — all API endpoints
│   └── auth-provider-client-ts.ts # Auth provider API mock
├── test/
│   ├── setup.ts                   # Global: cleanup, jest compat shim
│   ├── test-utils.ts              # createMockQuestActions(), resetStore()
│   ├── oauth-test-utils.tsx       # renderWithOAuthProvider/State
│   └── README.md                  # Testing patterns documentation
└── features/*/__mocks__/          # Co-located mocks per feature
```

### 3.2 Key Patterns

**Zustand store testing:** Direct `getState()` / `setState()` — no React render needed.

```ts
const state = useDeviceState.getState();
expect(state.loaded).toBe(false);
useDeviceState.getState().setLoaded(true);
expect(useDeviceState.getState().loaded).toBe(true);
```

**Store reset between tests:**
```ts
afterEach(() => store.setState(store.getInitialState()));
```

**API mocking:** `vi.mock('@shared/api/ApiProvider')` + `createMockApi()` from centralized mock.

**OAuth mocking:** Auto-resolved `__mocks__/OAuth4WebApiAuthProvider.tsx` with scenario helpers.

**Quest actions mocking:** `createMockQuestActions()` returns mock `fetchQuest`, `waitForQuest`, etc.

---

## 4. Roadmap

### Phase 1 — Foundation (DONE)

- [x] Delete 30 broken test files (imported deleted modules)
- [x] Fix 5 failing tests (moved imports, changed button text, constructor mocks)
- [x] Clean dead code (QuestContext, DeviceStateProvider, old mocks, dead aliases)
- [x] Rewrite test-utils for Zustand + hooks architecture
- [x] Smoke tests for all 6 Zustand stores (31 tests)
- [x] Component smoke tests (3 tests)
- [x] 61 files, 415 tests, 100% pass rate

### Phase 2 — Coverage Enforcement

- [ ] Enable Vitest coverage with `--coverage` in CI
- [ ] Set thresholds: 60% lines, 50% branches (ramp up over time)
- [ ] Add coverage badge to README
- [ ] Exclude generated files and barrels from coverage

### Phase 3 — Integration Tests

- [ ] Write integration tests for critical flows:
  - App install flow (InstallButton → InstallationStepper → quest polling)
  - Instance lifecycle (create → start → stop → delete)
  - Auth flow (unauthenticated → login → authenticated)
  - Onboarding flow (guard → stepper → completion)
- [ ] Test TanStack Query hooks with `renderHook` + mock API
- [ ] Test Zustand store + component integration (real stores, mocked API)

### Phase 4 — E2E (Playwright)

- [ ] Install Playwright: `npm init playwright@latest`
- [ ] Configure base URL for device-local testing
- [ ] Write critical path E2E tests:
  - Login → dashboard → install app → verify running
  - Onboarding flow (fresh device)
  - System page → export → download
  - Marketplace → search → install
- [ ] Add `npm run test:e2e` script
- [ ] Integrate into CI pipeline (run against built static SPA)

### Phase 5 — CI/CD Integration

- [ ] GitHub Actions workflow: lint → typecheck → unit tests → build → E2E
- [ ] Fail PR on test regression
- [ ] Coverage diff reporting on PRs
- [ ] Nightly E2E runs

---

## 5. Conventions

1. **Test files live in `__tests__/` directories** next to the code they test
2. **Use `vi.mock()` with factory functions**, not manual mock modules
3. **Reset stores in `afterEach`** — stores are singletons, state leaks between tests
4. **Mock at the hook level** — mock `useProtectedApi` not the entire provider tree
5. **No snapshot tests** — they're brittle with MUI class names
6. **Name tests by behavior** — `"shows error when backend unavailable"` not `"test case 3"`
7. **Use `data-testid` sparingly** — prefer accessible queries (`getByRole`, `getByText`)

---

## 6. Success Metrics

| Metric | Current | Phase 2 | Phase 4 |
|--------|---------|---------|---------|
| Test files | 61 | 80+ | 90+ |
| Test cases | 415 | 600+ | 650+ |
| Line coverage | Unknown | 60%+ | 70%+ |
| E2E scenarios | 0 | 0 | 5+ |
| CI pass time | N/A | < 30s | < 2min |
| Pass rate | 100% | 100% | 100% |
