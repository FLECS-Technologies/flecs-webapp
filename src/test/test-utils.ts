/**
 * Shared test utilities for the FLECS webapp.
 *
 * Convention: tests live next to source files (Foo.test.tsx beside Foo.tsx).
 * Use vi.mock() inline for mocking — no __mocks__ directories.
 * This file provides only genuinely reusable helpers.
 */
import { vi } from 'vitest';
import { Quest, QuestState } from '@generated/core/schemas';

// ── Zustand store reset ──

export function resetStore<T>(store: {
  setState: (state: Partial<T>) => void;
  getInitialState: () => T;
}) {
  store.setState(store.getInitialState());
}

// ── Quest factories ──

export function createMockQuest(overrides: Partial<Quest> = {}): Quest {
  return {
    id: Math.floor(Math.random() * 100000),
    description: 'Mock quest',
    state: QuestState.pending,
    progress: { current: 0, total: 1 },
    subquests: [],
    ...overrides,
  };
}

export function createMockQuestActions() {
  return {
    fetchQuest: vi.fn().mockResolvedValue(undefined),
    fetchQuests: vi.fn().mockResolvedValue(undefined),
    waitForQuest: vi.fn().mockResolvedValue(createMockQuest({ state: QuestState.success })),
    waitForQuests: vi.fn().mockResolvedValue([]),
    clearQuests: vi.fn().mockResolvedValue(undefined),
  };
}
