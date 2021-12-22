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

import { React, useState, useContext } from 'react'
import PropTypes from 'prop-types'
import Card from '@mui/material/Card'
import CardActions from '@mui/material/CardActions'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Avatar from '@mui/material/Avatar'

import LoadButton from './LoadButton'
import ConfirmDialog from './ConfirmDialog'
import AppAPI from '../api/AppAPI'
import RequestAppDialog from './RequestAppDialog'
import { ReferenceDataContext } from '../data/ReferenceDataContext'
import ActionSnackbar from './ActionSnackbar'

export default function OutlinedCard (props) {
  const { appList, setUpdateAppList } = useContext(ReferenceDataContext)
  const installed = (props.status === 'installed')
  const [installing, setInstalling] = useState(false)
  const uninstalled = (props.status !== 'installed')
  const [uninstalling, setUninstalling] = useState(false)
  const [available] = useState(
    props.availability === 'available'
  )
  const displayStateRequest = available ? 'none' : 'block'
  const displayState = available ? 'block' : 'none'
  const [open, setConfirmOpen] = useState(false)
  const [requestOpen, setRequestOpen] = useState(false)
  const [snackbarOpen, setSnackbarOpen] = useState(false)
  const [snackbarState, setSnackbarState] = useState({
    snackbarText: 'Info',
    alertSeverity: 'success',
    clipBoardContent: ''
  })

  const { alertSeverity, snackbarText, clipBoardContent } = snackbarState

  function loadReferenceData (props) {
    if (appList) {
      const tmpApp = appList.find(obj => {
        return obj.app === props.app
      })

      return tmpApp
    }
  }

  const installApp = async (props) => {
    setInstalling(true)
    const appAPI = new AppAPI(props)
    appAPI.setAppData(loadReferenceData(props))
    await appAPI.installFromMarketplace()

    const alertSeverity = appAPI.lastAPICallSuccessfull ? 'success' : 'error'
    const displayCopyIcon = appAPI.lastAPICallSuccessfull ? 'none' : 'block'
    let snackbarText, errorMessage

    if (appAPI.lastAPICallSuccessfull && !installed) {
      // trigger a reload of all installed apps
      setUpdateAppList(true)
      snackbarText = props.title + ' successfully installed.'
    } else {
      snackbarText = 'Failed to install ' + props.title + '.'
      errorMessage = 'Error during the installation of ' + appAPI.app.title
    }

    setSnackbarState({
      alertSeverity: alertSeverity,
      snackbarText: snackbarText,
      displayCopyState: displayCopyIcon,
      clipBoardContent: errorMessage
    })
    setSnackbarOpen(true)
    setInstalling(false)
  }

  const uninstallApp = async (props) => {
    setUninstalling(true)
    const appAPI = new AppAPI(props)
    appAPI.setAppData(loadReferenceData(props))
    await appAPI.uninstall()

    const alertSeverity = appAPI.lastAPICallSuccessfull ? 'success' : 'error'
    const displayCopyIcon = appAPI.lastAPICallSuccessfull ? 'none' : 'block'
    let snackbarText
    let clipBoardContent

    if (appAPI.lastAPICallSuccessfull) {
      // trigger a reload of all installed apps
      setUpdateAppList(true)

      snackbarText = props.title + ' successfully uninstalled.'
    } else {
      snackbarText = 'Failed to uninstall ' + props.title + '.'
      clipBoardContent = appAPI.lastAPIError
    }

    setSnackbarState({
      alertSeverity: alertSeverity,
      snackbarText: snackbarText,
      displayCopyState: displayCopyIcon,
      clipBoardContent: clipBoardContent
    })
    setSnackbarOpen(true)
    setUninstalling(false)
  }

  function requestApp (props, success) {
    const alertSeverity = success ? 'success' : 'error'
    const displayCopyIcon = success ? 'none' : 'block'
    let snackbarText = ''
    if (success) {
      snackbarText = 'Successfully requested ' + props.title + ' as a new app from ' + props.author + '.'
    } else {
      snackbarText = 'Failed to send us the request. Please try again later.'
    }

    setSnackbarState({
      alertSeverity: alertSeverity,
      snackbarText: snackbarText,
      displayCopyState: displayCopyIcon
    })
    setSnackbarOpen(true)
  }

  return (
    <Card sx={{ display: 'flex', justifyContent: 'space-between', flexDirection: 'column', minWidth: 300, maxWidth: 300, minHeight: 230, mr: 2, mb: 2 }}>
      <CardHeader
        avatar={<Avatar src={props.avatar} />}
        title={props.title}
        subheader={props.author}
      ></CardHeader>
      <CardContent>
        <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
          Version {props.version}
        </Typography>
        <Typography sx={{ fontSize: 14 }} color="text.primary" gutterBottom>
          {props.description}
        </Typography>
      </CardContent>
      <CardActions>
        <Button
          variant="outlined"
          size="small"
          aria-label="app-request-button"
          color="info"
          disabled={available}
          onClick={() => setRequestOpen(true)}
          style={{ display: displayStateRequest }}
        >
          Request
        </Button>
        <LoadButton
          text="Install"
          variant="contained"
          color="success"
          label="install-app-button"
          disabled={installed || installing}
          onClick={() => installApp(props)}
          displayState={displayState}
          loading={installing}
        />
        <LoadButton
          text="Uninstall"
          variant="outlined"
          label="uninstall-app-button"
          disabled={uninstalled || uninstalling}
          color="error"
          onClick={() => setConfirmOpen(true)}
          displayState={displayState}
          loading={uninstalling}
        />
        <ConfirmDialog
          title={'Uninstall ' + props.title + '?'}
          open={open}
          setOpen={setConfirmOpen}
          onConfirm={() => uninstallApp(props)}
        >
          Are you sure you want to uninstall {props.title}?
        </ConfirmDialog>
        <RequestAppDialog
          appName={props.title}
          appauthor={props.author}
          open={requestOpen}
          setOpen={setRequestOpen}
          onConfirm={(success) => requestApp(props, success)}
        >
        </RequestAppDialog>
        <ActionSnackbar
          text={snackbarText}
          errorText={clipBoardContent}
          open={snackbarOpen}
          setOpen={setSnackbarOpen}
          alertSeverity={alertSeverity}
        />
      </CardActions>
    </Card>
  )
}

OutlinedCard.propTypes = {
  app: PropTypes.string,
  avatar: PropTypes.string,
  title: PropTypes.string,
  author: PropTypes.string,
  version: PropTypes.string,
  description: PropTypes.string,
  status: PropTypes.string,
  availability: PropTypes.string,
  instances: PropTypes.array
}
