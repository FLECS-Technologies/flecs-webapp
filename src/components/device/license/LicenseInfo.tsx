/*
 * Copyright (c) 2022 FLECS Technologies GmbH
 *
 * Created on Mon Jun 10 2024
 *
 * Licensed under the Apache License, Version 2.0 (the "License")
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
  LicenseInfoAPI,
  LicenseInfoAPIResponse
} from '../../../api/device/license/info'
import {
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography
} from '@mui/material'
import { DeviceActivationContext } from '../../providers/DeviceActivationContext'

function LicenseInfo() {
  const [info, setInfo] = React.useState<LicenseInfoAPIResponse>()
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState(false)
  const { activated } = React.useContext(DeviceActivationContext)

  const fetchLicenseInfo = async () => {
    setLoading(true)
    await LicenseInfoAPI()
      .then((response) => {
        setInfo(response)
        setError(false)
      })
      .catch(() => {
        setError(true)
      })
    setLoading(false)
  }
  React.useEffect(() => {
    if (!loading) fetchLicenseInfo()
  }, [activated])

  return (
    <React.Fragment>
      <Table size='small' aria-label='license-info-table'>
        <TableHead>
          <TableRow>
            <TableCell colSpan={2}>
              <Typography variant='h6'>License information</Typography>
            </TableCell>
          </TableRow>
        </TableHead>
        {error && (
          <TableBody>
            <TableRow key={'error'} style={{ borderBottom: 'none' }}>
              <TableCell style={{ borderBottom: 'none' }} colSpan={2}>
                Error loading the license information.
              </TableCell>
            </TableRow>
          </TableBody>
        )}
        {loading && (
          <TableBody>
            <TableRow key={'skeleton'} style={{ borderBottom: 'none' }}>
              <TableCell style={{ borderBottom: 'none' }}>
                <Skeleton></Skeleton>
              </TableCell>
              <TableCell style={{ borderBottom: 'none' }}>
                <Skeleton></Skeleton>
              </TableCell>
            </TableRow>
          </TableBody>
        )}
        {info && (
          <TableBody>
            {info.license && (
              <TableRow key={info.license} style={{ borderBottom: 'none' }}>
                <TableCell style={{ borderBottom: 'none' }}>License</TableCell>
                <TableCell style={{ borderBottom: 'none' }}>
                  {info.license}
                </TableCell>
              </TableRow>
            )}
            <TableRow key={String(info.type)} style={{ borderBottom: 'none' }}>
              <TableCell style={{ borderBottom: 'none' }}>Type</TableCell>
              <TableCell style={{ borderBottom: 'none' }}>
                {String(info.type)}
              </TableCell>
            </TableRow>
            {info.sessionId && info.sessionId.id && (
              <TableRow
                key={info.sessionId.id}
                style={{ borderBottom: 'none' }}
              >
                <TableCell style={{ borderBottom: 'none' }}>
                  Session ID
                </TableCell>
                <TableCell style={{ borderBottom: 'none' }}>
                  {info.sessionId.id}
                </TableCell>
              </TableRow>
            )}
            {info.sessionId && info.sessionId.timestamp && (
              <TableRow
                key={String(info.sessionId.timestamp)}
                style={{ borderBottom: 'none' }}
              >
                <TableCell style={{ borderBottom: 'none' }}>
                  Last session renewal
                </TableCell>
                <TableCell style={{ borderBottom: 'none' }}>
                  {String(info.sessionId.timestamp)}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        )}
      </Table>
    </React.Fragment>
  )
}

export default LicenseInfo
