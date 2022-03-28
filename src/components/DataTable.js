/*
 * Copyright (c) 2022 FLECS Technologies GmbH
 *
 * Created on Mon Mar 14 2022
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
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material'

export default function DataTable (props) {
  const dataRows = []
  const headCells = [
    {
      id: 'key',
      numeric: false,
      disablePadding: false,
      label: 'Path'
    },
    {
      id: 'value',
      numeric: false,
      disablePadding: false,
      label: 'Value'
    },
    {
      id: 'encoding',
      numeric: false,
      disablePadding: false,
      label: 'Encoding'
    },
    {
      id: 'timestamp',
      numeric: false,
      disablePadding: false,
      label: 'Timestamp'
    }
  ]

  function createData (key, value, encoding, timestamp) {
    let dataValue = value
    if (encoding === 'application/octet') {
      dataValue = Buffer
        .from(value, 'base64')
        .toString('ascii')
    }
    return { key, dataValue, encoding, timestamp }
  }

  if (props.data && props.data.length > 0) {
    const tmpData = props.data
    tmpData.sort((a, b) => (a.key > b.key) ? 1 : ((b.key > a.key) ? -1 : 0))
    tmpData.forEach(date => {
      dataRows.push(createData(date.key, date.value, date.encoding, date.timestamp))
    })
  }

  return (
        <TableContainer>
            <Table sx={{ minWidth: 650 }} aria-label="data table">
                <TableHead>
                    <TableRow>
                    {headCells.map((headCell) => (
                        <TableCell
                            key={headCell.id}
                            align={headCell.numeric ? 'right' : 'left'}
                            padding={headCell.disablePadding ? 'none' : 'normal'}
                        >
                          {headCell.label}
                        </TableCell>
                    ))}
                    </TableRow>
                </TableHead>
                <TableBody>
                {dataRows.map((row) => (
                    <TableRow
                        key={row.name}
                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                    >
                        <TableCell component="th" scope="row" >{row.key}</TableCell>
                        <TableCell>{row.value}</TableCell>
                        <TableCell>{row.encoding}</TableCell>
                        <TableCell>{row.timestamp}</TableCell>
                    </TableRow>
                ))}
                </TableBody>
            </Table>
        </TableContainer>
  )
}

DataTable.propTypes = {
  data: PropTypes.object
}
