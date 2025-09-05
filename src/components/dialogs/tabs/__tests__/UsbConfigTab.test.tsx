/*
 * Copyright (c) 2022 FLECS Technologies GmbH
 *
 * Created on Wed Apr 16 2025
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
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import UsbConfigTab from '../UsbConfigTab';
import { createMockApi } from '../../../../__mocks__/core-client-ts';
import { vi } from 'vitest';

// Mock the API provider
const mockUseProtectedApi = vi.fn();

vi.mock('../../../../components/providers/ApiProvider', () => ({
  useProtectedApi: () => mockUseProtectedApi(),
}));

describe('UsbConfigTab', () => {
  const mockInstanceId = 'test-instance-id';
  let mockApi: ReturnType<typeof createMockApi>;

  beforeEach(() => {
    mockApi = createMockApi();
    mockUseProtectedApi.mockReturnValue(mockApi);
  });

  it('renders loading spinner while fetching data', async () => {
    // Mock API responses
    mockApi.system.systemDevicesUsbGet.mockResolvedValueOnce({
      data: [],
    });
    mockApi.instances.instancesInstanceIdConfigDevicesUsbGet.mockResolvedValueOnce({
      data: [],
    });

    render(<UsbConfigTab instanceId={mockInstanceId} onChange={vi.fn()} />);

    // Check for loading spinner
    expect(screen.getByRole('progressbar')).toBeInTheDocument();

    // Wait for the spinner to disappear
    await waitFor(() => expect(screen.queryByRole('progressbar')).not.toBeInTheDocument());
  });

  it('renders the list of USB devices after fetching data', async () => {
    // Mock API responses
    mockApi.system.systemDevicesUsbGet.mockResolvedValueOnce({
      data: [
        {
          port: '1',
          name: 'Device1',
          vendor: 'Vendor1',
        },
        {
          port: '2',
          name: 'Device2',
          vendor: 'Vendor2',
        },
      ],
    });
    mockApi.instances.instancesInstanceIdConfigDevicesUsbGet.mockResolvedValueOnce({
      data: [{ port: '1', device_connected: true }],
    });

    render(<UsbConfigTab instanceId={mockInstanceId} onChange={vi.fn()} />);

    // Wait for the devices to be rendered
    await waitFor(() => {
      expect(screen.getByText('Device1')).toBeInTheDocument();
      expect(screen.getByText('Device2')).toBeInTheDocument();
      expect(screen.getByText('Vendor1')).toBeInTheDocument();
      expect(screen.getByText('Vendor2')).toBeInTheDocument();
    });
  });

  it('handles USB device toggle', async () => {
    // Mock API responses
    mockApi.system.systemDevicesUsbGet.mockResolvedValueOnce({
      data: [
        {
          port: '1',
          name: 'Device1',
          vendor: 'Vendor1',
        },
      ],
    });
    mockApi.instances.instancesInstanceIdConfigDevicesUsbGet.mockResolvedValueOnce({
      data: [],
    });
    mockApi.instances.instancesInstanceIdConfigDevicesUsbPortPut.mockResolvedValueOnce({});
    mockApi.instances.instancesInstanceIdConfigDevicesUsbPortDelete.mockResolvedValueOnce({});

    render(<UsbConfigTab instanceId={mockInstanceId} onChange={vi.fn()} />);

    // Wait for the devices to be rendered
    await waitFor(() => {
      expect(screen.getByText('Device1')).toBeInTheDocument();
    });

    // Find the toggle button and click it
    const toggleButton = screen.getByRole('button', { name: 'Enable' });
    fireEvent.click(toggleButton);

    // Wait for the API call to be made
    await waitFor(() =>
      expect(mockApi.instances.instancesInstanceIdConfigDevicesUsbPortPut).toHaveBeenCalledWith(
        mockInstanceId,
        '1',
      ),
    );
  });
});
