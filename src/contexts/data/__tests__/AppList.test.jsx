/*
 * Copyright (c) 2022 FLECS Technologies GmbH
 *
 * Created on Wed Jun 01 2022
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
import { AppList } from '@data/AppList';
import { useReferenceDataContext } from '../ReferenceDataContext';
import { createMockApi } from '../../../__mocks__/core-client-ts';

// Mock the API provider
const mockUseProtectedApi = vi.fn();

vi.mock('@contexts/api/ApiProvider', () => ({
  useProtectedApi: () => mockUseProtectedApi(),
}));

vi.mock('../../api/marketplace/ProductService');
vi.mock('../../api/device/DeviceAPI');
vi.mock('../ReferenceDataContext', () => ({ useReferenceDataContext: vi.fn() }));

const mockReferenceDataContext = {
  setAppList: vi.fn(),
  setAppListLoading: vi.fn(),
  setAppListError: vi.fn(),
  setUpdateAppList: vi.fn(),
  setLoadedProducts: vi.fn(),
  updateAppList: true, // Set to true to trigger loadAppList
  appListLoading: false,
  loadedProducts: [], // Set to empty array (truthy) to trigger loadAppList instead of loadProducts
};

describe('AppList', () => {
  let mockApi;

  beforeEach(() => {
    vi.clearAllMocks();
    mockApi = createMockApi();
    mockUseProtectedApi.mockReturnValue(mockApi);
  });

  it('renders AppList component', async () => {
    useReferenceDataContext.mockReturnValue(mockReferenceDataContext);
    render(<AppList></AppList>);

    await waitFor(() => {
      expect(mockApi.instances.instancesGet).toHaveBeenCalled();
      expect(mockApi.app.appsGet).toHaveBeenCalled();
    });
  });
});
