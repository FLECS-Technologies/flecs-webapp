/*
 * Copyright (c) 2021 FLECS Technologies GmbH
 *
 * Created on Fri Dec 03 2021
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
import React, { useState, Fragment } from 'react'
import PropTypes from 'prop-types'
import TableRow from '@mui/material/TableRow'
import TableCell from '@mui/material/TableCell'
import Tooltip from '@mui/material/Tooltip'
import Grid from '@mui/material/Grid'
import PlayCircleIcon from '@mui/icons-material/PlayCircle'
import PauseCircleFilledIcon from '@mui/icons-material/PauseCircleFilled'
import CircleIcon from '@mui/icons-material/Circle'
import ErrorIcon from '@mui/icons-material/Error'
import DeleteIcon from '@mui/icons-material/Delete'

import LoadIconButton from './LoadIconButton'
import AppAPI from '../api/AppAPI'
import ActionSnackbar from './ActionSnackbar'

export default function AppInstanceRow (props) {
  const { app, appInstance, loadAppReferenceData, updateReferenceDataInstances } = props
  const [instanceStarting, setInstanceStarting] = useState(false)
  const [instanceStopping, setInstanceStopping] = useState(false)
  const [instanceDeleting, setInstanceDeleting] = useState(false)
  const [instanceNotReady] = useState(
    props.appInstance.status !== 'running' && props.appInstance.status !== 'stopped'
  )
  const [snackbarOpen, setSnackbarOpen] = useState(false)
  const [snackbarState, setSnackbarState] = useState({
    snackbarText: 'Info',
    snackbarErrorText: '',
    alertSeverity: 'success'
  })
  const { snackbarText, snackbarErrorText, alertSeverity } = snackbarState

  const stopInstance = async (app, version, instanceId) => {
    setInstanceStopping(true)
    let snackbarText
    let alertSeverity
    const appAPI = new AppAPI(app)
    appAPI.setAppData(loadAppReferenceData(app))
    await appAPI.stopInstance(version, instanceId)

    if (appAPI.lastAPICallSuccessfull) {
      updateReferenceDataInstances(appAPI.app)
      snackbarText = 'Successully stopped ' + appAPI.app.instances.find(obj => { return obj.instanceId === instanceId }).instanceName + '.'
    } else {
      // error snackbar
      snackbarText = 'Failed to stop ' + appAPI.app.instances.find(obj => { return obj.instanceId === instanceId }).instanceName + '.'
      alertSeverity = 'success'
      setSnackbarState({
        alertSeverity: alertSeverity,
        snackbarText: snackbarText,
        snackbarErrorText: appAPI.lastAPIError
      })
    }
    setSnackbarOpen(true)
    setInstanceStopping(false)
  }

  const startInstance = async (app, version, instanceId) => {
    setInstanceStarting(true)
    let snackbarText
    let alertSeverity
    const appAPI = new AppAPI(app)
    appAPI.setAppData(loadAppReferenceData(app))
    await appAPI.startInstance(version, instanceId)

    if (appAPI.lastAPICallSuccessfull) {
      updateReferenceDataInstances(appAPI.app)
      snackbarText = 'Successully started ' + appAPI.app.instances.find(obj => { return obj.instanceId === instanceId }).instanceName + '.'
    } else {
      // error snackbar
      snackbarText = 'Failed to start ' + appAPI.app.instances.find(obj => { return obj.instanceId === instanceId }).instanceName + '.'
      alertSeverity = 'error'
      setSnackbarState({
        alertSeverity: alertSeverity,
        snackbarText: snackbarText,
        snackbarErrorText: appAPI.lastAPIError
      })
    }
    setSnackbarOpen(true)
    setInstanceStarting(false)
  }

  const deleteInstance = async (app, version, instanceId) => {
    setInstanceDeleting(true)
    let snackbarText
    let alertSeverity
    const appAPI = new AppAPI(app)
    appAPI.setAppData(loadAppReferenceData(app))
    await appAPI.deleteInstance(version, instanceId)

    if (appAPI.lastAPICallSuccessfull) {
      updateReferenceDataInstances(appAPI.app)
      snackbarText = appAPI.app.name + ' instance successully deleted.'
    } else {
      // error snackbar
      snackbarText = 'Failed to delete ' + appAPI.app.instances.find(obj => { return obj.instanceId === instanceId }).instanceName + '.'
      alertSeverity = 'error'
      setSnackbarState({
        alertSeverity: alertSeverity,
        snackbarText: snackbarText,
        snackbarErrorText: appAPI.lastAPIError
      })
    }
    setSnackbarOpen(true)
    setInstanceDeleting(false)
  }

  return (
      <Fragment>
        <TableRow>
        <TableCell component="th" scope="row">
        <Tooltip title={'App ' + appInstance.status}>
            {appInstance.status === 'running'
              ? (
            <CircleIcon color="success" />
                )
              : (
            <ErrorIcon color="warning" />
                )}
        </Tooltip>
        </TableCell>
        <TableCell>{appInstance.instanceName}</TableCell>
        <TableCell>{appInstance.version}</TableCell>
        <TableCell>
            <Grid
                container
                direction="row"
                justify="flex-start"
                alignItems="flex-start"
            >
                <Tooltip title="Start instance">
                    <span>
                    <LoadIconButton
                        icon={<PlayCircleIcon />}
                        color="success"
                        disabled={appInstance.status === 'running' || instanceStarting || instanceStopping || instanceDeleting || instanceNotReady}
                        onClick={() => startInstance(app, appInstance.version, appInstance.instanceId)}
                        loading={instanceStarting}
                    />
                    </span>
                </Tooltip>
                <Tooltip title="Stop instance">
                    <span>
                    <LoadIconButton
                        icon={<PauseCircleFilledIcon />}
                        disabled={appInstance.status === 'stopped' || instanceStopping || instanceStarting || instanceDeleting || instanceNotReady}
                        onClick={() => stopInstance(app, appInstance.version, appInstance.instanceId)}
                        loading={instanceStopping}
                    />
                    </span>
                </Tooltip>
                <Tooltip title="Delete instance">
                    <span>
                    <LoadIconButton
                        icon={<DeleteIcon />}
                        disabled={instanceDeleting || instanceStopping || instanceStarting}
                        onClick={() => deleteInstance(app, appInstance.version, appInstance.instanceId)}
                        loading={instanceDeleting}
                    />
                    </span>
                </Tooltip>
            </Grid>
            </TableCell>
        </TableRow>
        <ActionSnackbar
            text={snackbarText}
            errorText={snackbarErrorText}
            open={snackbarOpen}
            setOpen={setSnackbarOpen}
            alertSeverity={alertSeverity}
        />
    </Fragment>
  )
}

AppInstanceRow.propTypes = {
  app: PropTypes.object,
  appInstance: PropTypes.object,
  loadAppReferenceData: PropTypes.func,
  updateReferenceDataInstances: PropTypes.func,
  setSnackbarState: PropTypes.func
}