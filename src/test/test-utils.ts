/**
 * Test utilities for the FLECS webapp
 *
 * Provides helpers for mocking Zustand stores, API calls, and quest actions.
 * Updated to match the new architecture (Zustand + TanStack Query hooks).
 */
import { vi } from 'vitest';
import {
  createMockApi,
  createMockQuest,
  createMockQuestResult,
  createMockQuestObject,
  setupQuestFailure,
} from '../__mocks__/core-client-ts';

// ---------------------------------------------------------------------------
// Zustand store helpers
// ---------------------------------------------------------------------------

/**
 * Reset a Zustand store to its initial state between tests.
 * Usage: afterEach(() => resetStore(useDeviceState))
 */
export function resetStore<T>(store: { setState: (state: Partial<T>) => void; getInitialState: () => T }) {
  store.setState(store.getInitialState());
}

// ---------------------------------------------------------------------------
// Quest actions mock (replaces old QuestContext mock)
// ---------------------------------------------------------------------------

export const createMockQuestActions = () => ({
  fetchQuest: vi.fn().mockResolvedValue(undefined),
  fetchQuests: vi.fn().mockResolvedValue(undefined),
  waitForQuest: vi.fn().mockResolvedValue(createMockQuestResult()),
  waitForQuests: vi.fn().mockResolvedValue([]),
  clearQuests: vi.fn().mockResolvedValue(undefined),
});

// ---------------------------------------------------------------------------
// API mock helpers
// ---------------------------------------------------------------------------

export const createMockApiWithQuests = (questResults: Record<string, any> = {}) => {
  const mockApi = createMockApi();

  Object.keys(questResults).forEach((method) => {
    const [apiGroup, methodName] = method.split('.');
    if (mockApi[apiGroup] && mockApi[apiGroup][methodName]) {
      const questId = Math.floor(Math.random() * 10000);
      mockApi[apiGroup][methodName].mockResolvedValue(createMockQuest({ jobId: questId }));
      (questResults[method] as any).questId = questId;
    }
  });

  return { mockApi, questResults };
};

// ---------------------------------------------------------------------------
// Scenario helpers
// ---------------------------------------------------------------------------

export const createSuccessfulInstallTest = () => {
  const mockQuestActions = createMockQuestActions();
  const mockApi = createMockApi();

  mockQuestActions.waitForQuest.mockResolvedValue(createMockQuestResult({ state: 'finished-ok' }));

  return { mockApi, mockQuestActions };
};

export const createFailedInstallTest = (errorMessage = 'Installation failed') => {
  const mockQuestActions = createMockQuestActions();
  const mockApi = createMockApi();

  mockQuestActions.waitForQuest.mockResolvedValueOnce(
    createMockQuestResult({ state: 'finished-error', description: errorMessage }),
  );

  return { mockApi, mockQuestActions };
};

export const createInstanceOperationTest = (operation: string, success = true) => {
  const mockQuestActions = createMockQuestActions();
  const mockApi = createMockApi();

  const result = success
    ? createMockQuestResult({ state: 'finished-ok' })
    : createMockQuestResult({ state: 'finished-error', description: `${operation} failed` });

  mockQuestActions.waitForQuest.mockResolvedValue(result);

  return { mockApi, mockQuestActions };
};

// ---------------------------------------------------------------------------
// Re-exports from core-client-ts mock
// ---------------------------------------------------------------------------

export {
  createMockApi,
  createMockQuest,
  createMockQuestResult,
  createMockQuestObject,
  setupQuestFailure,
};
