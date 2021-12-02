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
import Button from '@mui/material/Button'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Typography from '@mui/material/Typography'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp'
import PlayCircleIcon from '@mui/icons-material/PlayCircle'
import PauseCircleFilledIcon from '@mui/icons-material/PauseCircleFilled'
import CircleIcon from '@mui/icons-material/Circle'
import ErrorIcon from '@mui/icons-material/Error'
import AddTaskIcon from '@mui/icons-material/AddTask'
import DeleteIcon from '@mui/icons-material/Delete'
import Tooltip from '@mui/material/Tooltip'
import Toolbar from '@mui/material/Toolbar'
import Avatar from '@mui/material/Avatar'
import Snackbar from '@mui/material/Snackbar'
import Alert from '@mui/material/Alert'

import { ReferenceDataContext } from '../data/ReferenceDataContext'
import AppAPI from '../api/AppAPI'

export default function Row (props) {
  const { appList, setAppList } = useContext(ReferenceDataContext)
  const { row } = props
  const [open, setOpen] = useState(false)
  const [snackbarState, setSnackbarState] = useState({
    snackbarOpen: false,
    snackbarText: 'Info',
    alertSeverity: 'success'
  })
  const { alertSeverity, snackbarText, snackbarOpen } = snackbarState

  function loadReferenceData (props) {
    const tmpApp = appList.find(obj => {
      return obj.app === props.app
    })

    return tmpApp
  }

  function updateReferenceDataInstances (props) {
    setAppList(
      appList.map(item =>
        item.app === props.app
          ? { ...item, instances: props.instances }
          : item)
    )
  }

  const startNewInstance = async (props) => {
    let snackbarText
    let alertSeverity
    const appAPI = new AppAPI(props.row)
    appAPI.setAppData(loadReferenceData(props.row))
    await appAPI.createInstance(appAPI.app.name + appAPI.app.instances.length)

    if (appAPI.lastAPICallSuccessfull) {
      updateReferenceDataInstances(appAPI.app)
      startInstance(appAPI, appAPI.app.instances[appAPI.app.instances.length - 1])
    } else {
      // error snackbar
      snackbarText = 'Failed to start a new instance of ' + appAPI.app.name + '.'
      alertSeverity = 'error'
      setSnackbarState({
        snackbarOpen: true,
        alertSeverity: alertSeverity,
        snackbarText: snackbarText
      })
    }
  }

  const stopInstance = async (app, instanceId) => {
    let snackbarText
    let alertSeverity
    const appAPI = new AppAPI(app)
    appAPI.setAppData(loadReferenceData(app))
    await appAPI.stopInstance(instanceId)

    if (appAPI.lastAPICallSuccessfull) {
      updateReferenceDataInstances(appAPI.app)
    } else {
      // error snackbar
      snackbarText = 'Failed to stop ' + appAPI.app.instances.find(obj => { return obj.instanceId === instanceId }).instancename + '.'
      alertSeverity = 'error'
      setSnackbarState({
        snackbarOpen: true,
        alertSeverity: alertSeverity,
        snackbarText: snackbarText
      })
    }
  }

  const startInstance = async (app, version, instanceId) => {
    let snackbarText
    let alertSeverity
    const appAPI = new AppAPI(app)
    appAPI.setAppData(loadReferenceData(app))
    await appAPI.startInstance(version, instanceId)

    if (appAPI.lastAPICallSuccessfull) {
      updateReferenceDataInstances(appAPI.app)
    } else {
      // error snackbar
      snackbarText = 'Failed to start ' + appAPI.app.instances.find(obj => { return obj.instanceId === instanceId }).instancename + '.'
      alertSeverity = 'error'
      setSnackbarState({
        snackbarOpen: true,
        alertSeverity: alertSeverity,
        snackbarText: snackbarText
      })
    }
  }

  const deleteInstance = async (app, version, instanceId) => {
    let snackbarText
    let alertSeverity
    const appAPI = new AppAPI(app)
    appAPI.setAppData(loadReferenceData(app))
    await appAPI.deleteInstance(version, instanceId)

    if (appAPI.lastAPICallSuccessfull) {
      updateReferenceDataInstances(appAPI.app)
    } else {
      // error snackbar
      snackbarText = 'Failed to delete ' + appAPI.app.instances.find(obj => { return obj.instanceId === instanceId }).instancename + '.'
      alertSeverity = 'error'
      setSnackbarState({
        snackbarOpen: true,
        alertSeverity: alertSeverity,
        snackbarText: snackbarText
      })
    }
  }

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return
    }

    setSnackbarState({
      snackbarOpen: false,
      snackbarText: snackbarText,
      alertSeverity: alertSeverity
    })
  }

  return (
    <Fragment>
      <TableRow /* sx={{ '& > *': { borderBottom: 'none' } }} */ >
        <TableCell style={{ borderBottom: 'none' }}>
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={() => setOpen(!open)}
          >
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell style={{ borderBottom: 'none' }} component="th" scope="row">
          <Avatar src={row.avatar}></Avatar>
        </TableCell>
        <TableCell style={{ borderBottom: 'none' }}>{row.name}</TableCell>
        <TableCell style={{ borderBottom: 'none' }}>{row.author}</TableCell>
        <TableCell style={{ borderBottom: 'none' }}>{row.version}</TableCell>
        <TableCell style={{ borderBottom: 'none' }}>
          <Tooltip title={row.multiInstance ? 'Start new app instance' : 'You can only have one instance of this app'}>
            <span>
              <IconButton
                color="primary"
                onClick={() => startNewInstance(props)}
                disabled={!row.multiInstance}
              >
                <AddTaskIcon />
              </IconButton>
            </span>
          </Tooltip>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1 }}>
              <Toolbar sx={{ pl: { sm: 2 }, pr: { xs: 1, sm: 1 } }}>
                <Typography sx={{ flex: '0.1 0.1 10%' }} variant="h6" gutterBottom component="div">
                  App instances
                </Typography>
                <Button
                  variant="contained"
                  onClick={() => startNewInstance(props)}
                  startIcon={<AddTaskIcon />}
                  disabled={!row.multiInstance}
                >
                  start new instance
                </Button>
              </Toolbar>
              <Table size="small" aria-label="app-instances">
                <TableHead>
                  <TableRow>
                    <TableCell>Status</TableCell>
                    <TableCell>Instance name</TableCell>
                    <TableCell>Version</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {row.instances.map((appInstance) => (
                    <TableRow key={appInstance.instanceId}>
                      <TableCell component="th" scope="row">
                      <Tooltip title={'App ' + row.status}>
                          {appInstance.status === 'started'
                            ? (
                            <CircleIcon color="success" />
                              )
                            : (
                            <ErrorIcon color="warning" />
                              )}
                        </Tooltip>
                      </TableCell>
                      <TableCell>{appInstance.instancename}</TableCell>
                      <TableCell>{appInstance.version}</TableCell>
                      <TableCell>
                      <Tooltip title="Start instance">
                          <span>
                            <IconButton
                              color="success"
                              disabled={appInstance.status === 'started'}
                              onClick={() => startInstance(row, appInstance.version, appInstance.instanceId)}
                            >
                              <PlayCircleIcon />
                            </IconButton>
                          </span>
                        </Tooltip>
                        <Tooltip title="Stop instance">
                          <span>
                            <IconButton
                              color="warning"
                              disabled={appInstance.status === 'stopped'}
                              onClick={() => stopInstance(row, appInstance.instanceId)}
                            >
                              <PauseCircleFilledIcon />
                            </IconButton>
                          </span>
                        </Tooltip>
                        <Tooltip title="Delete instance">
                          <span>
                            <IconButton
                              onClick={() => deleteInstance(row, appInstance.version, appInstance.instanceId)}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </span>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
      <Snackbar
          anchorOrigin={{ horizontal: 'center', vertical: 'bottom' }}
          open={snackbarOpen}
          autoHideDuration={3000}
          onClose={handleSnackbarClose}
        >
          <Alert
            onClose={handleSnackbarClose}
            severity={alertSeverity}
            sx={{ width: '100%' }}
          >
            {snackbarText}
          </Alert>
        </Snackbar>
    </Fragment>
  )
}

Row.propTypes = {
  row: PropTypes.any,
  app: PropTypes.string,
  instanceId: PropTypes.string,
  instances: PropTypes.array
}
