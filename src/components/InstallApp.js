/*
 * Copyright (c) 2022 FLECS Technologies GmbH
 *
 * Created on Thu Feb 03 2022
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
import AppAPI from '../api/AppAPI'
import { ReferenceDataContext } from '../data/ReferenceDataContext'
import { setLicensedApp } from '../api/LicenseService'

export default function InstallApp (props) {
  const { install, app, tickets } = (props)
  const { appList, setUpdateAppList } = React.useContext(ReferenceDataContext)
  const [installing, setInstalling] = React.useState(false)
  const [success, setSuccess] = React.useState(false)
  const [error, setError] = React.useState(false)
  const [retry, setRetry] = React.useState(false)
  const [installationMessage, setInstallationMessage] = React.useState('')
  const executedRef = React.useRef(false)

  function loadReferenceData (props) {
    if (appList) {
      const tmpApp = appList.find(obj => {
        return obj.app === props.app
      })

      return tmpApp
    }
  }

  const installApp = React.useCallback(async (app) => {
    setInstalling(true)
    setSuccess(false)
    setError(false)
    setInstallationMessage('Installing...')
    const appAPI = new AppAPI(app)
    appAPI.setAppData(loadReferenceData(app))
    await appAPI.installFromMarketplace(tickets[0]?.license_key)

    if (appAPI.lastAPICallSuccessfull) {
      // trigger a reload of all installed apps
      setLicensedApp(tickets[0]?.license_key, app.title)
        .then()
        .catch()
        .finally(() => {
          setUpdateAppList(true)
          setSuccess(true)
          setInstallationMessage('Congratulations! ' + app.title + ' was successfully installed!')
        })
    } else {
      setSuccess(false)
      setError(true)
      setInstallationMessage('Oops... ' + (appAPI?.lastAPIError?.additionalInfo || 'Error during the installation of ' + appAPI.app.title + '.'))
    }
    setInstalling(false)
  })

  React.useEffect(() => {
    if (executedRef.current) { return }
    if (tickets?.length > 0 && app && install && !installing && (!success || !error)) {
      setRetry(false)
      installApp(app)
    }
    executedRef.current = true
  }, [retry])

  return (
    <div>
      <Grid data-testid='install-app-step' container direction="column" spacing={1} style={{ minHeight: 350, marginTop: 16 }} justifyContent="center" alignItems="center">
        <Grid item >
          {installing && <CircularProgress></CircularProgress>}
          {(success && !installing) && <CheckCircleIcon data-testid='success-icon' fontSize='large' color='success'></CheckCircleIcon>}
          {error && <ReportIcon data-testid='error-icon' fontSize='large' color='error'></ReportIcon>}
        </Grid>
        <Grid item >
          <Typography data-testid='installationMessage'>{installationMessage}</Typography>
        </Grid>
        {(error) &&
        <Grid item >
          <Button onClick={() => setRetry(true)} startIcon={<ReplayIcon />}>Retry</Button>
        </Grid>}
      </Grid>
    </div>
  )
}

InstallApp.propTypes = {
  install: PropTypes.bool,
  app: PropTypes.object,
  tickets: PropTypes.array
}
