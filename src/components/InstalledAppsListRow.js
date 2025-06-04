/*
 * Copyright (c) 2021 FLECS Technologies GmbH
 *
 * Created on Tue Nov 30 2021
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

import { React, useContext, useState, Fragment } from 'react'
import PropTypes from 'prop-types'
import Box from '@mui/material/Box'
import Collapse from '@mui/material/Collapse'
import IconButton from '@mui/material/IconButton'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Typography from '@mui/material/Typography'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp'
import AddTaskIcon from '@mui/icons-material/AddTask'
import DeleteIcon from '@mui/icons-material/Delete'
import Tooltip from '@mui/material/Tooltip'
import Toolbar from '@mui/material/Toolbar'
import Avatar from '@mui/material/Avatar'

import LoadIconButton from './LoadIconButton'
import { ReferenceDataContext } from '../data/ReferenceDataContext'
import AppAPI from '../api/device/AppAPI'
import AppInstanceRow from './AppInstanceRow'
import ActionSnackbar from './ActionSnackbar'
import ConfirmDialog from './ConfirmDialog'
import useStateWithLocalStorage from './LocalStorage'
import { JobsContext } from '../data/JobsContext'
import HelpButton from './buttons/help/HelpButton'
import { EditorButtons } from './buttons/editors/EditorButtons'
import { InstanceStartCreateButtons } from './buttons/instance/InstanceStartCreateButtons'

export default function Row(props) {
  const { appList, setUpdateAppList } = useContext(ReferenceDataContext)
  const { row } = props
  const [open, setOpen] = useStateWithLocalStorage(
    props.row.appKey.name + '.row.collapsed',
    false
  )
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [uninstalling, setUninstalling] = useState(false)
  const [snackbarOpen, setSnackbarOpen] = useState(false)
  const [snackbarState, setSnackbarState] = useState({
    snackbarText: 'Info',
    alertSeverity: 'success',
    snackbarErrorText: ''
  })
  const { alertSeverity, snackbarText, snackbarErrorText } = snackbarState
  const [newInstanceStarting, setNewInstanceStarting] = useState(false)
  const { setFetchingJobs } = useContext(JobsContext)

  function loadReferenceData(props) {
    const tmpApp = appList?.find((obj) => {
      return (
        obj.appKey.name === props.appKey.name &&
        obj.appKey.version === props.appKey.version
      )
    })

    return tmpApp
  }

  // set defaults
  const appId = props.row.appKey.name.split('.')
  if (!('title' in row)) {
    row.title = appId[2]
  }
  if (!('author' in row)) {
    row.author = appId[1]
  }
  if (!('avatar' in row)) {
    row.avatar = ''
  }
  if (!('multiInstance' in row)) {
    row.multiInstance = false
  }

  const uninstallApp = async (props) => {
    setUninstalling(true)
    setFetchingJobs(true)
    let snackbarText
    let alertSeverity
    const appAPI = new AppAPI(props.row)
    await appAPI.uninstall()

    if (appAPI.lastAPICallSuccessful) {
      if (setUpdateAppList) {
        setUpdateAppList(true)
      }
      snackbarText = appAPI.app.title + ' successfully uninstalled.'
      alertSeverity = 'success'
    } else {
      snackbarText = 'Failed to uninstall ' + appAPI.app.title + '.'
      alertSeverity = 'error'
    }

    setSnackbarState({
      alertSeverity,
      snackbarText
    })
    setSnackbarOpen(true)
    setFetchingJobs(false)
    setUninstalling(false)
  }

  const createNewInstance = async (props, start) => {
    setNewInstanceStarting(true)
    setFetchingJobs(true)
    let snackbarText
    let alertSeverity
    let instanceId
    const appAPI = new AppAPI(props.row)

    try {
      await appAPI.createInstance(appAPI.createInstanceName())

      if (appAPI.jobStatus === 'successful') {
        // instance has been created
        // success snackbar
        snackbarText =
          'Successfully created a new instance of ' + appAPI.app.title + '.'
        alertSeverity = 'success'
      }

      instanceId = appAPI.instanceId;
    } catch {
      // error snackbar
      snackbarText =
        'Failed to create a new instance of ' + appAPI.app.title + '.'
      alertSeverity = 'error'
    }
    setSnackbarState({
      alertSeverity,
      snackbarText
    })
    setSnackbarOpen(true)

    if (instanceId) {
      // instance has been created, regardless of status
      setUpdateAppList(true)
    }

    if (instanceId && start) {
      try {
        await appAPI.startInstance(instanceId)

        if (appAPI.jobStatus === 'successful') {
          // instance has started
          // success snackbar
          snackbarText =
            'Successfully started a new instance of ' + appAPI.app.title + '.'
          alertSeverity = 'success'
        }
      } catch {
        // error snackbar
        snackbarText =
          'Failed to start the new instance of ' + appAPI.app.title + '.'
        alertSeverity = 'error'
      }
      setSnackbarState({
        alertSeverity,
        snackbarText
      })
      setSnackbarOpen(true)
      setUpdateAppList(true)
    }

    setNewInstanceStarting(false)
    setFetchingJobs(false)
  }

  return (
    <Fragment>
      <TableRow data-testid='app-row'>
        <TableCell
          data-testid='expand-app-cell'
          style={{ borderBottom: 'none' }}
        >
          <IconButton
            data-testid='expand-app-button'
            aria-label='expand row'
            size='small'
            sx={{ mr: 1 }}
            onClick={() => setOpen(!open)}
          >
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell
          data-testid='app-avatar-cell'
          style={{ borderBottom: 'none' }}
          component='th'
          scope='row'
        >
          <Avatar data-testid='app-avatar' src={row.avatar}>
            {row.title.charAt(0).toUpperCase()}
          </Avatar>
        </TableCell>
        <TableCell
          data-testid='app-title-cell'
          style={{ borderBottom: 'none' }}
        >
          {row.title}
        </TableCell>
        <TableCell
          data-testid='app-author-cell'
          style={{ borderBottom: 'none' }}
        >
          {row.author}
        </TableCell>
        <TableCell
          data-testid='app-version-cell'
          style={{ borderBottom: 'none' }}
        >
          {row.appKey.version}
        </TableCell>
        <TableCell
          data-testid='app-actions-cell'
          style={{ borderBottom: 'none' }}
        >
          <Toolbar sx={{ pl: { sm: 2 }, pr: { xs: 1, sm: 1 } }}>
            <Tooltip title='Start new app instance'>
              <span>
                <LoadIconButton
                  label='Start new app instance'
                  data-testid='start-new-instance-icon-button'
                  icon={
                    <AddTaskIcon data-testid='start-new-instance-icon-button-icon' />
                  }
                  onClick={() => createNewInstance(props, true)}
                  disabled={
                    (!row.multiInstance && row.instances.length > 0) ||
                    newInstanceStarting ||
                    uninstalling
                  }
                  loading={newInstanceStarting}
                />
              </span>
            </Tooltip>
            <Tooltip title={'Uninstall app'}>
              <span>
                <LoadIconButton
                  data-testid='uninstall-button'
                  icon={<DeleteIcon />}
                  onClick={() => setConfirmOpen(true)}
                  loading={uninstalling}
                  disabled={uninstalling}
                />
              </span>
            </Tooltip>
            {row.documentationUrl && (
              <HelpButton url={row.documentationUrl} label='Documentation' />
            )}
          </Toolbar>
        </TableCell>
      </TableRow>
      <TableRow data-testid='instances-row'>
        <TableCell
          data-testid='instances-cell'
          style={{ paddingBottom: 0, paddingTop: 0 }}
          colSpan={6}
        >
          <Collapse in={open} timeout='auto' unmountOnExit>
            <Box sx={{ margin: 1 }}>
              <Toolbar sx={{ pl: { sm: 2 }, pr: { xs: 1, sm: 1 } }}>
                <Typography
                  sx={{ flex: '0.1 0.1 10%' }}
                  variant='h6'
                  gutterBottom
                  component='div'
                >
                  App instances
                </Typography>
                {row.instances.length === 1 && (
                  <EditorButtons instance={row.instances[0]}/>
                )}
                <InstanceStartCreateButtons
                  app={row}
                  startNewInstanceCallback={() => createNewInstance(props, true)}
                  createNewInstanceCallback={() => createNewInstance(props, false)}
                  loading={newInstanceStarting}
                  uninstalling={uninstalling}
                />
              </Toolbar>
              <Table
                data-testid='instances-table'
                size='small'
                aria-label='app-instances'style={{ tableLayout: 'fixed', width: '100%' }}
              >
                <TableHead data-testid='instances-table-head'>
                  <TableRow>
                    <TableCell data-testid='instances-table-header-status'>
                      Status
                    </TableCell>
                    <TableCell data-testid='instances-table-header-name'>
                      Instance name
                    </TableCell>
                    <TableCell data-testid='instances-table-header-version'>
                      Version
                    </TableCell>
                    <TableCell data-testid='instances-table-header-actions'>
                      Actions
                    </TableCell>
                    {row.instances.length > 1 && (<TableCell data-testid='instances-table-header-editors'>
                      Editors
                    </TableCell>)}
                  </TableRow>
                </TableHead>
                <TableBody data-testid='instances-table-body'>
                  {row.instances.map((appInstance) => (
                    <AppInstanceRow
                      key={appInstance.instanceId}
                      app={row}
                      appInstance={appInstance}
                      loadAppReferenceData={loadReferenceData}
                      showEditors={row.instances.length > 1}
                    />
                  ))}
                </TableBody>
              </Table>
            </Box>
          </Collapse>
          <ActionSnackbar
            data-testid='snackbar'
            text={snackbarText}
            errorText={snackbarErrorText}
            open={snackbarOpen}
            setOpen={setSnackbarOpen}
            alertSeverity={alertSeverity}
          />
        </TableCell>
      </TableRow>
      <ConfirmDialog
        title={'Uninstall ' + row.title + '?'}
        open={confirmOpen}
        setOpen={setConfirmOpen}
        onConfirm={() => uninstallApp(props)}
      ></ConfirmDialog>
    </Fragment>
  )
}

Row.propTypes = {
  row: PropTypes.any,
  appKey: PropTypes.string,
  instanceId: PropTypes.string,
  instances: PropTypes.array
}
