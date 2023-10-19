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
import { Button, Grid, Typography } from '@mui/material'
import CircularProgress from '@mui/material/CircularProgress'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import ReplayIcon from '@mui/icons-material/Replay'
import ReportIcon from '@mui/icons-material/Report'
import Alert from '@mui/material/Alert'
import AlertTitle from '@mui/material/AlertTitle'
import PropTypes from 'prop-types'
import React from 'react'
import AppAPI from '../api/device/AppAPI'
import { ReferenceDataContext } from '../data/ReferenceDataContext'
import { JobsContext } from '../data/JobsContext'
import { mapJobStatus } from '../utils/mapJobStatus'
import { postMPLogin } from '../api/device/DeviceAuthAPI'
import AuthService from '../api/marketplace/AuthService'

export default function InstallApp (props) {
  const { app, version, handleActiveStep } = (props)
  const { appList, setUpdateAppList } = React.useContext(ReferenceDataContext)
  const [installing, setInstalling] = React.useState(false)
  const [success, setSuccess] = React.useState(false)
  const [error, setError] = React.useState(false)
  const [retry, setRetry] = React.useState(false)
  const [installationMessage, setInstallationMessage] = React.useState('')
  const [infoMessage, setInfoMessage] = React.useState(false)
  const { setFetchingJobs } = React.useContext(JobsContext)
  const [running, setRunning] = React.useState(false)
  const executedRef = React.useRef(false)

  function loadReferenceData (props) {
    if (appList) {
      const tmpApp = appList.find(obj => {
        return (obj.appKey.name === props.appKey.name && obj.appKey.version === props.appKey.version)
      })

      return tmpApp
    }
  }

  const installApp = React.useCallback(async (app) => {
    setInstalling(true)
    setSuccess(false)
    setError(false)
    setFetchingJobs(true)

    const currentUser = AuthService.getCurrentUser()
    const mpLogin = await postMPLogin(currentUser)
    if (mpLogin.status === 200) {
      const appAPI = new AppAPI(app)
      appAPI.setAppData(loadReferenceData(app))
      await appAPI.installFromMarketplace(version, handleInstallationJob)

      if (appAPI.lastAPICallSuccessful) {
        setUpdateAppList(true)
      }
    } else {
      setError(true)
      setInstalling(false)
    }
    setFetchingJobs(false)
  })

  React.useEffect(() => {
    if (executedRef.current) { return }
    if (app && !installing && (!success || !error)) {
      setRetry(false)
      installApp(app)
    } else {
      setError(true)
      setInstallationMessage('Error during the installation of ' + app?.title + '.')
    }
    executedRef.current = true
  }, [retry])

  const onRetryButtonClick = (event) => {
    executedRef.current = false
    setRetry(true)
  }

  const handleInstallationJob = (status) => {
    const mappedStatus = mapJobStatus(status)
    if (mappedStatus === 0) {
      setInstallationMessage(`We're busy installing or uninstalling another app. Installation of ${app.title} will begin soon.`)
    } else if (mappedStatus === 1) {
      setRunning(true)
      setInstallationMessage('Installing ' + app.title + '.')
      setInfoMessage(true)
    } else if (mappedStatus === 3) {
      setRunning(false)
      setInstallationMessage(app.title + ' successfully installed.')
      setInfoMessage(false)
      setSuccess(true)
      setInstalling(false)
    } else if (mappedStatus === -1) {
      setRunning(false)
      setInstallationMessage('Error during the installation of ' + app.title + '.')
      setSuccess(false)
      setError(true)
      setInstalling(false)
    }
    handleActiveStep(mappedStatus)
  }

  return (
    <div>
      <Grid data-testid='install-app-step' container direction="column" spacing={1} style={{ minHeight: 350, marginTop: 16 }} justifyContent="center" alignItems="center">
        <Grid item >
          {(installing && !running) && <CircularProgress color='secondary' />} {/* pending job */}
          {running && <CircularProgress />}
          {(success && !installing) && <CheckCircleIcon data-testid='success-icon' fontSize='large' color='success'></CheckCircleIcon>}
          {error && <ReportIcon data-testid='error-icon' fontSize='large' color='error'></ReportIcon>}
        </Grid>
        <Grid item >
          <Typography data-testid='installationMessage'>{installationMessage}</Typography>
        </Grid>
        <Grid item>
        {infoMessage
          ? <Alert sx={{ mb: 2, marginTop: '50px' }} severity='info'>
            <AlertTitle>Info</AlertTitle>
            <Typography variant='body2'>You can close this window. Installation takes place automatically in the background.</Typography>
          </Alert>
          : null}
        </Grid>
        {(error) &&
        <Grid item >
          <Button onClick={onRetryButtonClick} startIcon={<ReplayIcon />}>Retry</Button>
        </Grid>}
      </Grid>
    </div>
  )
}

InstallApp.propTypes = {
  app: PropTypes.object,
  appKey: PropTypes.object,
  version: PropTypes.string,
  handleActiveStep: PropTypes.func
}
