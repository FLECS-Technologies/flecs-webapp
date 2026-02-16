/*
 * Copyright (c) 2021 FLECS Technologies GmbH
 *
 * Created on Mon Nov 04 2024
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
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AppInstanceRow from '../AppInstanceRow';
import { createMockApi } from '../../../__mocks__/core-client-ts';

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

// Mock React.useContext for ReferenceDataContext
const mockSetUpdateAppList = vi.fn();
vi.mock('react', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useContext: vi.fn(() => ({
      setUpdateAppList: mockSetUpdateAppList,
    })),
  };
});

describe('AppInstanceRow Component', () => {
  let mockApi;
  let mockQuestContext;

  const mockApp = {
    title: 'Test App',
    appKey: { version: '1.0.0', name: 'Test App' },
    instances: [{ instanceId: '1', instanceName: 'Test Instance', status: 'stopped' }],
    editors: [{ name: 'editor', url: '/editor' }],
  };
  const mockAppInstance = {
    instanceId: '1',
    instanceName: 'Test Instance',
    appKey: mockApp.appKey,
    status: 'stopped',
    editors: [{ name: 'editor', url: '/editor' }],
  };

  beforeEach(() => {
    vi.resetAllMocks();
    mockApi = createMockApi();
    mockQuestContext = {
      quests: { current: new Map() },
      fetchQuest: vi.fn(() => Promise.resolve()),
      waitForQuest: vi.fn(() => Promise.resolve({ state: 'Success' })),
    };

    mockUseProtectedApi.mockReturnValue(mockApi);
    mockUseQuestContext.mockReturnValue(mockQuestContext);
    mockSetUpdateAppList.mockClear();
  });

  function renderComponent() {
    return render(
      <table>
        <tbody>
          <AppInstanceRow app={mockApp} appInstance={mockAppInstance} />
        </tbody>
      </table>,
    );
  }

  it('renders component with app instance details', () => {
    renderComponent();
    expect(screen.getByText('Test Instance')).toBeInTheDocument();
    expect(screen.getByText('1.0.0')).toBeInTheDocument();
  });

  it('shows start button and calls startInstance function when clicked', async () => {
    renderComponent();
    const startButton = screen.getByLabelText('start-instance-button');

    await act(async () => {
      fireEvent.click(startButton);
    });
  });

  it('shows stop button and calls stopInstance function when clicked', async () => {
    mockAppInstance.status = 'running';

    renderComponent();
    const stopButton = screen.getByLabelText('stop-instance-button');

    await act(async () => {
      fireEvent.click(stopButton);
    });
  });

  it('disables start button if instance is running', () => {
    mockAppInstance.status = 'running';
    renderComponent();

    const startButton = screen.getByLabelText('start-instance-button');
    expect(startButton).toBeDisabled();
  });

  it('shows delete confirmation dialog when delete button is clicked', async () => {
    renderComponent();
    const deleteButton = screen.getByLabelText('delete-instance-button');

    await act(async () => {
      fireEvent.click(deleteButton);
    });

    expect(screen.getByText('Remove Test Instance instance?')).toBeInTheDocument();
  });

  it('calls deleteInstance function after confirmation', async () => {
    renderComponent();
    const deleteButton = screen.getByLabelText('delete-instance-button');

    await act(async () => {
      fireEvent.click(deleteButton);
    });

    const confirmButton = screen.getByText('Remove Test Instance instance?');

    await act(async () => {
      fireEvent.click(confirmButton);
    });
  });

  it('opens info dialog when info button is clicked', async () => {
    renderComponent();
    const infoButton = screen.getByLabelText('instance-info-button');

    await act(async () => {
      fireEvent.click(infoButton);
    });

    expect(screen.getByText('Info to Test Instance')).toBeInTheDocument();
  });

  it('opens settings dialog when settings button is clicked', async () => {
    renderComponent();
    const settingsButton = screen.getByLabelText('instance-settings-button');

    await act(async () => {
      fireEvent.click(settingsButton);
    });

    expect(screen.getByText('Configure Test Instance')).toBeInTheDocument();
  });

  it('displays snackbar with success message on successful instance start', async () => {
    renderComponent();
    const startButton = screen.getByLabelText('start-instance-button');

    await act(async () => {
      fireEvent.click(startButton);
    });
  });
});
