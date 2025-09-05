/*
 * Copyright (c) 2022 FLECS Technologies GmbH
 *
 * Created on Thu Feb 10 2022
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
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { QuestState } from '@flecs/core-client-ts';
import SideloadApp from '../SideloadApp';
import { ReferenceDataContextProvider } from '../../../../data/ReferenceDataContext';
import { createMockApi, createMockQuestResult } from '../../../../__mocks__/core-client-ts';

// Mock the API provider and Quest context
const mockUseProtectedApi = vi.fn();
const mockUseQuestContext = vi.fn();

vi.mock('../../../../components/providers/ApiProvider', () => ({
  useProtectedApi: () => mockUseProtectedApi(),
}));

vi.mock('../../../quests/QuestContext', () => ({
  useQuestContext: () => mockUseQuestContext(),
  QuestContext: {},
}));

const mockManifest = {
  app: 'tech.flecs.ample',
  version: '4.2.0',
  title: 'test app',
  instances: [],
};

const createMockQuestContext = () => ({
  quests: { current: new Map() },
  fetchQuest: vi.fn(() => Promise.resolve()),
  waitForQuest: vi.fn(() => Promise.resolve(createMockQuestResult({ state: QuestState.Success }))),
  setFetching: vi.fn(),
  fetching: false,
  clearQuests: vi.fn(),
  mainQuestIds: [],
  waitForQuests: vi.fn(),
});

describe('SideloadApp Component', () => {
  let mockHandleActiveStep;

  beforeEach(() => {
    vi.clearAllMocks();
    mockHandleActiveStep = vi.fn();
    mockUseProtectedApi.mockReturnValue(createMockApi());
    mockUseQuestContext.mockReturnValue(createMockQuestContext());
  });

  it('renders SideloadApp component', async () => {
    await act(async () => {
      render(
        <ReferenceDataContextProvider>
          <SideloadApp manifest={mockManifest} handleActiveStep={mockHandleActiveStep} />
        </ReferenceDataContextProvider>,
      );
    });

    expect(screen.getByTestId('sideload-app-step')).toBeInTheDocument();
  });

  it('successfully sideloads app', async () => {
    const mockApi = createMockApi();

    // Create a mock quest context for the multi-step sideload process
    const mockQuestContext = {
      quests: { current: new Map() },
      fetchQuest: vi.fn(() => Promise.resolve()),
      waitForQuest: vi
        .fn()
        .mockResolvedValueOnce(createMockQuestResult({ state: QuestState.Success })) // sideload step
        .mockResolvedValueOnce(
          createMockQuestResult({ state: QuestState.Success, result: 'instance-id' }),
        ) // create instance step
        .mockResolvedValueOnce(createMockQuestResult({ state: QuestState.Success })), // start instance step
    };

    mockUseProtectedApi.mockReturnValue(mockApi);
    mockUseQuestContext.mockReturnValue(mockQuestContext);

    await act(async () => {
      render(
        <ReferenceDataContextProvider>
          <SideloadApp manifest={mockManifest} handleActiveStep={mockHandleActiveStep} />
        </ReferenceDataContextProvider>,
      );
    });

    // Wait for the sideload process to complete
    await waitFor(
      () => {
        expect(
          screen.getByText(mockManifest.title + ' successfully installed.'),
        ).toBeInTheDocument();
      },
      { timeout: 5000 },
    );

    // Verify the API calls were made
    expect(mockApi.app.appsSideloadPost).toHaveBeenCalledWith({
      manifest: JSON.stringify(mockManifest),
    });
    expect(mockApi.instances.instancesCreatePost).toHaveBeenCalledWith({
      appKey: { name: mockManifest.app, version: mockManifest.version },
    });
    expect(mockApi.instances.instancesInstanceIdStartPost).toHaveBeenCalledWith('instance-id');

    // Verify quest context methods were called multiple times (3 steps)
    expect(mockQuestContext.fetchQuest).toHaveBeenCalledTimes(3);
    expect(mockQuestContext.waitForQuest).toHaveBeenCalledTimes(3);

    // Verify handleActiveStep was called on success
    expect(mockHandleActiveStep).toHaveBeenCalled();
  });

  it('handles sideload failure', async () => {
    const mockApi = createMockApi();

    // Create a quest context that fails on the first step
    const mockQuestContext = {
      quests: { current: new Map() },
      fetchQuest: vi.fn(() => Promise.resolve()),
      waitForQuest: vi.fn(() =>
        Promise.resolve(
          createMockQuestResult({
            state: QuestState.Failed,
            description: 'Sideload failed',
          }),
        ),
      ),
    };

    mockUseProtectedApi.mockReturnValue(mockApi);
    mockUseQuestContext.mockReturnValue(mockQuestContext);

    await act(async () => {
      render(
        <ReferenceDataContextProvider>
          <SideloadApp manifest={mockManifest} handleActiveStep={mockHandleActiveStep} />
        </ReferenceDataContextProvider>,
      );
    });

    // Wait for the retry button to appear (indicates error state)
    await waitFor(() => {
      const retryButton = screen.getByRole('button', { name: 'Retry' });
      expect(retryButton).toBeInTheDocument();
    });

    // Test retry functionality
    const retryButton = screen.getByRole('button', { name: 'Retry' });
    await act(async () => {
      fireEvent.click(retryButton);
    });

    // Verify API calls were made again
    await waitFor(() => {
      expect(mockApi.app.appsSideloadPost).toHaveBeenCalledTimes(2);
    });
  });

  it('handles missing manifest gracefully', async () => {
    await act(async () => {
      render(
        <ReferenceDataContextProvider>
          <SideloadApp handleActiveStep={mockHandleActiveStep} />
        </ReferenceDataContextProvider>,
      );
    });

    // Wait for retry button to appear (indicates error state due to missing manifest)
    await waitFor(() => {
      const retryButton = screen.getByRole('button', { name: 'Retry' });
      expect(retryButton).toBeInTheDocument();
    });

    // Test retry functionality
    const retryButton = screen.getByRole('button', { name: 'Retry' });

    await act(async () => {
      fireEvent.click(retryButton);
    });

    // Should still show retry button after retry
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument();
    });
  });

  it('shows quest progress during sideloading', async () => {
    const mockApi = createMockApi();
    const mockQuestContext = {
      quests: { current: new Map() },
      fetchQuest: vi.fn(() => Promise.resolve()),
      waitForQuest: vi.fn(
        () => new Promise((resolve) => setTimeout(() => resolve(createMockQuestResult()), 100)),
      ),
    };

    mockUseProtectedApi.mockReturnValue(mockApi);
    mockUseQuestContext.mockReturnValue(mockQuestContext);

    await act(async () => {
      render(
        <ReferenceDataContextProvider>
          <SideloadApp manifest={mockManifest} handleActiveStep={mockHandleActiveStep} />
        </ReferenceDataContextProvider>,
      );
    });

    // Quest log entry should be rendered when currentQuest is set
    await waitFor(() => {
      // The QuestLogEntry component should be rendered with the quest ID
      expect(mockQuestContext.fetchQuest).toHaveBeenCalled();
    });
  });
});
