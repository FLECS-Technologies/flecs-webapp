/*
 * Copyright (c) 2022 FLECS Technologies GmbH
 *
 * Created on Mon Apr 11 2022
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
import { render, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SystemData } from '../SystemData';
import { useSystemContext } from '../SystemProvider';
import { createMockApi } from '../../__mocks__/core-client-ts';

// Mock the API provider
const mockUseProtectedApi = vi.fn();

vi.mock('../../components/providers/ApiProvider', () => ({
  useProtectedApi: () => mockUseProtectedApi(),
}));

vi.mock('../SystemProvider', () => ({ useSystemContext: vi.fn() }));

// Mock the DeviceState provider using the centralized mock
vi.mock('../../components/providers/DeviceStateProvider');

// Import the mock helpers
import { resetMockDeviceState } from '../../components/providers/__mocks__/DeviceStateProvider';

const mockSystem = {
  ping: true,
  setPing: vi.fn(),
  loading: false,
  setLoading: vi.fn(),
  systemInfo: undefined,
  setSystemInfo: vi.fn(),
};

describe('SystemData', () => {
  let mockApi;

  beforeEach(() => {
    vi.clearAllMocks();
    mockApi = createMockApi();
    mockUseProtectedApi.mockReturnValue(mockApi);
    useSystemContext.mockReturnValue(mockSystem);
    resetMockDeviceState(); // Reset the device state mock
  });

  it('renders SystemData component', async () => {
    render(<SystemData />);

    await waitFor(() => {
      // Verify the component calls the ping API
      expect(mockApi.system.systemPingGet).toHaveBeenCalled();
    });
  });
});
