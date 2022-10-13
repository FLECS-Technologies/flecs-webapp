/*
 * Copyright (c) 2022 FLECS Technologies GmbH
 *
 * Created on Thu Oct 13 2022
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
import { Button, CircularProgress, Grid, Typography } from '@mui/material'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import ReplayIcon from '@mui/icons-material/Replay'
import ReportIcon from '@mui/icons-material/Report'
import PropTypes from 'prop-types'
import React from 'react'
import { ReferenceDataContext } from '../data/ReferenceDataContext'
import { setLicensedApp } from '../api/LicenseService'
import { UpdateAppService } from '../api/UpdateAppService'

export default function UpdateApp (props) {
  const { update, app, from, to, tickets } = (props)
  const executedRef = React.useRef(false)
  const { setUpdateAppList } = React.useContext(ReferenceDataContext)
  const [updating, setUpdating] = React.useState(false)
  const [success, setSuccess] = React.useState(false)
  const [error, setError] = React.useState(false)
  const [retry, setRetry] = React.useState(false)
  const [installationMessage, setInstallationMessage] = React.useState('')

  const updateApp = React.useCallback(async (app, from, to, tickets) => {
    setUpdating(true)
    setSuccess(false)
    setError(false)
    setInstallationMessage(((from < to) ? 'Updating...' : 'Downgrading'))

    // call update endpoint
    UpdateAppService(app?.app, from, to, tickets[0]?.license_key)
      .then(() => {
        // trigger a reload of all installed apps
        setLicensedApp(tickets[0]?.license_key, app?.title)
          .then()
          .catch()
          .finally(() => {
            setUpdateAppList(true)
            setSuccess(true)
            setInstallationMessage('Congratulations! ' + app?.title + ' was successfully ' + ((from < to) ? 'updated' : 'downgraded') + ' from version ' + from + ' to version ' + to + '!')
          })
      })
      .catch((error) => {
        setSuccess(false)
        setError(true)
        setInstallationMessage('Oops... ' + (error.message || 'Error during the ' + ((from < to) ? 'update' : 'downgrade') + ' of ' + app?.title + '.'))
      })
      .finally(() => {
        setUpdating(false)
      }
      )
  })

  React.useEffect(() => {
    if (executedRef.current) { return }
    if (tickets?.length > 0 && app && update && from && to && !updating && (!success || !error)) {
      setRetry(false)
      updateApp(app, from, to, tickets)
    }
    executedRef.current = true
  }, [retry])

  const handleRetryClick = (event) => {
    setRetry(true)
    executedRef.current = false
  }

  return (
    <div>
      <Grid data-testid='sideload-app-step' container direction="column" spacing={1} style={{ minHeight: 350, marginTop: 16 }} justifyContent="center" alignItems="center">
        <Grid item >
          {updating && <CircularProgress></CircularProgress>}
          {(success && !updating) && <CheckCircleIcon data-testid='success-icon' fontSize='large' color='success'></CheckCircleIcon>}
          {error && <ReportIcon data-testid='error-icon' fontSize='large' color='error'></ReportIcon>}
        </Grid>
        <Grid item >
          <Typography data-testid='installationMessage'>{installationMessage}</Typography>
        </Grid>
        {(error) &&
        <Grid item >
          <Button onClick={() => handleRetryClick()} startIcon={<ReplayIcon />}>Retry</Button>
        </Grid>}
      </Grid>
    </div>
  )
}

UpdateApp.propTypes = {
  update: PropTypes.bool,
  app: PropTypes.object,
  from: PropTypes.string,
  to: PropTypes.string,
  tickets: PropTypes.array
}
