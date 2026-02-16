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
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QuestLogEntryBody } from '../QuestLogEntryBody';
import { QuestState, QuestProgress, Quest } from '@flecs/core-client-ts';
import * as QuestStateUtils from '../../../utils/quests/QuestState';
import * as QuestUtils from '../../../utils/quests/Quest';

// Mock MUI WarningAmber icon via barrel import
vi.mock('@mui/icons-material', () => ({
  __esModule: true,
  WarningAmber: () => <div data-testid="warning-icon" />,
}));
// Mock child components using correct relative paths
vi.mock('../QuestIcon', () => ({
  __esModule: true,
  QuestIcon: ({ state }: { state: QuestState }) => <div data-testid="quest-icon">{state}</div>,
}));
vi.mock('../QuestProgressIndicator', () => ({
  __esModule: true,
  QuestProgressIndicator: () => <div data-testid="progress-indicator" />,
}));
vi.mock('../SubQuestProgressIndicator', () => ({
  __esModule: true,
  SubQuestProgressIndicator: () => <div data-testid="subquest-indicator" />,
}));

describe('QuestLogEntryBody', () => {
  const baseQuest: Partial<Quest> = {
    id: 1,
    description: 'Test quest',
    detail: 'Detailed info',
  };

  beforeEach(() => {
    vi.restoreAllMocks();
    // Default utils behavior
    vi.spyOn(QuestUtils, 'hasQuestFailedSubquest').mockReturnValue(false);
    vi.spyOn(QuestStateUtils, 'questStateFinishedOk').mockReturnValue(false);
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('renders description, detail, and QuestIcon', () => {
    const quest = { ...baseQuest, state: QuestState.Pending } as Quest;
    render(<QuestLogEntryBody quest={quest} level={0} />);

    expect(screen.getByText('Test quest')).toBeInTheDocument();
    expect(screen.getByText('Detailed info')).toBeInTheDocument();
    expect(screen.getByTestId('quest-icon')).toBeInTheDocument();
  });

  it('renders warning icon when quest has failed subquest and state not Failed', () => {
    vi.spyOn(QuestUtils, 'hasQuestFailedSubquest').mockReturnValue(true);
    const quest = {
      ...baseQuest,
      state: QuestState.Ongoing,
      subquests: [{ id: 2, state: QuestState.Pending } as Quest],
    } as Quest;
    render(<QuestLogEntryBody quest={quest} level={1} />);

    expect(screen.getByTestId('warning-icon')).toBeInTheDocument();
  });

  it('does not render warning icon when quest state is Failed', () => {
    vi.spyOn(QuestUtils, 'hasQuestFailedSubquest').mockReturnValue(true);
    const quest = {
      ...baseQuest,
      state: QuestState.Failed,
      subquests: [{ id: 2, state: QuestState.Pending } as Quest],
    } as Quest;
    render(<QuestLogEntryBody quest={quest} level={1} />);

    expect(screen.queryByTestId('warning-icon')).toBeNull();
  });

  it('renders progress and subquest indicators when not finished ok and has progress/subquests', () => {
    vi.spyOn(QuestStateUtils, 'questStateFinishedOk').mockReturnValue(false);
    const progress: QuestProgress = { current: 1, total: 2 };
    const subquests: Quest[] = [{ id: 3, state: QuestState.Pending } as Quest];
    const quest = {
      ...baseQuest,
      state: QuestState.Ongoing,
      progress,
      subquests,
    } as Quest;

    render(<QuestLogEntryBody quest={quest} level={2} />);

    expect(screen.getByTestId('progress-indicator')).toBeInTheDocument();
    expect(screen.getByTestId('subquest-indicator')).toBeInTheDocument();
  });

  it('does not render progress/subquests when quest finished ok', () => {
    vi.spyOn(QuestStateUtils, 'questStateFinishedOk').mockReturnValue(true);
    const progress: QuestProgress = { current: 5, total: 5 };
    const subquests: Quest[] = [{ id: 4, state: QuestState.Success } as Quest];
    const quest = {
      ...baseQuest,
      state: QuestState.Success,
      progress,
      subquests,
    } as Quest;

    render(<QuestLogEntryBody quest={quest} level={3} />);

    expect(screen.queryByTestId('progress-indicator')).toBeNull();
    expect(screen.queryByTestId('subquest-indicator')).toBeNull();
  });
});
