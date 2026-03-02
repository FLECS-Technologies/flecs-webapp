/*
 * Copyright (c) 2022 FLECS Technologies GmbH
 *
 * Created on Thu Apr 07 2022
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
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import InstanceDetails from '../InstanceDetails';
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

describe('InstanceDetails', () => {
  let mockApi;

  beforeEach(() => {
    vi.clearAllMocks();
    mockApi = createMockApi();
    mockUseProtectedApi.mockReturnValue(mockApi);
  });

  it('renders InstanceDetails component', async () => {
    render(<InstanceDetails instance={testInstance}></InstanceDetails>);

    // Wait for the component to finish loading and API calls to complete
    await waitFor(() => {
      expect(screen.getByText('Storage')).toBeVisible();
    });
  });
});
