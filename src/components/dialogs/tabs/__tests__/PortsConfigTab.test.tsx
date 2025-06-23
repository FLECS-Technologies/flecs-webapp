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
import '@testing-library/jest-dom'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import PortsConfigTab from '../PortsConfigTab'
import { api } from '../../../../api/flecs-core/api-client'

// Mock the API client
jest.mock('../../../../api/flecs-core/api-client', () => ({
  api: {
    instances: {
      instancesInstanceIdConfigPortsGet: jest.fn(),
      instancesInstanceIdConfigPortsTransportProtocolPut: jest.fn()
    }
  }
}))

describe('PortsConfigTab', () => {
  const instanceId = 'test-instance-id'

  beforeEach(() => {
    api.instances.instancesInstanceIdConfigPortsGet = jest.fn()
    api.instances.instancesInstanceIdConfigPortsTransportProtocolPut = jest.fn()
  })

  afterAll(() => {
    jest.clearAllMocks()
  })

  it('renders loading spinner while fetching ports', async () => {
    ;(
      api.instances.instancesInstanceIdConfigPortsGet as jest.Mock
    ).mockResolvedValueOnce({
      data: { tcp: [], udp: [] }
    })

    render(<PortsConfigTab instanceId={instanceId} onChange={jest.fn()} />)

    expect(screen.getByRole('progressbar')).toBeInTheDocument()
    await waitFor(() =>
      expect(
        api.instances.instancesInstanceIdConfigPortsGet
      ).toHaveBeenCalledWith({
        instanceId
      })
    )
  })

  it('renders "No ports configured" when no ports are returned', async () => {
    ;(
      api.instances.instancesInstanceIdConfigPortsGet as jest.Mock
    ).mockResolvedValueOnce({
      data: { tcp: [], udp: [] }
    })

    render(<PortsConfigTab instanceId={instanceId} onChange={jest.fn()} />)

    await waitFor(() =>
      expect(screen.getByText('No ports configured.')).toBeInTheDocument()
    )
  })

  it('renders ports when data is fetched', async () => {
    ;(
      api.instances.instancesInstanceIdConfigPortsGet as jest.Mock
    ).mockResolvedValueOnce({
      data: {
        tcp: [{ host_port: 8080, container_port: 80 }],
        udp: []
      }
    })

    render(<PortsConfigTab instanceId={instanceId} onChange={jest.fn()} />)

    await waitFor(() => {
      expect(screen.getByLabelText('Host Port')).toHaveValue('8080')
      expect(screen.getByLabelText('Container Port')).toHaveValue('80')
    })
  })

  it('handles adding a single port mapping', async () => {
    ;(
      api.instances.instancesInstanceIdConfigPortsGet as jest.Mock
    ).mockResolvedValueOnce({
      data: { tcp: [], udp: [] }
    })

    render(<PortsConfigTab instanceId={instanceId} onChange={jest.fn()} />)

    await waitFor(() =>
      expect(screen.getByText('No ports configured.')).toBeInTheDocument()
    )

    const addSinglePortButton = screen.getByText('Add Port Mapping')
    fireEvent.click(addSinglePortButton)

    expect(screen.getAllByLabelText('Host Port')).toHaveLength(1)
    expect(screen.getAllByLabelText('Container Port')).toHaveLength(1)
  })

  it('handles saving ports', async () => {
    // Mock API responses
    ;(
      api.instances.instancesInstanceIdConfigPortsGet as jest.Mock
    ).mockResolvedValueOnce({
      data: {
        tcp: [{ host_port: 8080, container_port: 80 }],
        udp: []
      }
    })
    ;(
      api.instances
        .instancesInstanceIdConfigPortsTransportProtocolPut as jest.Mock
    ).mockResolvedValueOnce()

    render(<PortsConfigTab instanceId={instanceId} onChange={jest.fn()} />)

    await waitFor(() => {
      expect(screen.getByLabelText('Host Port')).toHaveValue('8080')
      expect(screen.getByLabelText('Container Port')).toHaveValue('80')
    })

    const hostPortInput = screen.getByLabelText('Host Port')
    fireEvent.change(hostPortInput, { target: { value: '9090' } })
    expect(hostPortInput).toHaveValue('9090')

    const saveButton = screen
      .getAllByLabelText('Save Port Mapping')
      .find(
        (button) => button.tagName.toLowerCase() === 'button'
      ) as HTMLElement
    fireEvent.click(saveButton)

    await waitFor(() =>
      expect(
        api.instances.instancesInstanceIdConfigPortsTransportProtocolPut
      ).toHaveBeenCalled()
    )
  })

  it('handles deleting a port', async () => {
    ;(
      api.instances.instancesInstanceIdConfigPortsGet as jest.Mock
    ).mockResolvedValueOnce({
      data: {
        tcp: [{ host_port: 8080, container_port: 80 }],
        udp: []
      }
    })

    render(<PortsConfigTab instanceId={instanceId} onChange={jest.fn()} />)

    await waitFor(() => {
      expect(screen.getByLabelText('Host Port')).toHaveValue('8080')
      expect(screen.getByLabelText('Container Port')).toHaveValue('80')
    })

    const deleteButton = screen.getByLabelText('Delete Port Mapping')
    fireEvent.click(deleteButton)

    await waitFor(() =>
      expect(screen.queryByLabelText('Host Port')).not.toBeInTheDocument()
    )
  })

  it('handles adding a port range mapping', async () => {
    ;(
      api.instances.instancesInstanceIdConfigPortsGet as jest.Mock
    ).mockResolvedValueOnce({
      data: { tcp: [], udp: [] }
    })

    render(<PortsConfigTab instanceId={instanceId} onChange={jest.fn()} />)

    await waitFor(() =>
      expect(screen.getByText('No ports configured.')).toBeInTheDocument()
    )

    const addPortRangeButton = screen.getByText('Add Port Range Mapping')
    fireEvent.click(addPortRangeButton)

    expect(screen.getAllByLabelText('Host Port Start')).toHaveLength(1)
    expect(screen.getAllByLabelText('Host Port End')).toHaveLength(1)
    expect(screen.getAllByLabelText('Container Port Start')).toHaveLength(1)
    expect(screen.getAllByLabelText('Container Port End')).toHaveLength(1)

    fireEvent.change(screen.getByLabelText('Host Port Start'), {
      target: { value: '3000' }
    })
    fireEvent.change(screen.getByLabelText('Host Port End'), {
      target: { value: '3005' }
    })
    fireEvent.change(screen.getByLabelText('Container Port Start'), {
      target: { value: '4000' }
    })
    fireEvent.change(screen.getByLabelText('Container Port End'), {
      target: { value: '4005' }
    })

    const saveButton = screen
      .getAllByLabelText('Save Port Mapping')
      .find(
        (button) => button.tagName.toLowerCase() === 'button'
      ) as HTMLElement
    fireEvent.click(saveButton)

    await waitFor(() =>
      expect(
        api.instances.instancesInstanceIdConfigPortsTransportProtocolPut
      ).toHaveBeenCalled()
    )
  })
})
