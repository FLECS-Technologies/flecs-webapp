/*
 * Copyright (c) 2022 FLECS Technologies GmbH
 *
 * Created on Thu Apr 07 2022
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
import { Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material'

export default function VersionsTable (props) {
  const { coreVersion, webappVersion } = props
  const versions = []

  function createData (component, version) {
    return { component, version }
  }

  versions.push(createData('Core', coreVersion?.core))
  versions.push(createData('UI', webappVersion))

  return (
        <Table data-testid="versions-table" size="small" aria-label="versions-table">
            <TableHead>
                <TableRow>
                    <TableCell colSpan={2}>
                        <Typography variant='h6'>
                            Versions
                        </Typography>
                    </TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {versions && versions?.map((component) => (
                    <TableRow key={component.component} style={{ borderBottom: 'none' }}>
                        <TableCell style={{ borderBottom: 'none' }}>
                            {component.component}
                        </TableCell>
                        <TableCell style={{ borderBottom: 'none' }}>
                            {component.version}
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
  )
}

VersionsTable.propTypes = {
  coreVersion: PropTypes.string,
  webappVersion: PropTypes.string
}
