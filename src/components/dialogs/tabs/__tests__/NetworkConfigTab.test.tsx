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
import NetworkConfigTab from '../NetworkConfigTab';
import { createMockApi } from '../../../../__mocks__/core-client-ts';
import { NetworkKind, NetworkType } from '@flecs/core-client-ts';
import { vi } from 'vitest';

// Mock the API provider
const mockUseProtectedApi = vi.fn();

vi.mock('@contexts/api/ApiProvider', () => ({
  useProtectedApi: () => mockUseProtectedApi(),
}));

describe('NetworkConfigTab', () => {
  const mockInstanceId = 'test-instance-id';
  let mockApi: ReturnType<typeof createMockApi>;

  beforeEach(() => {
    mockApi = createMockApi();
    mockUseProtectedApi.mockReturnValue(mockApi);
  });

  it('renders loading spinner while fetching data', async () => {
    // Mock API responses
    mockApi.system.systemNetworkAdaptersGet.mockResolvedValueOnce({
      data: [],
    });
    mockApi.deployments.deploymentsDeploymentIdNetworksGet.mockResolvedValueOnce({
      data: [],
    });
    mockApi.instances.instancesInstanceIdConfigNetworksGet.mockResolvedValueOnce({
      data: [],
    });

    render(<NetworkConfigTab instanceId={mockInstanceId} onChange={vi.fn()} />);

    // Check for loading spinner
    expect(screen.getByRole('progressbar')).toBeInTheDocument();

    // Wait for the spinner to disappear
    await waitFor(() => expect(screen.queryByRole('progressbar')).not.toBeInTheDocument());
  });

  it('renders the list of networks after fetching data', async () => {
    // Mock API responses
    mockApi.system.systemNetworkAdaptersGet.mockResolvedValueOnce({
      data: [
        {
          name: 'Adapter1',
          is_connected: true,
          networks: [],
          net_type: NetworkType.Wired,
        },
        {
          name: 'Adapter2',
          is_connected: false,
          networks: [],
          net_type: NetworkType.Wireless,
        },
      ],
    });
    mockApi.deployments.deploymentsDeploymentIdNetworksGet.mockResolvedValueOnce({
      data: [{ parent: 'Adapter1', name: 'DeploymentNetwork1' }],
    });
    mockApi.instances.instancesInstanceIdConfigNetworksGet.mockResolvedValueOnce({
      data: [{ name: 'DeploymentNetwork1', ipAddress: '192.168.1.1' }],
    });

    render(<NetworkConfigTab instanceId={mockInstanceId} onChange={vi.fn()} />);

    // Wait for the networks to be rendered
    await waitFor(() => {
      expect(screen.getByText((content) => content.includes('Adapter1'))).toBeInTheDocument();
      expect(screen.getByText((content) => content.includes('Adapter2'))).toBeInTheDocument();
      expect(screen.getByText((content) => content.includes('192.168.1.1'))).toBeInTheDocument();
    });
  });

  it('handles network activation change', async () => {
    // Mock API responses
    mockApi.system.systemNetworkAdaptersGet.mockResolvedValueOnce({
      data: [
        {
          name: 'Adapter1',
          is_connected: true,
          networks: [],
          net_type: NetworkType.Wired,
        },
      ],
    });
    mockApi.deployments.deploymentsDeploymentIdNetworksGet.mockResolvedValueOnce({
      data: [],
    });
    mockApi.instances.instancesInstanceIdConfigNetworksGet.mockResolvedValueOnce({
      data: [],
    });
    mockApi.deployments.deploymentsDeploymentIdNetworksPost.mockResolvedValueOnce({});
    mockApi.deployments.deploymentsDeploymentIdNetworksNetworkIdDhcpIpv4Post.mockResolvedValueOnce({
      data: { ipv4_address: '192.168.1.2' },
    });
    mockApi.instances.instancesInstanceIdConfigNetworksPost.mockResolvedValueOnce({});

    render(<NetworkConfigTab instanceId={mockInstanceId} onChange={vi.fn()} />);

    // Wait for the networks to be rendered
    await waitFor(() => {
      expect(screen.getByText('Adapter1')).toBeInTheDocument();
    });

    // Find the switch and toggle it
    const switchElement = screen.getByRole('button', { name: 'Connect' });
    fireEvent.click(switchElement);

    // Wait for the API call to be made
    await waitFor(() =>
      expect(mockApi.deployments.deploymentsDeploymentIdNetworksPost).toHaveBeenCalledWith(
        'default',
        {
          network_id: 'flecs-ipvlan_l2-Adapter1',
          network_kind: NetworkKind.Ipvlanl2,
          parent_adapter: 'Adapter1',
        },
      ),
    );
    expect(mockApi.instances.instancesInstanceIdConfigNetworksPost).toHaveBeenCalledWith(
      mockInstanceId,
      {
        network_id: 'flecs-ipvlan_l2-Adapter1',
        ipAddress: '192.168.1.2',
      },
    );
  });
});
