/*
 * Copyright (c) 2022 FLECS Technologies GmbH
 *
 * Created on Wed Mar 02 2022
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
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import InstanceInfo from '../InstanceInfo';
import { createMockApi } from '../../__mocks__/core-client-ts';

// Mock the API provider for child components
const mockUseProtectedApi = vi.fn();

vi.mock('@contexts/api/ApiProvider', () => ({
  useProtectedApi: () => mockUseProtectedApi(),
}));

const testInstance = {
  instanceName: 'TestInstance',
  instanceId: 'ABCDE',
  appKey: {
    version: '1.0.0',
  },
  status: 'running',
  desired: 'stopped',
};

describe('InstanceInfo', () => {
  let mockApi;

  beforeEach(() => {
    vi.clearAllMocks();
    mockApi = createMockApi();
    mockUseProtectedApi.mockReturnValue(mockApi);
  });

  it('renders InstanceInfo component', async () => {
    render(<InstanceInfo instance={testInstance}></InstanceInfo>);

    // Wait for the component and child components to finish loading
    await waitFor(() => {
      expect(screen.getByText('TestInstance')).toBeVisible();
      expect(screen.getByText('ABCDE')).toBeVisible();
      expect(screen.getByText('1.0.0')).toBeVisible();
      expect(screen.getByText('running')).toBeVisible();
      expect(screen.getByText('stopped')).toBeVisible();
    });
  });
});
