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
import InstallApp from '../InstallApp';
import { ReferenceDataContextProvider } from '@contexts/data/ReferenceDataContext';
import { createMockApi, createMockQuestResult } from '../../../../__mocks__/core-client-ts';
import { createSuccessfulInstallTest, createFailedInstallTest } from '../../../../test/test-utils';

// Mock the API provider and Quest context
const mockUseProtectedApi = vi.fn();
const mockUseQuestContext = vi.fn();

vi.mock('@contexts/api/ApiProvider', () => ({
  useProtectedApi: () => mockUseProtectedApi(),
}));

vi.mock('@contexts/quests/QuestContext', () => ({
  useQuestContext: () => mockUseQuestContext(),
  QuestContext: {},
}));

const app = {
  appKey: {
    name: 'tech.flecs.ample',
    version: '4.2.0',
  },
  title: 'test app',
  status: 'installed',
  instances: [],
};

const handleActiveStep = vi.fn();

describe('InstallApp Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders InstallApp component', async () => {
    const { mockApi, mockQuestContext } = createSuccessfulInstallTest();
    mockUseProtectedApi.mockReturnValue(mockApi);
    mockUseQuestContext.mockReturnValue(mockQuestContext);

    await act(async () => {
      render(
        <ReferenceDataContextProvider>
          <InstallApp app={app} version="4.2.0" handleActiveStep={handleActiveStep} />
        </ReferenceDataContextProvider>,
      );
    });

    expect(screen.getByTestId('install-app-step')).toBeInTheDocument();
  });

  it('successfully installs app', async () => {
    const mockApi = createMockApi();

    // Create a more comprehensive mock quest context for the multi-step process
    const mockQuestContext = {
      quests: { current: new Map() },
      fetchQuest: vi.fn(() => Promise.resolve()),
      waitForQuest: vi
        .fn()
        .mockResolvedValueOnce(createMockQuestResult({ state: QuestState.Success })) // install step
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
          <InstallApp app={app} version="4.2.0" handleActiveStep={handleActiveStep} />
        </ReferenceDataContextProvider>,
      );
    });

    // Wait for the installation process to complete
    await waitFor(
      () => {
        expect(screen.getByText(app.title + ' successfully installed.')).toBeInTheDocument();
      },
      { timeout: 5000 },
    );

    // Verify the API calls were made
    expect(mockApi.app.appsInstallPost).toHaveBeenCalledWith({
      appKey: { name: app.appKey.name, version: '4.2.0' },
    });
    expect(mockApi.instances.instancesCreatePost).toHaveBeenCalledWith({
      appKey: { name: app.appKey.name, version: '4.2.0' },
    });
    expect(mockApi.instances.instancesInstanceIdStartPost).toHaveBeenCalledWith('instance-id');

    // Verify quest context methods were called multiple times (3 steps)
    expect(mockQuestContext.fetchQuest).toHaveBeenCalledTimes(3);
    expect(mockQuestContext.waitForQuest).toHaveBeenCalledTimes(3);

    // Verify handleActiveStep was called on success
    expect(handleActiveStep).toHaveBeenCalled();
  });

  it('handles installation failure', async () => {
    const { mockApi, mockQuestContext } = createFailedInstallTest('Installation failed');
    mockUseProtectedApi.mockReturnValue(mockApi);
    mockUseQuestContext.mockReturnValue(mockQuestContext);

    await act(async () => {
      render(
        <ReferenceDataContextProvider>
          <InstallApp app={app} version="4.2.0" handleActiveStep={handleActiveStep} />
        </ReferenceDataContextProvider>,
      );
    });

    // Wait for the error message to appear
    await waitFor(() => {
      expect(
        screen.getByText('Error during the installation of ' + app.title + '.'),
      ).toBeInTheDocument();
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

  it('handles missing app gracefully', async () => {
    const mockApi = createMockApi();
    const mockQuestContext = {
      quests: { current: new Map() },
      fetchQuest: vi.fn(() => Promise.resolve()),
      waitForQuest: vi.fn(() => Promise.resolve(createMockQuestResult())),
    };

    mockUseProtectedApi.mockReturnValue(mockApi);
    mockUseQuestContext.mockReturnValue(mockQuestContext);

    await act(async () => {
      render(
        <ReferenceDataContextProvider>
          <InstallApp handleActiveStep={handleActiveStep} />
        </ReferenceDataContextProvider>,
      );
    });

    // Wait for error message about undefined app
    await waitFor(() => {
      expect(screen.getByText('Error during the installation of undefined.')).toBeInTheDocument();
    });

    // Verify retry button works
    const retryButton = screen.getByRole('button', { name: 'Retry' });

    await act(async () => {
      fireEvent.click(retryButton);
    });

    await waitFor(() => {
      expect(screen.getByText('Error during the installation of undefined.')).toBeInTheDocument();
    });
  });

  it('shows quest progress during installation', async () => {
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
          <InstallApp app={app} version="4.2.0" handleActiveStep={handleActiveStep} />
        </ReferenceDataContextProvider>,
      );
    });

    // Initially should show the info message
    expect(
      screen.getByText(
        'You can close this window. Installation takes place automatically in the background.',
      ),
    ).toBeInTheDocument();

    // Quest log entry should be rendered when currentQuest is set
    await waitFor(() => {
      // The QuestLogEntry component should be rendered with the quest ID
      expect(mockQuestContext.fetchQuest).toHaveBeenCalled();
    });
  });
});
