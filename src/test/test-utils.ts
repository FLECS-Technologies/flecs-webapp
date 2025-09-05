/**
 * Test utilities for mocking FLECS API calls and quest behavior
 * Using Vitest mocking functions
 */
import { vi } from 'vitest';
import {
  createMockApi,
  createMockQuest,
  createMockQuestResult,
  setupQuestFailure,
} from '../__mocks__/core-client-ts';

// Mock Quest Context for testing
export const createMockQuestContext = () => {
  const quests = new Map();

  return {
    quests: {
      current: quests,
    },
    fetchQuest: vi.fn((questId) => {
      if (!quests.has(questId)) {
        quests.set(questId, createMockQuestResult());
      }
      return Promise.resolve();
    }),
    waitForQuest: vi.fn((questId) => {
      const quest = quests.get(questId) || createMockQuestResult();
      return Promise.resolve(quest);
    }),
    waitForQuests: vi.fn((questIds: number[]) => {
      const results = questIds.map((id: number) => quests.get(id) || createMockQuestResult());
      return Promise.resolve(results);
    }),
  };
};

// Helper to create a mock API with specific quest results
export const createMockApiWithQuests = (questResults: Record<string, any> = {}) => {
  const mockApi = createMockApi();

  // Override specific methods to return predetermined quest IDs
  Object.keys(questResults).forEach((method) => {
    const [apiGroup, methodName] = method.split('.');
    if (mockApi[apiGroup] && mockApi[apiGroup][methodName]) {
      const questId = Math.floor(Math.random() * 10000);
      mockApi[apiGroup][methodName].mockResolvedValue(createMockQuest({ jobId: questId }));

      // Store the quest result for the mock context
      (questResults[method] as any).questId = questId;
    }
  });

  return { mockApi, questResults };
};

// Test patterns for different scenarios
export const createSuccessfulInstallTest = () => {
  const mockQuestContext = createMockQuestContext();
  const mockApi = createMockApi();

  // All quests succeed
  mockQuestContext.waitForQuest.mockResolvedValue(createMockQuestResult({ state: 'finished-ok' }));

  return { mockApi, mockQuestContext };
};

export const createFailedInstallTest = (errorMessage = 'Installation failed') => {
  const mockQuestContext = createMockQuestContext();
  const mockApi = createMockApi();

  // First quest fails
  mockQuestContext.waitForQuest.mockResolvedValueOnce(
    createMockQuestResult({
      state: 'finished-error',
      description: errorMessage,
    }),
  );

  return { mockApi, mockQuestContext };
};

// Helper for testing instance operations
export const createInstanceOperationTest = (operation: string, success = true) => {
  const mockQuestContext = createMockQuestContext();
  const mockApi = createMockApi();

  const result = success
    ? createMockQuestResult({ state: 'finished-ok' })
    : createMockQuestResult({ state: 'finished-error', description: `${operation} failed` });

  mockQuestContext.waitForQuest.mockResolvedValue(result);

  return { mockApi, mockQuestContext };
};

// React Testing Library helpers
export const renderWithMockApi = (
  Component: any,
  {
    mockApi,
    mockQuestContext,
    ...renderOptions
  }: {
    mockApi?: any;
    mockQuestContext?: any;
    [key: string]: any;
  } = {},
) => {
  const defaultMockApi = mockApi || createMockApi();
  const defaultMockQuestContext = mockQuestContext || createMockQuestContext();

  // This would be used with your provider components
  // You'll need to adapt this to your actual provider structure
  const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
    return (
      // Your providers here with mock values
      // <ApiProvider value={defaultMockApi}>
      //   <QuestContext.Provider value={defaultMockQuestContext}>
      //     {children}
      //   </QuestContext.Provider>
      // </ApiProvider>
      children
    );
  };

  return {
    mockApi: defaultMockApi,
    mockQuestContext: defaultMockQuestContext,
    // render(Component, { wrapper: AllTheProviders, ...renderOptions })
  };
};

export { createMockApi, createMockQuest, createMockQuestResult, setupQuestFailure };
