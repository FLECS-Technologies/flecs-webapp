/*
 * Copyright (c) 2022 FLECS Technologies GmbH
 *
 * Created on Tue Jan 30 2024
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
import { render, screen, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QuestState } from '@flecs/core-client-ts';
import InstallationStepper from '../InstallationStepper';
import { DeviceActivationContext } from '../../../providers/DeviceActivationContext';
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

const mockApp = {
  appKey: {
    name: 'tech.flecs.test',
    version: '1.0.0',
  },
  title: 'Test App',
  description: 'A test application',
  status: 'available',
  instances: [],
  installedVersions: ['0.9.0'],
};

const createMockDeviceActivationContext = (activated = true) => ({
  activated,
  activating: false,
  activate: vi.fn(),
  validating: false,
  validate: vi.fn(),
  error: false,
  statusText: '',
});

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

describe('InstallationStepper Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseProtectedApi.mockReturnValue(createMockApi());
    mockUseQuestContext.mockReturnValue(createMockQuestContext());
  });

  it('renders app installation stepper when device is activated', async () => {
    const mockDeviceContext = createMockDeviceActivationContext(true);

    await act(async () => {
      render(
        <ReferenceDataContextProvider>
          <DeviceActivationContext.Provider value={mockDeviceContext}>
            <InstallationStepper
              app={mockApp}
              version={mockApp.appKey.version}
              sideload={false}
              update={false}
            />
          </DeviceActivationContext.Provider>
        </ReferenceDataContextProvider>,
      );
    });

    // Should show the installation step since device is activated
    await waitFor(() => {
      expect(screen.getByTestId('install-app-step')).toBeInTheDocument();
    });

    // Should show stepper with correct labels
    expect(screen.getByText('Check Device Activation')).toBeInTheDocument();
    expect(screen.getByText('Installing')).toBeInTheDocument();
    expect(screen.getByText('Done')).toBeInTheDocument();
  });

  it('renders app update stepper when update=true', async () => {
    const mockDeviceContext = createMockDeviceActivationContext(true);

    await act(async () => {
      render(
        <ReferenceDataContextProvider>
          <DeviceActivationContext.Provider value={mockDeviceContext}>
            <InstallationStepper app={mockApp} version="2.0.0" sideload={false} update={true} />
          </DeviceActivationContext.Provider>
        </ReferenceDataContextProvider>,
      );
    });

    // Should show the update step since device is activated and update=true
    await waitFor(() => {
      expect(screen.getByTestId('update-app-step')).toBeInTheDocument();
    });
  });

  it('renders app sideload stepper when sideload=true', async () => {
    const mockDeviceContext = createMockDeviceActivationContext(true);

    await act(async () => {
      render(
        <ReferenceDataContextProvider>
          <DeviceActivationContext.Provider value={mockDeviceContext}>
            <InstallationStepper
              app={mockApp}
              version={mockApp.appKey.version}
              sideload={true}
              update={false}
            />
          </DeviceActivationContext.Provider>
        </ReferenceDataContextProvider>,
      );
    });

    // Should show the sideload step since device is activated and sideload=true
    await waitFor(() => {
      expect(screen.getByTestId('sideload-app-step')).toBeInTheDocument();
    });
  });

  it('renders device activation step when device is not activated', async () => {
    const mockDeviceContext = createMockDeviceActivationContext(false);

    await act(async () => {
      render(
        <ReferenceDataContextProvider>
          <DeviceActivationContext.Provider value={mockDeviceContext}>
            <InstallationStepper
              app={mockApp}
              version={mockApp.appKey.version}
              sideload={false}
              update={false}
            />
          </DeviceActivationContext.Provider>
        </ReferenceDataContextProvider>,
      );
    });

    // Should show the device activation step since device is not activated
    expect(screen.getByTestId('device-activation-step')).toBeInTheDocument();
  });

  it('handles step progression correctly', async () => {
    const mockDeviceContext = createMockDeviceActivationContext(false);

    const { rerender } = await act(async () => {
      return render(
        <ReferenceDataContextProvider>
          <DeviceActivationContext.Provider value={mockDeviceContext}>
            <InstallationStepper
              app={mockApp}
              version={mockApp.appKey.version}
              sideload={false}
              update={false}
            />
          </DeviceActivationContext.Provider>
        </ReferenceDataContextProvider>,
      );
    });

    // Initially should show device activation step
    expect(screen.getByTestId('device-activation-step')).toBeInTheDocument();

    // Simulate device becoming activated
    const activatedContext = createMockDeviceActivationContext(true);

    await act(async () => {
      rerender(
        <ReferenceDataContextProvider>
          <DeviceActivationContext.Provider value={activatedContext}>
            <InstallationStepper
              app={mockApp}
              version={mockApp.appKey.version}
              sideload={false}
              update={false}
            />
          </DeviceActivationContext.Provider>
        </ReferenceDataContextProvider>,
      );
    });

    // Should now show installation step
    await waitFor(() => {
      expect(screen.getByTestId('install-app-step')).toBeInTheDocument();
    });
  });
});
