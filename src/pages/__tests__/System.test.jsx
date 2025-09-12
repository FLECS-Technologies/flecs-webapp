/*
 * Copyright (c) 2021 FLECS Technologies GmbH
 *
 * Created on Tue Nov 30 2021
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
import { BrowserRouter as Router } from 'react-router-dom';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import System from '../System';
import { MarketplaceUserProvider } from '../../components/providers/MarketplaceUserProvider';
import { createMockApi } from '../../__mocks__/core-client-ts';

// Mock the API provider
const mockUseProtectedApi = vi.fn();

vi.mock('../../components/providers/ApiProvider', () => ({
  useProtectedApi: () => mockUseProtectedApi(),
}));

vi.mock('../../api/device/license/info');
vi.mock('../../api/device/license/status');

describe('System', () => {
  let mockApi;

  beforeEach(() => {
    vi.clearAllMocks();
    mockApi = createMockApi();
    mockUseProtectedApi.mockReturnValue(mockApi);
  });

  it('renders System page', async () => {
    render(
      <MarketplaceUserProvider>
        <Router>
          <System />
        </Router>
      </MarketplaceUserProvider>,
    );

    await waitFor(() => {
      expect(screen.getByLabelText('system-page')).toBeVisible();
    });

    expect(screen.getByLabelText('open-source')).toBeVisible();
    // screen.debug()
  });
});
