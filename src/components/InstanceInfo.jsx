/*
 * Copyright (c) 2022 FLECS Technologies GmbH
 *
 * Created on Wed Mar 02 2022
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
import { Box, Divider, Tab, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material'
import { TabContext, TabList, TabPanel } from '@mui/lab'
import InstanceDetails from './InstanceDetails'
import InstanceLog from './InstanceLog'

export default function InstanceInfo (props) {
  const { instance } = props
  const [tab, setTab] = React.useState('1')

  function createData (name, info) {
    return { name, info }
  }

  const infoRows = [
    createData('Instance name', instance?.instanceName),
    createData('Version', instance?.appKey.version),
    createData('Instance ID', instance?.instanceId),
    createData('Status', instance?.status),
    createData('Desired status', instance?.desired)
  ]

  const handleChange = (event, newValue) => {
    setTab(newValue)
  }

  return (
    <Box sx={{ width: '100%', typography: 'body1' }}>
      <TabContext value={tab}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <TabList onChange={handleChange} aria-label="lab API tabs example">
            <Tab label="General" value="1" />
            <Tab label="Log" value="2" />
          </TabList>
        </Box>
        <TabPanel value="1">
          <TableContainer>
            <Table sx={{ minWidth: 650 }} aria-label="general info table">
              <TableHead>
                  <TableRow>
                      <TableCell colSpan={2}>
                          <Typography variant='h6'>
                              General information
                          </Typography>
                      </TableCell>
                  </TableRow>
              </TableHead>
              <TableBody>
                {infoRows.map((row) => (
                  <TableRow
                    key={row.name}
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                  >
                    <TableCell component="th" scope="row" style={{ borderBottom: 'none' }}>
                      {row.name}
                    </TableCell>
                    <TableCell style={{ borderBottom: 'none' }}>{row.info}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <Divider></Divider>
            <InstanceDetails instance={instance}></InstanceDetails>
          </TableContainer>
        </TabPanel>
        <TabPanel value="2">
          <InstanceLog instance={instance}></InstanceLog>
        </TabPanel>
      </TabContext>
    </Box>
  )
}

InstanceInfo.propTypes = {
  instance: PropTypes.object
}
