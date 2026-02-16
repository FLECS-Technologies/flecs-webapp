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
import { render, screen } from '@testing-library/react';
import { QuestLogEntry } from '../QuestLogEntry';
import { QuestState, Quest } from '@flecs/core-client-ts';
import * as StateUtils from '../../../utils/quests/QuestState';
import * as ContextModule from '@contexts/quests/QuestContext';

// Mock QuestLogEntryBody to render test ids based on quest id
vi.mock('../QuestLogEntryBody', () => ({
  __esModule: true,
  QuestLogEntryBody: ({ quest }: { quest: Quest }) => (
    <div data-testid={`body-${quest.id}`}>{quest.description}</div>
  ),
}));
// Mock ExpandMoreIcon
vi.mock('@mui/icons-material/ExpandMore', () => ({
  __esModule: true,
  default: () => <div data-testid="expand-icon" />,
}));

describe('QuestLogEntry', () => {
  let useQuestContextSpy: any;

  beforeEach(() => {
    // Spy on useQuestContext
    useQuestContextSpy = vi.spyOn(ContextModule, 'useQuestContext');
    // Default color function
    vi.spyOn(StateUtils, 'getQuestStateColor').mockReturnValue('blue');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns null if quest not found', () => {
    useQuestContextSpy.mockReturnValue({
      quests: { current: new Map<number, Quest>() },
    } as any);
    const { container } = render(<QuestLogEntry id={1} level={0} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders Paper when no subquests', () => {
    const quest: Quest = {
      id: 1,
      state: QuestState.Pending,
      description: 'Q1',
      detail: '',
      subquests: [],
    } as Quest;
    useQuestContextSpy.mockReturnValue({
      quests: { current: new Map([[1, quest]]) },
    } as any);

    render(<QuestLogEntry id={1} level={0} />);

    // Should render QuestLogEntryBody for id 1
    expect(screen.getByTestId('body-1')).toBeInTheDocument();
    // No expand icon
    expect(screen.queryByTestId('expand-icon')).toBeNull();
  });

  it('renders Accordion with ExpandMoreIcon when has subquests and level <= MAX_DEPTH', () => {
    const subquest: Quest = {
      id: 2,
      state: QuestState.Pending,
      description: 'Sub',
      detail: '',
      subquests: [],
    } as Quest;
    const quest: Quest = {
      id: 1,
      state: QuestState.Pending,
      description: 'Q1',
      detail: '',
      subquests: [subquest],
    } as Quest;
    useQuestContextSpy.mockReturnValue({
      quests: {
        current: new Map([
          [1, quest],
          [2, subquest],
        ]),
      },
    } as any);

    render(<QuestLogEntry id={1} level={0} />);

    // Should render main entry
    expect(screen.getByTestId('body-1')).toBeInTheDocument();
    // Expand icon present
    expect(screen.getByTestId('expand-icon')).toBeInTheDocument();
    // Should render nested entry for subquest id 2
    expect(screen.getByTestId('body-2')).toBeInTheDocument();
  });

  it('renders Paper instead of Accordion when level > MAX_DEPTH', () => {
    const subquest: Quest = {
      id: 2,
      state: QuestState.Pending,
      description: 'Sub',
      detail: '',
      subquests: [],
    } as Quest;
    const quest: Quest = {
      id: 1,
      state: QuestState.Pending,
      description: 'Q1',
      detail: '',
      subquests: [subquest],
    } as Quest;
    useQuestContextSpy.mockReturnValue({
      quests: {
        current: new Map([
          [1, quest],
          [2, subquest],
        ]),
      },
    } as any);

    render(<QuestLogEntry id={1} level={101} />);

    // Should render body but no expand icon
    expect(screen.getByTestId('body-1')).toBeInTheDocument();
    expect(screen.queryByTestId('expand-icon')).toBeNull();
  });

  it('calls getQuestStateColor with quest state', () => {
    const spyColor = vi.spyOn(StateUtils, 'getQuestStateColor');
    const quest: Quest = {
      id: 3,
      state: QuestState.Success,
      description: 'Q3',
      detail: '',
      subquests: [],
    } as Quest;
    useQuestContextSpy.mockReturnValue({
      quests: { current: new Map([[3, quest]]) },
    } as any);

    render(<QuestLogEntry id={3} level={0} />);
    expect(spyColor).toHaveBeenCalledWith(QuestState.Success);
  });
});
