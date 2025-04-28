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
import React, { useCallback, useEffect, useState } from 'react'
import { Box, List, CircularProgress, Stack, Typography } from '@mui/material'
import { api } from '../../../api/flecs-core/api-client'
import {
  DeploymentNetwork,
  InstanceConfigNetwork,
  Network,
  NetworkAdapter
} from 'core-client/api'
import NetworkConfigCard from './networks/NetworkConfigCard'
import HelpButton from '../../buttons/help/HelpButton'
import { instancenicconfig } from '../../../components/help/helplinks'
import ActionSnackbar from '../../../components/ActionSnackbar'

export interface NetworkState {
  id: string
  name: string
  net_type: string
  is_connected: boolean
  networks: Network[]
  deploymentNetworkName: string
  ipAddress: string
  is_activated: boolean
}

interface NetworkConfigTabProps {
  instanceId: string
  onChange: (hasChanges: boolean) => void
}

const NetworkConfigTab: React.FC<NetworkConfigTabProps> = ({
  instanceId,
  onChange
}) => {
  const executedRef = React.useRef(false)
  const [networks, setNetworks] = useState<NetworkState[]>([])
  const [loading, setLoading] = useState(true)
  const [reload, setReload] = useState(false)
  const [snackbarOpen, setSnackbarOpen] = useState(false)
  const [snackbarState, setSnackbarState] = useState({
    snackbarText: 'Info',
    alertSeverity: 'success',
    clipBoardContent: ''
  })

  const fetchNetworks = async () => {
    try {
      // Fetch network adapters
      const networkAdaptersResponse =
        await api.system.systemNetworkAdaptersGet()
      const networkAdapters = networkAdaptersResponse.data.map(
        (adapter: NetworkAdapter) => ({
          id: adapter.name,
          name: adapter.name,
          net_type: adapter.net_type,
          is_connected: adapter.is_connected,
          networks: adapter.networks || []
        })
      )

      // Fetch deployment networks
      const deploymentNetworksResponse =
        await api.deployments.deploymentsDeploymentIdNetworksGet({
          deploymentId: 'default'
        })
      const deploymentNetworks = deploymentNetworksResponse.data.map(
        (network: DeploymentNetwork) => ({
          parent: network.parent || '',
          name: network.name || '',
          type: 'deployment'
        })
      )
      // Fetch instance-specific networks
      const instanceNetworksResponse =
        await api.instances.instancesInstanceIdConfigNetworksGet({
          instanceId
        })
      const instanceNetworks = instanceNetworksResponse.data.map(
        (network: InstanceConfigNetwork) => ({
          name: network.name || '',
          ipAddress: network.ipAddress
        })
      )
      // Combine all data sources
      const filteredNetworkAdapters = networkAdapters.filter(
        (adapter) =>
          adapter.net_type === 'Wired' || adapter.net_type === 'Wireless'
      )
      const sortedNetworkAdapters = filteredNetworkAdapters.sort((a, b) =>
        a.name.localeCompare(b.name)
      )

      const combinedNetworks = sortedNetworkAdapters.map((adapter) => {
        const matchingDeploymentNetwork = deploymentNetworks.find(
          (network) => network.parent === adapter.id
        )

        const matchingInstanceNetwork = instanceNetworks.find(
          (network) => network.name === matchingDeploymentNetwork?.name
        )

        return {
          ...adapter,
          deploymentNetworkName: matchingDeploymentNetwork?.name || '',
          ipAddress: matchingInstanceNetwork?.ipAddress || '',
          is_activated: !!matchingInstanceNetwork?.ipAddress
        }
      })

      setNetworks(combinedNetworks)
    } catch (error) {
      setSnackbarState({
        alertSeverity: 'error',
        snackbarText: 'Failed to load Network config!',
        clipBoardContent: ''
      })
      setSnackbarOpen(true)
    } finally {
      setLoading(false)
      setReload(false)
    }
  }

  useEffect(() => {
    if (executedRef.current) {
      return
    }

    fetchNetworks()
    executedRef.current = true
  }, [reload])

  const handleNetworkActivationChange = useCallback(
    async (
      event: React.ChangeEvent<HTMLInputElement>,
      id: string,
      name: string
    ): Promise<void> => {
      const isActivated = event.target.checked

      const network = networks.find((network) => network.id === id)
      if (!network) {
        console.error(`Network with id ${id} not found`)
        return
      }

      let deploymentNetworkName = network.deploymentNetworkName

      try {
        if (isActivated) {
          // Step 1: Check if deploymentNetworkName is set, if not create one
          if (!deploymentNetworkName) {
            const newDeploymentNetworkName = `flecs-ipvlan_l2-${name}`
            await api.deployments.deploymentsDeploymentIdNetworksNetworkIdPut({
              deploymentId: 'default',
              networkId: newDeploymentNetworkName,
              putDeploymentNetwork: {
                network_kind: 'IpvlanL2',
                parent_adapter: name
              }
            })
            deploymentNetworkName = newDeploymentNetworkName
          }

          // Step 2: Reserve an IP address
          const ipReservationResponse =
            await api.deployments.deploymentsDeploymentIdNetworksNetworkIdDhcpIpv4Post(
              {
                deploymentId: 'default',
                networkId: deploymentNetworkName
              }
            )
          const reservedIpAddress = ipReservationResponse.data.ipv4_address

          // Step 3: Connect the instance to the network
          await api.instances.instancesInstanceIdConfigNetworksPost({
            instanceId,
            instancesInstanceIdConfigNetworksPostRequest: {
              network_id: deploymentNetworkName,
              ip_address_suggestion: reservedIpAddress
            }
          })
        } else {
          // Deactivate the network
          await api.instances.instancesInstanceIdConfigNetworksNetworkIdDelete({
            instanceId,
            networkId: network.deploymentNetworkName
          })
        }

        // Update the local state to reflect the change
        setNetworks((prevNetworks) =>
          prevNetworks.map((network) =>
            network.id === id
              ? { ...network, is_activated: isActivated }
              : network
          )
        )

        onChange(true)
        setSnackbarState({
          alertSeverity: 'success',
          snackbarText: 'Network config saved successfully!',
          clipBoardContent: ''
        })
        setReload(true)
      } catch (error) {
        setSnackbarState({
          alertSeverity: 'error',
          snackbarText: 'Failed to save Network config!',
          clipBoardContent: ''
        })
      } finally {
        setSnackbarOpen(true)
      }
    },
    [networks, instanceId]
  )

  if (loading) {
    return <CircularProgress />
  }
  return (
    <Box>
      <Stack direction='row' spacing={2} alignItems='center' sx={{ mb: 2 }}>
        <Typography variant='h6'>Connect Network Interface to App</Typography>
        <HelpButton url={instancenicconfig}></HelpButton>
      </Stack>
      <List>
        {networks.map((network) => (
          <NetworkConfigCard
            network={network}
            onActivationChange={handleNetworkActivationChange}
            key={network.id}
          />
        ))}
      </List>
      <ActionSnackbar
        text={snackbarState.snackbarText}
        open={snackbarOpen}
        setOpen={setSnackbarOpen}
        alertSeverity={snackbarState.alertSeverity}
      />
    </Box>
  )
}

export default NetworkConfigTab
