/*
 * Copyright (c) 2022 FLECS Technologies GmbH
 *
 * Created on Fri Apr 08 2022
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
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import InstanceLog from '../InstanceLog';
import { createMockApi } from '../../../__mocks__/core-client-ts';

// Mock the API provider
const mockUseProtectedApi = vi.fn();

vi.mock('@contexts/api/ApiProvider', () => ({
  useProtectedApi: () => mockUseProtectedApi(),
}));

const testInstance = {
  instanceName: 'TestInstance',
  instanceId: 'ABCDE',
  version: '1.0.0',
  status: 'running',
  desired: 'stopped',
};

describe('InstanceLog', () => {
  let mockApi;

  beforeEach(() => {
    vi.clearAllMocks();
    mockApi = createMockApi();
    mockUseProtectedApi.mockReturnValue(mockApi);
  });

  it('renders InstanceLog component', async () => {
    render(<InstanceLog instance={testInstance}></InstanceLog>);

    await waitFor(() => {
      expect(screen.getByTestId('log-editor')).toBeVisible();
    });
  });

  it('Click refresh', async () => {
    render(<InstanceLog instance={testInstance}></InstanceLog>);

    const refreshButton = await waitFor(() => screen.getByTestId('refresh-button'));

    fireEvent.click(refreshButton);

    await waitFor(() => {
      expect(screen.getByTestId('log-editor')).toBeVisible();
    });
  });
});
