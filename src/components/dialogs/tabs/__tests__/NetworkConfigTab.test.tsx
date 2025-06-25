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
import NetworkConfigTab from '../NetworkConfigTab'
import { api } from '../../../../api/flecs-core/api-client'
import { NetworkKind, NetworkType } from '@flecs/core-client-ts'

// Mock the API client
jest.mock('../../../../api/flecs-core/api-client', () => ({
  api: {
    system: {
      systemNetworkAdaptersGet: jest.fn()
    },
    deployments: {
      deploymentsDeploymentIdNetworksGet: jest.fn(),
      deploymentsDeploymentIdNetworksPost: jest.fn(),
      deploymentsDeploymentIdNetworksNetworkIdDhcpIpv4Post: jest.fn()
    },
    instances: {
      instancesInstanceIdConfigNetworksGet: jest.fn(),
      instancesInstanceIdConfigNetworksPost: jest.fn(),
      instancesInstanceIdConfigNetworksNetworkIdDelete: jest.fn()
    }
  }
}))

describe('NetworkConfigTab', () => {
  const mockInstanceId = 'test-instance-id'

  beforeEach(() => {
    api.system.systemNetworkAdaptersGet = jest.fn()
    api.deployments.deploymentsDeploymentIdNetworksGet = jest.fn()
    api.instances.instancesInstanceIdConfigNetworksGet = jest.fn()
    api.deployments.deploymentsDeploymentIdNetworksPost = jest.fn()
    api.deployments.deploymentsDeploymentIdNetworksNetworkIdDhcpIpv4Post =
      jest.fn()
    api.instances.instancesInstanceIdConfigNetworksPost = jest.fn()
    api.instances.instancesInstanceIdConfigNetworksNetworkIdDelete = jest.fn()
  })

  afterAll(() => {
    jest.clearAllMocks()
  })

  it('renders loading spinner while fetching data', async () => {
    // Mock API responses
    ;(api.system.systemNetworkAdaptersGet as jest.Mock).mockResolvedValueOnce({
      data: []
    })
    ;(
      api.deployments.deploymentsDeploymentIdNetworksGet as jest.Mock
    ).mockResolvedValueOnce({
      data: []
    })
    ;(
      api.instances.instancesInstanceIdConfigNetworksGet as jest.Mock
    ).mockResolvedValueOnce({
      data: []
    })

    render(
      <NetworkConfigTab instanceId={mockInstanceId} onChange={jest.fn()} />
    )

    // Check for loading spinner
    expect(screen.getByRole('progressbar')).toBeInTheDocument()

    // Wait for the spinner to disappear
    await waitFor(() =>
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
    )
  })

  it('renders the list of networks after fetching data', async () => {
    // Mock API responses
    ;(api.system.systemNetworkAdaptersGet as jest.Mock).mockResolvedValueOnce({
      data: [
        {
          name: 'Adapter1',
          is_connected: true,
          networks: [],
          net_type: NetworkType.Wired
        },
        {
          name: 'Adapter2',
          is_connected: false,
          networks: [],
          net_type: NetworkType.Wireless
        }
      ]
    })
    ;(
      api.deployments.deploymentsDeploymentIdNetworksGet as jest.Mock
    ).mockResolvedValueOnce({
      data: [{ parent: 'Adapter1', name: 'DeploymentNetwork1' }]
    })
    ;(
      api.instances.instancesInstanceIdConfigNetworksGet as jest.Mock
    ).mockResolvedValueOnce({
      data: [{ name: 'DeploymentNetwork1', ipAddress: '192.168.1.1' }]
    })

    render(
      <NetworkConfigTab instanceId={mockInstanceId} onChange={jest.fn()} />
    )

    // Wait for the networks to be rendered
    await waitFor(() => {
      expect(
        screen.getByText((content) => content.includes('Adapter1'))
      ).toBeInTheDocument()
      expect(
        screen.getByText((content) => content.includes('Adapter2'))
      ).toBeInTheDocument()
      expect(
        screen.getByText((content) => content.includes('192.168.1.1'))
      ).toBeInTheDocument()
    })
  })

  it('handles network activation change', async () => {
    // Mock API responses
    ;(api.system.systemNetworkAdaptersGet as jest.Mock).mockResolvedValueOnce({
      data: [
        {
          name: 'Adapter1',
          is_connected: true,
          networks: [],
          net_type: NetworkType.Wired
        }
      ]
    })
    ;(
      api.deployments.deploymentsDeploymentIdNetworksGet as jest.Mock
    ).mockResolvedValueOnce({
      data: []
    })
    ;(
      api.instances.instancesInstanceIdConfigNetworksGet as jest.Mock
    ).mockResolvedValueOnce({
      data: []
    })
    ;(
      api.deployments.deploymentsDeploymentIdNetworksPost as jest.Mock
    ).mockResolvedValueOnce({})
    ;(
      api.deployments
        .deploymentsDeploymentIdNetworksNetworkIdDhcpIpv4Post as jest.Mock
    ).mockResolvedValueOnce({
      data: { ipv4_address: '192.168.1.2' }
    })
    ;(
      api.instances.instancesInstanceIdConfigNetworksPost as jest.Mock
    ).mockResolvedValueOnce({})

    render(
      <NetworkConfigTab instanceId={mockInstanceId} onChange={jest.fn()} />
    )

    // Wait for the networks to be rendered
    await waitFor(() => {
      expect(screen.getByText('Adapter1')).toBeInTheDocument()
    })

    // Find the switch and toggle it
    const switchElement = screen.getByRole('button', { name: 'Connect' })
    fireEvent.click(switchElement)

    // Wait for the API call to be made
    await waitFor(() =>
      expect(
        api.deployments.deploymentsDeploymentIdNetworksPost
      ).toHaveBeenCalledWith({
        deploymentId: 'default',
        postDeploymentNetwork: {
          network_id: 'flecs-ipvlan_l2-Adapter1',
          network_kind: NetworkKind.Ipvlanl2,
          parent_adapter: 'Adapter1'
        }
      })
    )
    expect(
      api.instances.instancesInstanceIdConfigNetworksPost
    ).toHaveBeenCalledWith({
      instanceId: mockInstanceId,
      instancesInstanceIdConfigNetworksPostRequest: {
        network_id: 'flecs-ipvlan_l2-Adapter1',
        ipAddress: '192.168.1.2'
      }
    })
  })
})
