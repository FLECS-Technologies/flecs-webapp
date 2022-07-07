/*
 * Copyright (c) 2022 FLECS Technologies GmbH
 *
 * Created on Mon May 30 2022
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
import PropTypes from 'prop-types'
import { Alert, AlertTitle, Box, Switch, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material'

export default function InstanceDevicesConfig (props) {
  const { instanceConfig, setDevicesConfig, setConfigChanged } = props

  const handleUSBChange = (event) => {
    const newUSBConfig = instanceConfig.devices.usb.map(
      device => device.port === event.target.port ? { ...device, active: event.target.checked } : device
    )
    setDevicesConfig(prevState => ({
      ...prevState,
      devices: {
        ...prevState.devices,
        usb: newUSBConfig
      }
    }))
    setConfigChanged(true)
  }

  return (
      <Box>
          <Table>
              <TableHead>
                <TableRow>
                    <TableCell colSpan={5}>
                        <Typography variant='h6'>
                            Devices
                        </Typography>
                    </TableCell>
                </TableRow>
                <TableRow>
                    <TableCell colSpan={5}>
                        <Alert sx={{ mb: 2 }} severity='info'>
                            <AlertTitle>Info</AlertTitle>
                            <Typography variant='body2'>Here you can activate the access to devices of your controller for the app.</Typography>
                            <Typography variant='body2'>This means that the app can then access USB devices, CAN interfaces, or other hardware devices.</Typography>
                            <Typography variant='body2'>A common use case is giving an app access to a license dongle.</Typography>
                        </Alert>
                    </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>USB Device</TableCell>
                  <TableCell>Activate in app</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                  {instanceConfig?.devices?.usb?.map((row) => (
                      <TableRow key={row?.port}>
                          <TableCell>
                            {row?.device} ({row?.vendor})
                          </TableCell>
                          <TableCell>
                              <Switch aria-label={row?.port + '-switch'} checked={row?.active} onChange={handleUSBChange} name={row?.port}>
                              </Switch>
                          </TableCell>
                      </TableRow>
                  ))}
              </TableBody>
          </Table>
      </Box>
  )
}

InstanceDevicesConfig.propTypes = {
  instanceConfig: PropTypes.object,
  setDevicesConfig: PropTypes.func,
  setConfigChanged: PropTypes.func,
  saveConfig: PropTypes.func
}
