# FLECS API Mocking Strategy

This document explains how to use the centralized API mocking system for testing components that use `@flecs/core-client-ts` with **Vitest**.

## Overview

The mocking system provides:

- **Centralized mock definitions** for all API endpoints
- **Reusable test patterns** for common scenarios
- **Quest-based testing utilities** for async operations
- **TypeScript support** for better development experience
- **Vitest compatibility** with `vi.fn()` and `vi.mock()`

## Files Structure

```
src/
├── __mocks__/
│   └── core-client-ts.ts       # Main mock definitions
├── test/
│   ├── setup.ts                # Global test setup
│   └── test-utils.ts           # Test utility functions
└── __tests__/
    └── api-mocking-examples.test.tsx  # Example usage
```

## Basic Usage

### 1. Simple API Mocking

```typescript
import { createMockApi } from '../__mocks__/core-client-ts';
import { describe, it, expect, vi } from 'vitest';

describe('My Component', () => {
  it('should call the API', async () => {
    const mockApi = createMockApi();

    // Use the mock API in your test
    const result = await mockApi.app.appsInstallPost({
      appKey: { name: 'test-app', version: '1.0.0' },
    });

    expect(result.data.jobId).toBeDefined();
  });
});
```

### 2. Custom Mock Responses

```typescript
import { createMockApi } from '../__mocks__/core-client-ts';
import { vi } from 'vitest';

const customMocks = {
  app: {
    appsInstallPost: vi.fn(() =>
      Promise.resolve({
        data: { jobId: 12345 },
      }),
    ),
  },
};

const mockApi = createMockApi(customMocks);
```

### 3. Quest-Based Testing

```typescript
import { createSuccessfulInstallTest, createFailedInstallTest } from '../test/test-utils';
import { describe, it, expect } from 'vitest';

describe('Installation Process', () => {
  it('should handle successful installation', async () => {
    const { mockApi, mockQuestContext } = createSuccessfulInstallTest();

    // Your test logic here
    const installResult = await mockApi.app.appsInstallPost({});
    const questResult = await mockQuestContext.waitForQuest(installResult.data.jobId);

    expect(questResult.state).toBe('finished-ok');
  });

  it('should handle failed installation', async () => {
    const { mockApi, mockQuestContext } = createFailedInstallTest('Custom error');

    // Your test logic here
  });
});
```

## Advanced Patterns

### 1. Multi-Step Quest Testing

```typescript
import { vi } from 'vitest';

const mockQuestContext = {
  quests: { current: new Map() },
  fetchQuest: vi.fn(() => Promise.resolve()),
  waitForQuest: vi
    .fn()
    .mockResolvedValueOnce({ state: 'finished-ok', result: 'step1-result' })
    .mockResolvedValueOnce({ state: 'finished-ok', result: 'step2-result' })
    .mockResolvedValueOnce({ state: 'finished-ok', result: 'step3-result' }),
};
```

### 2. Error Scenario Testing

```typescript
import { setupQuestFailure } from '../__mocks__/core-client-ts';

const mockApi = createMockApi();
const { quest, result } = setupQuestFailure(
  mockApi,
  mockApi.app.appsInstallPost,
  'Installation failed',
);
```

### 3. Instance Operations Testing

```typescript
import { createInstanceOperationTest } from '../test/test-utils';

// Test successful instance start
const { mockApi, mockQuestContext } = createInstanceOperationTest('start', true);

// Test failed instance start
const { mockApi, mockQuestContext } = createInstanceOperationTest('start', false);
```

## Component Integration Testing

### Mocking Hooks with Vitest

When testing components that use `useProtectedApi` and `useQuestContext`:

```typescript
import { createMockApi } from '../__mocks__/core-client-ts';
import { describe, it, expect, vi } from 'vitest';

describe('MyComponent', () => {
  it('should interact with API correctly', async () => {
    const mockApi = createMockApi();

    // Mock the useProtectedApi hook (Vitest style)
    const useProtectedApiSpy = vi.spyOn(
      await import('@contexts/api/ApiProvider'),
      'useProtectedApi'
    ).mockReturnValue(mockApi);

    // Mock quest context
    const mockQuestContext = {
      quests: { current: new Map() },
      fetchQuest: vi.fn(() => Promise.resolve()),
      waitForQuest: vi.fn(() => Promise.resolve({ state: 'finished-ok' })),
    };

    const useQuestContextSpy = vi.spyOn(
      await import('@contexts/quests/QuestContext'),
      'useQuestContext'
    ).mockReturnValue(mockQuestContext);

    // Render and test your component
    render(<MyComponent />);

    // Assertions
    await waitFor(() => {
      expect(mockApi.app.appsInstallPost).toHaveBeenCalledWith(expectedParams);
    });

    // Cleanup
    useProtectedApiSpy.mockRestore();
    useQuestContextSpy.mockRestore();
  });
});
```

## Available Mock APIs

The `createMockApi()` function provides mocks for:

- **App API**: `appsInstallPost`, `appsSideloadPost`, `appsUninstallDelete`, `appsGet`, `appsAppKeyGet`
- **Instance API**: `instancesCreatePost`, `instancesInstanceIdStartPost`, `instancesInstanceIdStopPost`, `instancesInstanceIdDelete`, etc.
- **Marketplace API**: `marketplaceAppsGet`, `marketplaceAppsAppKeyGet`
- **System API**: `systemInfoGet`, `systemJobsGet`, `systemJobsJobIdGet`
- **Device API**: `deviceInfoGet`, `deviceNetworkGet`
- **User API**: `userProfileGet`, `userProfilePut`
- **License API**: `licenseGet`, `licensePut`

## Helper Functions

### Test Utilities

- `createMockQuestContext()` - Creates a mock quest context
- `createSuccessfulInstallTest()` - Setup for successful installation tests
- `createFailedInstallTest(error)` - Setup for failed installation tests
- `createInstanceOperationTest(operation, success)` - Setup for instance operation tests

### Mock Factories

- `createMockQuest(overrides)` - Creates a mock quest response
- `createMockQuestResult(overrides)` - Creates a mock quest result
- `createMockApp(overrides)` - Creates a mock app object
- `createMockInstance(overrides)` - Creates a mock instance object

### Utilities

- `resetAllApiMocks(api)` - Resets all mock function calls
- `setupQuestFailure(api, method, error)` - Sets up a quest failure scenario

## Best Practices

1. **Use the pre-built test patterns** when possible (successful/failed install tests)
2. **Reset mocks between tests** using `vi.clearAllMocks()` in `beforeEach()`
3. **Mock at the hook level** rather than the component level for integration tests
4. **Use async/await imports** for Vitest module mocking
5. **Test both success and failure scenarios** for robust test coverage
6. **Use descriptive error messages** in failure scenarios to make debugging easier

This system provides comprehensive coverage for all FLECS API interactions while maintaining simplicity and reusability across your Vitest test suite.
