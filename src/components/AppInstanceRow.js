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
import React, { Fragment } from 'react'
import ReactDOM from 'react-dom'
import PropTypes from 'prop-types'
import TableRow from '@mui/material/TableRow'
import TableCell from '@mui/material/TableCell'
import Tooltip from '@mui/material/Tooltip'
import Grid from '@mui/material/Grid'
import PlayCircleIcon from '@mui/icons-material/PlayCircle'
import StopCircleIcon from '@mui/icons-material/StopCircle'
import CircleIcon from '@mui/icons-material/Circle'
import ErrorIcon from '@mui/icons-material/Error'
import DeleteIcon from '@mui/icons-material/Delete'
import InfoIcon from '@mui/icons-material/Info'
import SettingsIcon from '@mui/icons-material/Settings'

import LoadIconButton from './LoadIconButton'
import AppAPI from '../api/device/AppAPI'
import ActionSnackbar from './ActionSnackbar'
import { ReferenceDataContext } from '../data/ReferenceDataContext'
import ContentDialog from './ContentDialog'
import InstanceInfo from './InstanceInfo'
import InstanceConfig from './InstanceConfig'
import { JobsContext } from '../data/JobsContext'
import { OpenAppButton } from './apps/instance/OpenAppButton'
import ConfirmDialog from './ConfirmDialog'
import InstanceConfigDialog from './dialogs/InstanceConfigDialog'

