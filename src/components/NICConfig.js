/*
 * Copyright (c) 2022 FLECS Technologies GmbH
 *
 * Created on Tue May 03 2022
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
import {
  Alert,
  AlertTitle,
  Box,
  FormControl,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography
} from '@mui/material'
import IpMaskInput from './IpMaskInput'
import Tooltip from '@mui/material/Tooltip'
import WifiIcon from '@mui/icons-material/Wifi'
import WifiOffIcon from '@mui/icons-material/WifiOff'
import HelpButton from './help/HelpButton'
import { instancenicconfig } from './help/helplinks'

export default function NICConfig(props) {
  const { nicConfig, setNicConfig, setConfigChanged, saveConfig } = props

  const handleChange = (event) => {
    setNicConfig((prevState) => ({
      ...prevState,
      networkAdapters: prevState.networkAdapters.map((nic) =>
        nic.name === event.target.name
          ? { ...nic, active: event.target.checked }
          : nic
      )
    }))
    // save config to activate the network adapter and receive recommendations for ip and subnetmask
    if (event.target.checked) {
      saveConfig(true)
    }
    setConfigChanged(true)
  }

  function handleIPChange(name, ip) {
    setNicConfig((prevState) => ({
      ...prevState,
      networkAdapters: prevState.networkAdapters.map((nic) =>
        nic.name === name ? { ...nic, ipAddress: ip } : nic
      )
    }))
    setConfigChanged(true)
  }

  return (
    <Box>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell colSpan={6}>
              <Typography variant='h6'>
                Network interfaces
                <HelpButton
                  url={instancenicconfig}
                  label='Help for settings of network access'
                ></HelpButton>
              </Typography>
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell colSpan={6}>
              <Alert sx={{ mb: 2 }} severity='info'>
                <AlertTitle>Info</AlertTitle>
                <Typography variant='body2'>
                  Here you can activate the access to the network interfaces of
                  your controller for the app.
                </Typography>
                <Typography variant='body2'>
                  This means that the app can then access layer 2 (Ethernet) of
                  this interface.
                </Typography>
                <Typography variant='body2'>
                  You need this if the app is used for fieldbus protocols like
                  EtherCAT, or PROFINET.
                </Typography>
              </Alert>
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Network status</TableCell>
            <TableCell>Name</TableCell>
            <TableCell>IP Address</TableCell>
            <TableCell>Subnet Mask</TableCell>
            <TableCell>Gateway</TableCell>
            <TableCell>Activate in app</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {nicConfig?.networkAdapters?.map((row) => (
            <TableRow key={row?.name}>
              <TableCell>
                {row?.connected ? (
                  <Tooltip title={'Adapter ' + row?.name + ' connected'}>
                    <WifiIcon />
                  </Tooltip>
                ) : (
                  <Tooltip title={'Adapter ' + row?.name + ' not connected'}>
                    <WifiOffIcon />
                  </Tooltip>
                )}
              </TableCell>
              <TableCell>{row?.name}</TableCell>
              <TableCell>
                <FormControl>
                  <IpMaskInput
                    ip={row?.ipAddress}
                    changeIP={handleIPChange}
                    name={row?.name}
                    id='ip-textmask'
                    readOnly={!row?.active || !row?.connected}
                  />
                </FormControl>
              </TableCell>
              <TableCell>
                <FormControl>
                  <IpMaskInput
                    ip={row?.subnetMask}
                    name={row?.name}
                    id='sub-textmask'
                    readOnly={true}
                  />
                </FormControl>
              </TableCell>
              <TableCell>
                <FormControl>
                  <IpMaskInput
                    ip={row?.gateway}
                    name={row?.name}
                    id='gateway-textmask'
                    readOnly={true}
                  />
                </FormControl>
              </TableCell>
              <TableCell>
                <Switch
                  aria-label={row?.name + '-switch'}
                  disabled={!row?.active && !row?.connected}
                  checked={row?.active}
                  onChange={handleChange}
                  name={row?.name}
                ></Switch>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  )
}

NICConfig.propTypes = {
  nicConfig: PropTypes.object,
  setNicConfig: PropTypes.func,
  setConfigChanged: PropTypes.func,
  saveConfig: PropTypes.func
}
