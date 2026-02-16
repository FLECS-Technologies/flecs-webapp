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
import { SubQuestProgressIndicator } from '../SubQuestProgressIndicator';
import { QuestState, Quest } from '@flecs/core-client-ts';
import * as QuestUtils from '../../../utils/quests/Quest';
import * as StateUtils from '../../../utils/quests/QuestState';

// Helper to create a Quest object
const makeQuest = (id: number, state: QuestState, subquests: Quest[] = []): Quest => ({
  id,
  state,
  subquests,
  description: '',
});

describe('SubQuestProgressIndicator', () => {
  beforeEach(() => {
    // Mock questFinished and questStateRunning for predictable behavior
    vi.spyOn(QuestUtils, 'questFinished').mockImplementation(
      (quest) => quest.state === QuestState.Success,
    );
    vi.spyOn(StateUtils, 'questStateRunning').mockImplementation(
      (state) => state === QuestState.Ongoing,
    );
    vi.spyOn(StateUtils, 'getQuestStateProgressColor').mockReturnValue('secondary');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders nothing when there are no subquests', () => {
    const { container } = render(
      <SubQuestProgressIndicator state={QuestState.Pending} subquests={[]} />,
    );
    // Only the outer Box should render, with no progress content
    expect(container).toBeEmptyDOMElement();
  });

  it('displays correct counts and progress for mixed subquests', () => {
    const subquests: Quest[] = [
      makeQuest(1, QuestState.Success), // finished
      makeQuest(2, QuestState.Ongoing), // running
      makeQuest(3, QuestState.Ongoing), // running
      makeQuest(4, QuestState.Pending), // pending
      makeQuest(5, QuestState.Pending), // pending
    ];
    render(<SubQuestProgressIndicator state={QuestState.Pending} subquests={subquests} />);

    // Text counts
    expect(screen.getByText('1 finished')).toBeInTheDocument();
    expect(screen.getByText('2 running')).toBeInTheDocument();
    expect(screen.getByText('2 pending')).toBeInTheDocument();
    expect(screen.getByText('5 total')).toBeInTheDocument();
    expect(screen.getByText('20%')).toBeInTheDocument();

    // Progress bar container renders a single progressbar role
    const progressbar = screen.getByRole('progressbar');
    // Verify primary bar (finished): translateX of -(100 - finishedPercent) => -(100-20)= -80%
    const bar1 = progressbar.querySelector('.MuiLinearProgress-bar1') as HTMLElement;
    expect(bar1).toBeInTheDocument();
    expect(bar1.style.transform).toContain('translateX(-80%)');
    // Verify buffer bar (finished + running): translateX of -(100 - (20+40)) = -(100-60) = -40%
    const bar2 = progressbar.querySelector('.MuiLinearProgress-bar2') as HTMLElement;
    expect(bar2).toBeInTheDocument();
    expect(bar2.style.transform).toContain('translateX(-40%)');

    // Color applied from getQuestStateProgressColor
    expect(bar1).toHaveClass('MuiLinearProgress-barColorSecondary');
    expect(bar2).toHaveClass('MuiLinearProgress-colorSecondary');
  });

  it('handles all subquests finished', () => {
    const subquests = [makeQuest(1, QuestState.Success), makeQuest(2, QuestState.Success)];
    render(<SubQuestProgressIndicator state={QuestState.Success} subquests={subquests} />);

    expect(screen.getByText('2 finished')).toBeInTheDocument();
    expect(screen.getByText('0 running')).toBeInTheDocument();
    expect(screen.getByText('0 pending')).toBeInTheDocument();
    expect(screen.getByText('2 total')).toBeInTheDocument();
    expect(screen.getByText('100%')).toBeInTheDocument();

    const progressbar = screen.getByRole('progressbar');
    const bar1 = progressbar.querySelector('.MuiLinearProgress-bar1') as HTMLElement;
    const bar2 = progressbar.querySelector('.MuiLinearProgress-bar2') as HTMLElement;
    expect(bar1.style.transform).toContain('translateX(0%)'); // 100% finished => -(100-100)=0%
    expect(bar2.style.transform).toContain('translateX(0%)');
  });

  it('handles all subquests pending', () => {
    const subquests = [
      makeQuest(1, QuestState.Pending),
      makeQuest(2, QuestState.Pending),
      makeQuest(3, QuestState.Pending),
    ];
    render(<SubQuestProgressIndicator state={QuestState.Pending} subquests={subquests} />);

    expect(screen.getByText('0 finished')).toBeInTheDocument();
    expect(screen.getByText('0 running')).toBeInTheDocument();
    expect(screen.getByText('3 pending')).toBeInTheDocument();
    expect(screen.getByText('3 total')).toBeInTheDocument();
    expect(screen.getByText('0%')).toBeInTheDocument();

    const progressbar = screen.getByRole('progressbar');
    const bar1 = progressbar.querySelector('.MuiLinearProgress-bar1') as HTMLElement;
    const bar2 = progressbar.querySelector('.MuiLinearProgress-bar2') as HTMLElement;
    expect(bar1.style.transform).toContain('translateX(-100%)'); // 0% finished => -(100-0)= -100%
    expect(bar2.style.transform).toContain('translateX(-100%)');
  });
});
