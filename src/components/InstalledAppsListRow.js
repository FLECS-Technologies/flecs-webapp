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
import Tooltip from '@mui/material/Tooltip'
import Toolbar from '@mui/material/Toolbar'
import Avatar from '@mui/material/Avatar'

import LoadButton from './LoadButton'
import LoadIconButton from './LoadIconButton'
import { ReferenceDataContext } from '../data/ReferenceDataContext'
import AppAPI from '../api/AppAPI'
import AppInstanceRow from './AppInstanceRow'
import ActionSnackbar from './ActionSnackbar'

export default function Row (props) {
  const { appList, setUpdateAppList } = useContext(ReferenceDataContext)
  const { row } = props
  const [open, setOpen] = useState(false)
  const [snackbarOpen, setSnackbarOpen] = useState(false)
  const [snackbarState, setSnackbarState] = useState({
    snackbarText: 'Info',
    alertSeverity: 'success',
    snackbarErrorText: ''
  })
  const { alertSeverity, snackbarText, snackbarErrorText } = snackbarState
  const [newInstanceStarting, setNewInstanceStarting] = useState(false)

  function loadReferenceData (props) {
    const tmpApp = appList.find(obj => {
      return obj.app === props.app
    })

    return tmpApp
  }

  const startNewInstance = async (props) => {
    setNewInstanceStarting(true)
    let snackbarText
    let alertSeverity
    const appAPI = new AppAPI(props.row)
    appAPI.setAppData(loadReferenceData(props.row))
    await appAPI.createInstance(appAPI.createInstanceName())

    if (appAPI.lastAPICallSuccessfull) {
      setUpdateAppList(true)
      // startInstance(appAPI, appAPI.app.instances[appAPI.app.instances.length - 1])
      snackbarText = 'Successfully started a new instance of ' + appAPI.app.name + '.'
      alertSeverity = 'success'
    } else {
      // error snackbar
      snackbarText = 'Failed to start a new instance of ' + appAPI.app.name + '.'
      alertSeverity = 'error'
    }
    setSnackbarState({
      snackbarOpen: true,
      alertSeverity: alertSeverity,
      snackbarText: snackbarText
    })
    setSnackbarOpen(true)
    setNewInstanceStarting(false)
  }

  return (
    <Fragment>
      <TableRow >
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
              <LoadIconButton
                icon={<AddTaskIcon />}
                color="primary"
                onClick={() => startNewInstance(props)}
                disabled={!row.multiInstance || newInstanceStarting}
                loading={newInstanceStarting}
              />
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
                <LoadButton
                  text="start new instance"
                  variant="contained"
                  onClick={() => startNewInstance(props)}
                  startIcon={<AddTaskIcon />}
                  disabled={!row.multiInstance || newInstanceStarting}
                  loading={newInstanceStarting}
                  label='start-new-instance-button'
                />
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
                    <AppInstanceRow
                      key={appInstance.instanceId}
                      app={row}
                      appInstance={appInstance}
                      loadAppReferenceData={loadReferenceData}
                    />
                  ))}
                </TableBody>
              </Table>
            </Box>
          </Collapse>
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

Row.propTypes = {
  row: PropTypes.any,
  app: PropTypes.string,
  instanceId: PropTypes.string,
  instances: PropTypes.array
}
