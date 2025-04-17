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
import { Box, List, CircularProgress, Typography, Stack } from '@mui/material'
import { api } from '../../../api/flecs-core/api-client'
import HelpButton from '../../../components/help/HelpButton'
import { instancedeviceconfig } from '../../../components/help/helplinks'
import UsbConfigCard from './usb-devices/UsbConfigCard'
import ActionSnackbar from '../../../components/ActionSnackbar'

export interface UsbDevice {
  port: string
  name: string
  vendor: string
  device_connected: boolean
  enabled: boolean
}

interface UsbConfigTabProps {
  instanceId: string
  onChange: (hasChanges: boolean) => void
}

const UsbConfigTab: React.FC<UsbConfigTabProps> = ({
  instanceId,
  onChange
}) => {
  const executedRef = React.useRef(false)
  const [usbDevices, setUsbDevices] = useState<UsbDevice[]>([])
  const [loading, setLoading] = useState(true)
  const [snackbarOpen, setSnackbarOpen] = useState(false)
  const [snackbarState, setSnackbarState] = useState({
    snackbarText: 'Info',
    alertSeverity: 'success',
    clipBoardContent: ''
  })
  const fetchUsbDevices = async () => {
    try {
      const systemDevices = await api.system.systemDevicesUsbGet()
      const instanceDevices =
        await api.instances.instancesInstanceIdConfigDevicesUsbGet({
          instanceId
        })

      const devices = systemDevices.data.map((device: any) => ({
        port: device.port,
        name: device.name ?? 'Unknown',
        vendor: device.vendor ?? 'Unknown',
        device_connected: device.device_connected ?? false,
        enabled: instanceDevices.data.some(
          (instanceDevice: any) => instanceDevice.port === device.port
        )
      }))
      devices.sort((a, b) => a.port.localeCompare(b.port))
      setUsbDevices(devices)
    } catch (error) {
      setSnackbarState({
        alertSeverity: 'error',
        snackbarText: 'Failed to load USB config!',
        clipBoardContent: ''
      })
      setSnackbarOpen(true)
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => {
    if (executedRef.current) {
      return
    }

    fetchUsbDevices()
    executedRef.current = true
  }, [])

  const handleToggle = async (port: string, enabled: boolean) => {
    try {
      if (!enabled) {
        await api.instances.instancesInstanceIdConfigDevicesUsbPortPut({
          instanceId,
          port
        })
      } else {
        await api.instances.instancesInstanceIdConfigDevicesUsbPortDelete({
          instanceId,
          port
        })
      }
      setUsbDevices((prev) =>
        prev.map((device) =>
          device.port === port
            ? { ...device, enabled: !device.enabled }
            : device
        )
      )
      onChange(true)
      setSnackbarState({
        alertSeverity: 'success',
        snackbarText: 'USB config saved successfully!',
        clipBoardContent: ''
      })
    } catch (error) {
      setSnackbarState({
        alertSeverity: 'error',
        snackbarText: 'Failed to save USB config!',
        clipBoardContent: ''
      })
    } finally {
      setSnackbarOpen(true)
    }
  }

  if (loading) {
    return <CircularProgress />
  }

  return (
    <Box>
      <Stack direction='row' spacing={2} alignItems='center' sx={{ mb: 2 }}>
        <Typography variant='h6'>USB Devices</Typography>
        <HelpButton url={instancedeviceconfig}></HelpButton>
      </Stack>
      <List>
        {usbDevices.map((device) => (
          <UsbConfigCard
            key={device.port}
            device={device}
            onEnable={handleToggle}
          ></UsbConfigCard>
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

export default UsbConfigTab
