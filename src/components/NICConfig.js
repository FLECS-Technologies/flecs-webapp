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
import { Box } from '@mui/system'
import { Alert, AlertTitle, Switch, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material'

export default function NICConfig (props) {
  const { nicConfig, setNicConfig, setConfigChanged } = props

  const handleChange = (event) => {
    setNicConfig(prevState => ({
      ...prevState,
      nics: prevState.nics.map(
        nic => nic.nic === event.target.name ? { ...nic, enabled: event.target.checked } : nic
      )
    }))
    setConfigChanged(true)
  }

  return (
      <Box>
          <Table>
              <TableHead>
                <TableRow>
                    <TableCell colSpan={2}>
                        <Typography variant='h6'>
                            Network interfaces
                        </Typography>
                    </TableCell>
                </TableRow>
                <TableRow>
                    <TableCell colSpan={2}>
                        <Alert sx={{ mb: 2 }} severity='info'>
                            <AlertTitle>Info</AlertTitle>
                            <Typography variant='body2'>Here you can enable the access to the network interfaces of your controller for the app.</Typography>
                            <Typography variant='body2'>This means that the app can then access layer 2 (Ethernet) of this interface.</Typography>
                            <Typography variant='body2'>You need this if the app is used for fieldbus protocols like EtherCAT, or PROFINET.</Typography>
                        </Alert>
                    </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                  {nicConfig?.nics?.map((row) => (
                      <TableRow key={row?.nic}>
                          <TableCell>
                              {row?.nic}
                          </TableCell>
                          <TableCell>
                              <Switch aria-label={row?.nic} checked={row?.enabled} onChange={handleChange} name={row?.nic}>
                              </Switch>
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
  setConfigChanged: PropTypes.func
}
