/*
 * Copyright (c) 2025 FLECS Technologies GmbH
 *
 * Created on Mon Tue 24 2025
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { QuestLog } from '../QuestLog';
import * as ContextModule from '@contexts/quests/QuestContext';
import { QuestContextType } from '@contexts/quests/QuestContext';
import { Quest, QuestState } from '@flecs/core-client-ts';

// Mock QuestLogEntry
vi.mock('../QuestLogEntry', () => ({
  __esModule: true,
  QuestLogEntry: ({ id }: { id: number }) => <div data-testid={`entry-${id}`} />,
}));

describe('QuestLog', () => {
  let setFetching: ReturnType<typeof vi.fn>;
  let mockContext: Partial<QuestContextType>;
  let useQuestContextSpy: any;

  beforeEach(() => {
    setFetching = vi.fn();
    mockContext = {
      setFetching,
      mainQuestIds: [10, 20],
      quests: { current: new Map<number, Quest>() },
    };
    useQuestContextSpy = vi.spyOn(ContextModule, 'useQuestContext');
    useQuestContextSpy.mockReturnValue(mockContext as QuestContextType);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    cleanup();
  });

  it('sets fetching true on mount and false on unmount', () => {
    const { unmount } = render(<QuestLog />);
    expect(setFetching).toHaveBeenCalledWith(true);

    unmount();
    expect(setFetching).toHaveBeenCalledWith(false);
  });

  it('renders QuestLogEntry for each mainQuestIds', () => {
    const ids = [1, 2, 3];
    mockContext.mainQuestIds = ids;
    useQuestContextSpy.mockReturnValue(mockContext as QuestContextType);

    render(<QuestLog />);
    ids.forEach((id) => {
      expect(screen.getByTestId(`entry-${id}`)).toBeInTheDocument();
    });
  });

  it('shows no quests message when no quests present', () => {
    // quests.current.size === 0 triggers message
    mockContext.quests!.current.clear();
    useQuestContextSpy.mockReturnValue(mockContext as QuestContextType);

    render(<QuestLog />);
    expect(screen.getByText('No quests present')).toBeInTheDocument();
  });

  it('does not show no quests message when quests exist', () => {
    mockContext.quests!.current.clear();
    mockContext.quests!.current.set(1, {
      id: 1,
      description: '',
      state: QuestState.Failed,
    } as Quest);
    useQuestContextSpy.mockReturnValue(mockContext as QuestContextType);

    render(<QuestLog />);
    expect(screen.queryByText('No quests present')).toBeNull();
  });
});