export default function AppInstanceRow(props) {
  const { app, appInstance, loadAppReferenceData } = props
  const { setUpdateAppList } = React.useContext(ReferenceDataContext)
  const [instanceStarting, setInstanceStarting] = React.useState(false)
  const [instanceStopping, setInstanceStopping] = React.useState(false)
  const [instanceDeleting, setInstanceDeleting] = React.useState(false)
  const [confirmOpen, setConfirmOpen] = React.useState(false)
  const [instanceNotReady] = React.useState(
    props.appInstance.status !== 'running' &&
      props.appInstance.status !== 'stopped'
  )
  const [instanceInfoOpen, setInstanceInfoOpen] = React.useState(false)
  const [instanceSettingsOpen, setInstanceSettingsOpen] = React.useState(false)
  const [snackbarOpen, setSnackbarOpen] = React.useState(false)
  const [snackbarState, setSnackbarState] = React.useState({
    snackbarText: 'Info',
    snackbarErrorText: '',
    alertSeverity: 'success'
  })
  const { snackbarText, snackbarErrorText, alertSeverity } = snackbarState
  const { setFetchingJobs } = React.useContext(JobsContext)

  const stopInstance = async (instanceId) => {
    setInstanceStopping(true)
    setFetchingJobs(true)
    let snackbarText
    let alertSeverity
    const appAPI = new AppAPI(app)
    appAPI.setAppData(loadAppReferenceData(app))
    await appAPI.stopInstance(instanceId)

    if (appAPI.lastAPICallSuccessful) {
      setUpdateAppList(true)
      snackbarText =
        'Successully stopped ' +
        appAPI.app.instances.find((obj) => {
          return obj.instanceId === instanceId
        }).instanceName +
        '.'
    } else {
      // error snackbar
      snackbarText =
        'Failed to stop ' +
        appAPI.app.instances.find((obj) => {
          return obj.instanceId === instanceId
        }).instanceName +
        '.'
      alertSeverity = 'success'
      setSnackbarState({
        alertSeverity,
        snackbarText,
        snackbarErrorText: appAPI.lastAPIError
      })
      setSnackbarOpen(true)
    }
    setInstanceStopping(false)
    setFetchingJobs(false)
  }

  const startInstance = async (instanceId) => {
    setInstanceStarting(true)
    setFetchingJobs(true)
    let snackbarText
    let alertSeverity
    const appAPI = new AppAPI(app)

    try {
      appAPI.setAppData(loadAppReferenceData(app))
      await appAPI.startInstance(instanceId)

      if (appAPI.lastAPICallSuccessful) {
        setUpdateAppList(true)
        snackbarText =
          'Successully started ' +
          appAPI.app.instances.find((obj) => {
            return obj.instanceId === instanceId
          }).instanceName +
          '.'
      }
    } catch {
      // error snackbar
      snackbarText =
        'Failed to start ' +
        appAPI.app.instances.find((obj) => {
          return obj.instanceId === instanceId
        }).instanceName +
        '.'
      alertSeverity = 'error'
      setSnackbarState({
        alertSeverity,
        snackbarText,
        snackbarErrorText: appAPI.lastAPIError
      })
      setSnackbarOpen(true)
    } finally {
      setInstanceStarting(false)
      setFetchingJobs(false)
    }
  }

  const deleteInstance = async (instanceId) => {
    setInstanceDeleting(true)
    setFetchingJobs(true)
    let snackbarText
    let alertSeverity
    const appAPI = new AppAPI(app)
    appAPI.setAppData(loadAppReferenceData(app))
    await appAPI.deleteInstance(instanceId)

    if (appAPI.lastAPICallSuccessful) {
      setUpdateAppList(true)
      snackbarText = appAPI.app.title + ' instance successully deleted.'
      alertSeverity = 'success'
    } else {
      // error snackbar
      snackbarText =
        'Failed to delete ' +
        appAPI.app.instances.find((obj) => {
          return obj.instanceId === instanceId
        }).instanceName +
        '.'
      alertSeverity = 'error'
    }
    setSnackbarState({
      alertSeverity,
      snackbarText,
      snackbarErrorText: appAPI.lastAPIError
    })
    setSnackbarOpen(true)
    setInstanceDeleting(false)
    setFetchingJobs(false)
  }

  return (
    <Fragment>
      <TableRow>
        <TableCell component='th' scope='row'>
          <Tooltip title={'App ' + appInstance.status}>
            {appInstance.status === 'running' ? (
              <CircleIcon color='success' />
            ) : (
              <ErrorIcon color='warning' />
            )}
          </Tooltip>
        </TableCell>
        <TableCell>{appInstance.instanceName}</TableCell>
        <TableCell>{appInstance.appKey.version}</TableCell>
        <TableCell>
          <Grid
            container
            direction='row'
            justify='flex-start'
            alignItems='flex-start'
          >
            <Tooltip title='Open app in new tab'>
              <span>
                <OpenAppButton
                  instance={appInstance}
                  variant='icon'
                ></OpenAppButton>
              </span>
            </Tooltip>
            <Tooltip title='Info to this instance'>
              <span>
                <LoadIconButton
                  label='instance-info-button'
                  icon={<InfoIcon />}
                  onClick={() => setInstanceInfoOpen(true)}
                />
              </span>
            </Tooltip>
            <Tooltip title='Start instance'>
              <span>
                <LoadIconButton
                  label='start-instance-button'
                  icon={<PlayCircleIcon />}
                  color='success'
                  disabled={
                    appInstance.status === 'running' ||
                    instanceStarting ||
                    instanceStopping ||
                    instanceDeleting ||
                    instanceNotReady
                  }
                  onClick={() => startInstance(appInstance.instanceId)}
                  loading={instanceStarting}
                />
              </span>
            </Tooltip>
            <Tooltip title='Stop instance'>
              <span>
                <LoadIconButton
                  label='stop-instance-button'
                  icon={<StopCircleIcon />}
                  disabled={
                    appInstance.status === 'stopped' ||
                    instanceStopping ||
                    instanceStarting ||
                    instanceDeleting ||
                    instanceNotReady
                  }
                  onClick={() => stopInstance(appInstance.instanceId)}
                  loading={instanceStopping}
                />
              </span>
            </Tooltip>
            <Tooltip title='Settings of this instance'>
              <span>
                <LoadIconButton
                  label='instance-settings-button'
                  icon={<SettingsIcon />}
                  onClick={() => setInstanceSettingsOpen(true)}
                />
              </span>
            </Tooltip>
            <Tooltip title='Delete instance'>
              <span>
                <LoadIconButton
                  label='delete-instance-button'
                  icon={<DeleteIcon />}
                  disabled={
                    instanceDeleting || instanceStopping || instanceStarting
                  }
                  onClick={() => setConfirmOpen(true)}
                  loading={instanceDeleting}
                />
              </span>
            </Tooltip>
          </Grid>
        </TableCell>
      </TableRow>
      {/* Portals for Dialogs and Snackbar */}
      {ReactDOM.createPortal(
        <ActionSnackbar
          text={snackbarText}
          errorText={snackbarErrorText}
          open={snackbarOpen}
          setOpen={setSnackbarOpen}
          alertSeverity={alertSeverity}
        />,
        document.body
      )}
      {ReactDOM.createPortal(
        <ContentDialog
          title={'Info to ' + appInstance.instanceName}
          open={instanceInfoOpen}
          setOpen={setInstanceInfoOpen}
        >
          <InstanceInfo instance={appInstance} />
        </ContentDialog>,
        document.body
      )}
      {ReactDOM.createPortal(
        <InstanceConfigDialog
          instanceId={appInstance.instanceId}
          instanceName={appInstance.instanceName}
          open={instanceSettingsOpen}
          onClose={() => setInstanceSettingsOpen(false)}
        />,
        document.body
      )}
      {ReactDOM.createPortal(
        <ConfirmDialog
          title={'Remove ' + appInstance.instanceName + ' instance?'}
          open={confirmOpen}
          setOpen={setConfirmOpen}
          onConfirm={() => deleteInstance(appInstance.instanceId)}
        />,
        document.body
      )}
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
