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
import { QuestProgressIndicator } from '../QuestProgressIndicator';
import { QuestState } from '@flecs/core-client-ts';
import * as StateUtils from '../../../utils/quests/QuestState';

describe('QuestProgressIndicator', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('renders determinate progress correctly', () => {
    const mockColor = 'secondary';
    vi.spyOn(StateUtils, 'getQuestStateProgressColor').mockReturnValue(mockColor);

    const progress = { current: 3, total: 6 };
    render(<QuestProgressIndicator progress={progress} state={QuestState.Ongoing} />);

    // Percentage text
    expect(screen.getByText('3 of 6')).toBeInTheDocument();
    expect(screen.getByText('50%')).toBeInTheDocument();

    // Progress bar role with aria-valuenow = 50
    const bar = screen.getByRole('progressbar');
    expect(bar).toHaveAttribute('aria-valuenow', '50');

    // Color class applied
    expect(bar).toHaveClass(
      `MuiLinearProgress-color${mockColor.charAt(0).toUpperCase() + mockColor.slice(1)}`,
    );
  });

  it('renders indeterminate progress when total is zero', () => {
    const mockColor = 'primary';
    vi.spyOn(StateUtils, 'getQuestStateProgressColor').mockReturnValue(mockColor);

    const progress = { current: 4, total: undefined };
    render(<QuestProgressIndicator progress={progress} state={QuestState.Pending} />);

    // Text uses 'unknown' for total
    expect(screen.getByText('4 of unknown')).toBeInTheDocument();
    // Percent displayed as rounded 100% (100*4/4)
    expect(screen.getByText('100%')).toBeInTheDocument();

    const bar = screen.getByRole('progressbar');
    // Indeterminate bars do not have aria-valuenow
    expect(bar).not.toHaveAttribute('aria-valuenow');
    // Should have indeterminate class
    expect(bar).toHaveClass('MuiLinearProgress-indeterminate');
    // Color class still applied
    expect(bar).toHaveClass(
      `MuiLinearProgress-color${mockColor.charAt(0).toUpperCase() + mockColor.slice(1)}`,
    );
  });
});
