# FLECS Test Infrastructure

## Stack

- **Vitest 4.x** — test runner (configured in `vite.config.ts`)
- **@testing-library/react 16** — component rendering & queries
- **jsdom** — DOM environment

## Directory Structure

```
src/
├── __mocks__/
│   ├── core-client-ts.ts          # API mock factory (createMockApi)
│   └── auth-provider-client-ts.ts # Auth provider API mock
├── test/
│   ├── setup.ts                   # Global test setup (cleanup, jest compat)
│   ├── test-utils.ts              # Mock helpers (quest actions, Zustand stores)
│   └── oauth-test-utils.tsx       # OAuth provider test wrappers
└── features/*/__mocks__/          # Co-located mocks per feature
```

## Patterns

### Mocking API hooks

```typescript
vi.mock('@shared/api/ApiProvider', () => ({
  useProtectedApi: vi.fn(),
  usePublicApi: vi.fn(),
}));
```

### Mocking quest actions (Zustand + hooks)

```typescript
vi.mock('@features/jobs/hooks', () => ({
  useQuestActions: () => ({
    fetchQuest: vi.fn().mockResolvedValue(undefined),
    waitForQuest: vi.fn().mockResolvedValue({ state: 'finished-ok' }),
    waitForQuests: vi.fn().mockResolvedValue([]),
    clearQuests: vi.fn(),
  }),
}));
```

### Mocking Zustand stores

```typescript
import { useDeviceState } from '@stores/device-state';

// Reset store between tests
afterEach(() => {
  useDeviceState.setState(useDeviceState.getInitialState());
});

// Set specific state for a test
useDeviceState.setState({ loaded: true, onboarded: true, authenticated: false });
```

### Mocking OAuth

```typescript
vi.mock('@features/auth/providers/OAuth4WebApiAuthProvider');
import { mockScenarios } from '@features/auth/providers/__mocks__/OAuth4WebApiAuthProvider';

beforeEach(() => mockScenarios.authenticatedUser());
```

## Running Tests

```bash
npm test              # watch mode
npx vitest run        # single run
npx vitest run --coverage  # with coverage
```
