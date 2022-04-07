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
import { Divider, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material'
import InstanceDetails from './InstanceDetails'

export default function InstanceInfo (props) {
  const { instance } = props

  function createData (name, info) {
    return { name, info }
  }

  const infoRows = [
    createData('Instance name', instance?.instanceName),
    createData('Version', instance?.version),
    createData('Instance ID', instance?.instanceId),
    createData('Status', instance?.status),
    createData('Desired status', instance?.desired)
  ]

  return (
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
  )
}

InstanceInfo.propTypes = {
  instance: PropTypes.object
}
