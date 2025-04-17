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
import React from 'react'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import UsbConfigTab from '../UsbConfigTab'
import { api } from '../../../../api/flecs-core/api-client'

// Mock the API client
jest.mock('../../../../api/flecs-core/api-client', () => ({
  api: {
    system: {
      systemDevicesUsbGet: jest.fn()
    },
    instances: {
      instancesInstanceIdConfigDevicesUsbGet: jest.fn(),
      instancesInstanceIdConfigDevicesUsbPortPut: jest.fn(),
      instancesInstanceIdConfigDevicesUsbPortDelete: jest.fn()
    }
  }
}))

describe('UsbConfigTab', () => {
  const mockInstanceId = 'test-instance-id'

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders loading spinner while fetching data', async () => {
    // Mock API responses
    ;(api.system.systemDevicesUsbGet as jest.Mock).mockResolvedValueOnce({
      data: []
    })
    ;(
      api.instances.instancesInstanceIdConfigDevicesUsbGet as jest.Mock
    ).mockResolvedValueOnce({
      data: []
    })

    render(<UsbConfigTab instanceId={mockInstanceId} onChange={jest.fn()} />)

    // Check for loading spinner
    expect(screen.getByRole('progressbar')).toBeInTheDocument()

    // Wait for the spinner to disappear
    await waitFor(() =>
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
    )
  })

  it('renders the list of USB devices after fetching data', async () => {
    // Mock API responses
    ;(api.system.systemDevicesUsbGet as jest.Mock).mockResolvedValueOnce({
      data: [
        {
          port: '1',
          name: 'Device1',
          vendor: 'Vendor1',
          device_connected: true
        },
        {
          port: '2',
          name: 'Device2',
          vendor: 'Vendor2',
          device_connected: false
        }
      ]
    })
    ;(
      api.instances.instancesInstanceIdConfigDevicesUsbGet as jest.Mock
    ).mockResolvedValueOnce({
      data: [{ port: '1' }]
    })

    render(<UsbConfigTab instanceId={mockInstanceId} onChange={jest.fn()} />)

    // Wait for the devices to be rendered
    await waitFor(() => {
      expect(screen.getByText('Device1')).toBeInTheDocument()
      expect(screen.getByText('Device2')).toBeInTheDocument()
      expect(screen.getByText('Vendor1')).toBeInTheDocument()
      expect(screen.getByText('Vendor2')).toBeInTheDocument()
    })
  })

  it('handles USB device toggle', async () => {
    // Mock API responses
    ;(api.system.systemDevicesUsbGet as jest.Mock).mockResolvedValueOnce({
      data: [
        {
          port: '1',
          name: 'Device1',
          vendor: 'Vendor1',
          device_connected: true
        }
      ]
    })
    ;(
      api.instances.instancesInstanceIdConfigDevicesUsbGet as jest.Mock
    ).mockResolvedValueOnce({
      data: []
    })
    ;(
      api.instances.instancesInstanceIdConfigDevicesUsbPortPut as jest.Mock
    ).mockResolvedValueOnce({})
    ;(
      api.instances.instancesInstanceIdConfigDevicesUsbPortDelete as jest.Mock
    ).mockResolvedValueOnce({})

    render(<UsbConfigTab instanceId={mockInstanceId} onChange={jest.fn()} />)

    // Wait for the devices to be rendered
    await waitFor(() => {
      expect(screen.getByText('Device1')).toBeInTheDocument()
    })

    // Find the toggle button and click it
    const toggleButton = screen.getByRole('button', { name: 'Enable' })
    fireEvent.click(toggleButton)

    // Wait for the API call to be made
    await waitFor(() =>
      expect(
        api.instances.instancesInstanceIdConfigDevicesUsbPortPut
      ).toHaveBeenCalledWith({
        instanceId: mockInstanceId,
        port: '1'
      })
    )
  })
})
