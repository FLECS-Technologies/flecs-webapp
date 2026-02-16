/*
 * Copyright (c) 2022 FLECS Technologies GmbH
 *
 * Created on Mon Jun 10 2024
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
import LicenseInfo from '../LicenseInfo';
import { mockDeviceLicenseInfoGet200Response } from '../../../../api/device/license/__mocks__/info';
import { createMockApi } from '../../../../__mocks__/core-client-ts';

// Mock the API provider
const mockUseProtectedApi = vi.fn();

vi.mock('@contexts/api/ApiProvider', () => ({
  useProtectedApi: () => mockUseProtectedApi(),
}));

// Mock the DeviceActivationContext
vi.mock('@contexts/device/DeviceActivationContext', () => ({
  DeviceActivationContext: React.createContext({}),
}));

vi.mock('../../../../api/device/license/info');

describe('LicenseInfo Component', () => {
  let mockApi;

  beforeEach(() => {
    vi.clearAllMocks();
    mockApi = createMockApi();
    mockUseProtectedApi.mockReturnValue(mockApi);
  });

  it('Show license info', async () => {
    render(<LicenseInfo />);
    await waitFor(() => {
      // Check that the license table is rendered
      const licenseTable = screen.getByLabelText('license-info-table');
      expect(licenseTable).toBeInTheDocument();

      // Check that the license information header is present
      const headerText = screen.getByText('License information');
      expect(headerText).toBeInTheDocument();

      // Check that License and Type rows are present
      const licenseLabel = screen.getByText('License');
      expect(licenseLabel).toBeInTheDocument();
    });
  });
});
