/*
 * Copyright (c) 2022 FLECS Technologies GmbH
 *
 * Created on Fri Dec 09 2022
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
import React from 'react'
import PropTypes from 'prop-types'
import DownloadIcon from '@mui/icons-material/Download'
import { postImportApps } from '../api/device/ImportAppsService'
import ActionSnackbar from './ActionSnackbar'
import FileOpen from './FileOpen'

export default function Import (props) {
  const { ...buttonProps } = props
  const [importing, setImporting] = React.useState(false)
  const [snackbarOpen, setSnackbarOpen] = React.useState(false)
  const [snackbarState, setSnackbarState] = React.useState({
    snackbarText: 'Info',
    alertSeverity: 'success'
  })
  const importApps = async (props) => {
    setImporting(true)

    const formData = new FormData()
    formData.append('file', props)

    postImportApps(formData)
      .then(() => {

      })
      .catch((error) => {
        setSnackbarState({
          alertSeverity: 'error',
          snackbarText: (error?.response?.data?.message ? error?.response?.data?.message : error?.message)
        })
        setSnackbarOpen(true)
      })
      .finally(() => {
        setImporting(false)
      })
  }
  return (
    <>
    <FileOpen
        {...buttonProps}
        data-testid="import-apps-button"
        buttonText="Import"
        buttonIcon={<DownloadIcon/>}
        accept='.tar*'
        onConfirm={importApps}
        loading={importing}
        wholeFile={true}
    ></FileOpen>
    <ActionSnackbar
        text={snackbarState.snackbarText}
        open={snackbarOpen}
        setOpen={setSnackbarOpen}
        alertSeverity={snackbarState.alertSeverity}/>
    </>
  )
}

Import.propTypes = {
  apps: PropTypes.array
}
