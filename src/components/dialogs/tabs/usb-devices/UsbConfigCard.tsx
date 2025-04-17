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
import {
  Card,
  CardContent,
  Typography,
  Button,
  Tooltip,
  ListItemText
} from '@mui/material'
import { Cancel, CheckCircle, Usb, UsbOff } from '@mui/icons-material'
import { UsbDevice } from '../UsbConfigTab'

interface UsbConfigCardProps {
  device: UsbDevice
  onEnable: (port: string, enabled: boolean) => void
}

const UsbConfigCard: React.FC<UsbConfigCardProps> = ({ device, onEnable }) => {
  return (
    <Card
      key={device.port}
      sx={{ display: 'flex', width: '100%', p: 2, mb: 2 }}
    >
      <Tooltip
        title={`USB device ${device.name} ${
          device.device_connected ? 'connected' : 'not connected'
        }`}
      >
        {device.device_connected ? (
          <Usb
            sx={{ mr: 2, alignSelf: 'center' }}
            color={device.enabled ? 'success' : 'error'}
          />
        ) : (
          <UsbOff
            sx={{ mr: 2, alignSelf: 'center' }}
            color={device.enabled ? 'success' : 'error'}
          />
        )}
      </Tooltip>
      <ListItemText
        primary={device.port}
        secondary='Port'
        sx={{ flex: 1, mr: 2 }}
      />
      <ListItemText
        primary={device.name}
        secondary='Name'
        sx={{ flex: 1, mr: 2 }}
      />
      <ListItemText
        primary={device.vendor}
        secondary='Vendor'
        sx={{ flex: 1, mr: 2 }}
      />
      <Button
        sx={{ flexShrink: 0 }}
        color={device.enabled ? 'error' : 'success'}
        startIcon={device.enabled ? <Cancel /> : <CheckCircle />}
        onClick={() => onEnable(device.port, device.enabled)}
      >
        {device.enabled ? 'Disable' : 'Enable'}
      </Button>
    </Card>
  )
}

export default UsbConfigCard
