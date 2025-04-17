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
import React, { useEffect, useState } from 'react'
import { Box, Typography, List, CircularProgress, Stack } from '@mui/material'
import SinglePortMapping from './port-mappings/SinglePortMapping'
import PortRangeMapping from './port-mappings/PortRangeMapping'
import AddSinglePortMappingButton from './port-mappings/AddSinglePortMappingButton'
import AddPortRangeMappingButton from './port-mappings/AddPortRangeMappingButton'
import ActionSnackbar from '../../ActionSnackbar'
import {
  InstancePortMappingRange,
  InstancePortMappingSingle,
  TransportProtocol
} from 'core-client/api'
import { api } from '../../../api/flecs-core/api-client'
import HelpButton from '../../../components/help/HelpButton'
import { instancedeviceconfig } from '../../../components/help/helplinks'

interface PortsConfigTabProps {
  instanceId: string
  onChange: (hasChanges: boolean) => void
}

interface PortWithProtocol {
  protocol: TransportProtocol
  port: InstancePortMappingSingle | InstancePortMappingRange
}

const PortsConfigTab: React.FC<PortsConfigTabProps> = ({
  instanceId,
  onChange
}) => {
  const executedRef = React.useRef(false)
  const [ports, setPorts] = useState<PortWithProtocol[]>([])
  const [loading, setLoading] = useState(true)
  const [snackbarOpen, setSnackbarOpen] = useState(false)
  const [snackbarState, setSnackbarState] = useState({
    snackbarText: 'Info',
    alertSeverity: 'success',
    clipBoardContent: ''
  })

  const fetchPorts = async () => {
    try {
      const portData = await api.instances.instancesInstanceIdConfigPortsGet({
        instanceId
      })
      if (portData) {
        const combinedPorts: PortWithProtocol[] = [
          ...portData.data.tcp.map(
            (
              port: InstancePortMappingSingle | InstancePortMappingRange
            ): PortWithProtocol => ({
              protocol: TransportProtocol.Tcp,
              port
            })
          ),
          ...portData.data.udp.map(
            (
              port: InstancePortMappingSingle | InstancePortMappingRange
            ): PortWithProtocol => ({
              protocol: TransportProtocol.Udp,
              port
            })
          )
        ]
        setPorts(combinedPorts)
      }
    } catch (error) {
      console.error('Failed to fetch ports:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (executedRef.current) {
      return
    }

    fetchPorts()
    executedRef.current = true
  }, [])

  const handlePortChange = (
    index: number,
    field: keyof InstancePortMappingSingle | keyof InstancePortMappingRange,
    value: number | { start?: number; end?: number }
  ) => {
    setPorts((prev) => {
      const updatedPorts = [...prev]
      const portWithProtocol = updatedPorts[index]

      if ('host_port' in portWithProtocol.port) {
        portWithProtocol.port = {
          ...portWithProtocol.port,
          [field]: value as number
        } as InstancePortMappingSingle
      } else if ('host_ports' in portWithProtocol.port) {
        portWithProtocol.port = {
          ...portWithProtocol.port,
          [field]: {
            ...(field in portWithProtocol.port
              ? (portWithProtocol.port[
                  field as keyof InstancePortMappingRange
                ] as object)
              : {}),
            ...(value as object)
          }
        } as InstancePortMappingRange
      }

      return updatedPorts
    })
  }

  const handleProtocolChange = (index: number, protocol: TransportProtocol) => {
    setPorts((prev) => {
      const updatedPorts = [...prev]
      updatedPorts[index].protocol = protocol
      return updatedPorts
    })
  }

  const handleSave = async () => {
    try {
      const tcpPorts = ports
        .filter(
          (portWithProtocol) =>
            portWithProtocol.protocol === TransportProtocol.Tcp
        )
        .map((portWithProtocol) => portWithProtocol.port)

      const udpPorts = ports
        .filter(
          (portWithProtocol) =>
            portWithProtocol.protocol === TransportProtocol.Udp
        )
        .map((portWithProtocol) => portWithProtocol.port)

      if (tcpPorts.length > 0) {
        await api.instances.instancesInstanceIdConfigPortsTransportProtocolPut({
          instanceId,
          transportProtocol: TransportProtocol.Tcp,
          instancePortMapping: tcpPorts
        })
      }

      if (udpPorts.length > 0) {
        await api.instances.instancesInstanceIdConfigPortsTransportProtocolPut({
          instanceId,
          transportProtocol: TransportProtocol.Udp,
          instancePortMapping: udpPorts
        })
      }

      onChange(true)
      setSnackbarState({
        alertSeverity: 'success',
        snackbarText: 'Port mappings saved successfully!',
        clipBoardContent: ''
      })
    } catch (error) {
      console.error('Failed to save ports:', error)
      setSnackbarState({
        alertSeverity: 'error',
        snackbarText: (error as Error).message || 'An unknown error occurred',
        clipBoardContent: ''
      })
    } finally {
      setSnackbarOpen(true)
    }
  }

  const handleDeletePort = (index: number): void => {
    setPorts((prev) => {
      const updatedPorts = [...prev]
      updatedPorts.splice(index, 1)
      return updatedPorts
    })
  }

  const handleAddSinglePortMapping = (): void => {
    setPorts((prev) => [
      ...prev,
      {
        protocol: TransportProtocol.Tcp,
        port: {
          host_port: 0,
          container_port: 0
        } as InstancePortMappingSingle
      }
    ])
  }

  const handleAddPortRangeMapping = (): void => {
    setPorts((prev) => [
      ...prev,
      {
        protocol: TransportProtocol.Tcp,
        port: {
          host_ports: { start: 0, end: 0 },
          container_ports: { start: 0, end: 0 }
        } as InstancePortMappingRange
      }
    ])
  }

  if (loading) {
    return <CircularProgress />
  }

  return (
    <Box>
      <Stack direction='row' spacing={2} alignItems='center' sx={{ mb: 2 }}>
        <Typography variant='h6'>Port Mappings</Typography>
        <HelpButton url={instancedeviceconfig}></HelpButton>
      </Stack>
      <Stack spacing={2} direction='row' sx={{ mb: 2 }}>
        <AddSinglePortMappingButton
          onAdd={handleAddSinglePortMapping}
          defaultProtocol={TransportProtocol.Tcp}
        />
        <AddPortRangeMappingButton
          onAdd={handleAddPortRangeMapping}
          defaultProtocol={TransportProtocol.Tcp}
        />
      </Stack>
      <List>
        {ports.length === 0 && (
          <Typography variant='body2' color='text.secondary'>
            No ports configured.
          </Typography>
        )}
        {ports.map((portWithProtocol, index) =>
          'host_port' in portWithProtocol.port ? (
            <SinglePortMapping
              key={index}
              port={portWithProtocol.port as InstancePortMappingSingle}
              protocol={portWithProtocol.protocol}
              index={index}
              onChange={handlePortChange}
              handleDeletePort={handleDeletePort}
              handleSavePort={handleSave}
              handleProtocolChange={handleProtocolChange}
            />
          ) : (
            <PortRangeMapping
              key={index}
              port={portWithProtocol.port as InstancePortMappingRange}
              protocol={portWithProtocol.protocol}
              index={index}
              onChange={handlePortChange}
              handleDeletePort={handleDeletePort}
              handleSavePort={handleSave}
              handleProtocolChange={handleProtocolChange}
            />
          )
        )}
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

export default PortsConfigTab
