/*
 * Copyright (c) 2022 FLECS Technologies GmbH
 *
 * Created on Thu Oct 13 2022
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
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { QuestState } from '@flecs/core-client-ts';
import UpdateApp from '../UpdateApp';
import { ReferenceDataContext } from '../../../../data/ReferenceDataContext';
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

// Mock the UpdateInstances function
vi.mock('../../../../api/device/instances/instance', () => ({
  UpdateInstances: vi.fn(() => Promise.resolve([101, 102])), // Mock quest IDs
}));

const mockInstalledApp = {
  appKey: {
    name: 'tech.flecs.ample',
    version: '4.2.0',
  },
  title: 'Test App',
  status: 'installed',
  instances: [
    { id: 'instance-1', status: 'running' },
    { id: 'instance-2', status: 'stopped' },
  ],
};

const mockAppList = [mockInstalledApp];

const createMockQuestContext = () => ({
  quests: { current: new Map() },
  fetchQuest: vi.fn(() => Promise.resolve()),
  waitForQuest: vi.fn(() => Promise.resolve(createMockQuestResult({ state: QuestState.Success }))),
  waitForQuests: vi.fn(() =>
    Promise.resolve([
      createMockQuestResult({ state: QuestState.Success }),
      createMockQuestResult({ state: QuestState.Success }),
    ]),
  ),
  setFetching: vi.fn(),
  fetching: false,
  clearQuests: vi.fn(),
  mainQuestIds: [],
});

const createMockReferenceDataContext = (appList = mockAppList) => ({
  appList,
  setUpdateAppList: vi.fn(),
});

describe('UpdateApp Component', () => {
  let mockHandleActiveStep;

  beforeEach(() => {
    vi.clearAllMocks();
    mockHandleActiveStep = vi.fn();
    mockUseProtectedApi.mockReturnValue(createMockApi());
    mockUseQuestContext.mockReturnValue(createMockQuestContext());
  });

  it('renders UpdateApp component', async () => {
    const mockReferenceContext = createMockReferenceDataContext();

    await act(async () => {
      render(
        <ReferenceDataContext.Provider value={mockReferenceContext}>
          <UpdateApp
            app={mockInstalledApp}
            from="4.2.0"
            to="4.3.0"
            handleActiveStep={mockHandleActiveStep}
          />
        </ReferenceDataContext.Provider>,
      );
    });

    expect(screen.getByTestId('update-app-step')).toBeInTheDocument();
  });

  it('successfully updates app', async () => {
    const mockApi = createMockApi();
    const mockQuestContext = createMockQuestContext();
    const mockReferenceContext = createMockReferenceDataContext();

    mockUseProtectedApi.mockReturnValue(mockApi);
    mockUseQuestContext.mockReturnValue(mockQuestContext);

    await act(async () => {
      render(
        <ReferenceDataContext.Provider value={mockReferenceContext}>
          <UpdateApp
            app={mockInstalledApp}
            from="4.2.0"
            to="4.3.0"
            handleActiveStep={mockHandleActiveStep}
          />
        </ReferenceDataContext.Provider>,
      );
    });

    // Wait for the update process to complete
    await waitFor(
      () => {
        expect(
          screen.getByText(
            'Congratulations! Test App was successfully updated from version 4.2.0 to version 4.3.0!',
          ),
        ).toBeInTheDocument();
      },
      { timeout: 5000 },
    );

    // Verify the API calls were made
    expect(mockApi.app.appsInstallPost).toHaveBeenCalledWith({
      appKey: { name: mockInstalledApp.appKey.name, version: '4.3.0' },
    });

    // Verify quest context methods were called
    expect(mockQuestContext.fetchQuest).toHaveBeenCalled();
    expect(mockQuestContext.waitForQuest).toHaveBeenCalled();
    expect(mockQuestContext.waitForQuests).toHaveBeenCalled();

    // Verify handleActiveStep was called on success
    expect(mockHandleActiveStep).toHaveBeenCalled();

    // Verify reference data context was updated
    expect(mockReferenceContext.setUpdateAppList).toHaveBeenCalledWith(true);
  });

  it('handles update failure', async () => {
    const mockApi = createMockApi();

    // Create a quest context that fails on the install step
    const mockQuestContext = {
      quests: { current: new Map() },
      fetchQuest: vi.fn(() => Promise.resolve()),
      waitForQuest: vi.fn(() =>
        Promise.resolve(
          createMockQuestResult({
            state: QuestState.Failed,
            description: 'Installation failed',
          }),
        ),
      ),
      waitForQuests: vi.fn(() => Promise.resolve([])),
    };

    const mockReferenceContext = createMockReferenceDataContext();

    mockUseProtectedApi.mockReturnValue(mockApi);
    mockUseQuestContext.mockReturnValue(mockQuestContext);

    await act(async () => {
      render(
        <ReferenceDataContext.Provider value={mockReferenceContext}>
          <UpdateApp
            app={mockInstalledApp}
            from="4.2.0"
            to="4.3.0"
            handleActiveStep={mockHandleActiveStep}
          />
        </ReferenceDataContext.Provider>,
      );
    });

    // Wait for the error message to appear
    await waitFor(() => {
      expect(screen.getByText(/Oops... Installation failed/)).toBeInTheDocument();
    });

    // Verify retry button is present
    const retryButton = screen.getByRole('button', { name: 'Retry' });
    expect(retryButton).toBeInTheDocument();

    // Test retry functionality
    await act(async () => {
      fireEvent.click(retryButton);
    });

    // Verify API calls were made again
    await waitFor(() => {
      expect(mockApi.app.appsInstallPost).toHaveBeenCalledTimes(2);
    });
  });

  it('handles missing installed app gracefully', async () => {
    const mockReferenceContext = createMockReferenceDataContext([]);

    await act(async () => {
      render(
        <ReferenceDataContext.Provider value={mockReferenceContext}>
          <UpdateApp
            app={mockInstalledApp}
            from="4.2.0"
            to="4.3.0"
            handleActiveStep={mockHandleActiveStep}
          />
        </ReferenceDataContext.Provider>,
      );
    });

    // Wait for error message about app not being installed
    await waitFor(() => {
      expect(
        screen.getByText(/tech.flecs.ample is not installed and therefore can't be updated!/),
      ).toBeInTheDocument();
    });

    // Verify retry button is present
    const retryButton = screen.getByRole('button', { name: 'Retry' });
    expect(retryButton).toBeInTheDocument();
  });

  it('handles downgrade scenario', async () => {
    const mockApi = createMockApi();
    const mockQuestContext = createMockQuestContext();
    const mockReferenceContext = createMockReferenceDataContext();

    mockUseProtectedApi.mockReturnValue(mockApi);
    mockUseQuestContext.mockReturnValue(mockQuestContext);

    await act(async () => {
      render(
        <ReferenceDataContext.Provider value={mockReferenceContext}>
          <UpdateApp
            app={mockInstalledApp}
            from="4.2.0"
            to="4.1.0"
            handleActiveStep={mockHandleActiveStep}
          />
        </ReferenceDataContext.Provider>,
      );
    });

    // Wait for the downgrade success message
    await waitFor(
      () => {
        expect(
          screen.getByText(
            'Congratulations! Test App was successfully downgraded from version 4.2.0 to version 4.1.0!',
          ),
        ).toBeInTheDocument();
      },
      { timeout: 5000 },
    );

    // Verify the API calls were made
    expect(mockApi.app.appsInstallPost).toHaveBeenCalledWith({
      appKey: { name: mockInstalledApp.appKey.name, version: '4.1.0' },
    });
  });
});
