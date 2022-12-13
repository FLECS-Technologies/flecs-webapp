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
import { LoadingButton } from '@mui/lab'
import UploadIcon from '@mui/icons-material/Upload'
import { downloadLatestExport } from '../api/device/ExportAppsService'
import ActionSnackbar from './ActionSnackbar'
import { ReferenceDataContext } from '../data/ReferenceDataContext'

export default function Export (props) {
  const { ...buttonProps } = props
  const { appList } = React.useContext(ReferenceDataContext)
  const [exporting, setExporting] = React.useState(false)
  const [snackbarOpen, setSnackbarOpen] = React.useState(false)
  const [snackbarState, setSnackbarState] = React.useState({
    snackbarText: 'Info',
    alertSeverity: 'success'
  })
  const exportApps = async (props) => {
    setExporting(true)

    const apps = appList?.map(app => { return { app: app.app, version: app.version } })
    const instances = appList?.map(app => { return app?.instances }).flat()

    downloadLatestExport(apps, instances)
      .then((response) => {
        /*
            alternative:
            use js-file-download library
            var fileDownload = require('js-file-download');
            fileDownload(response, 'filename.csv');
        */
        // create file link in browser's memory
        const href = URL.createObjectURL(response)

        // create "a" HTML element with href to file & click
        const link = document.createElement('a')
        link.href = href
        link.setAttribute('flecs export', window.location.hostname + '-flecs-export.tar')
        document.body.appendChild(link)
        link.click()

        // clean up "a" element & remove ObjectURL
        document.body.removeChild(link)
        URL.revokeObjectURL(href)
      })
      .catch((error) => {
        setSnackbarState({
          alertSeverity: 'error',
          snackbarText: (error?.response?.data?.message ? error?.response?.data?.message : error?.message)
        })
        setSnackbarOpen(true)
      })
      .finally(() => {
        setExporting(false)
      })
  }
  return (
    <>
    <LoadingButton {...buttonProps} loading={exporting} variant='outlined' startIcon={<UploadIcon/>} onClick={() => exportApps()}>
        Export
    </LoadingButton>
    <ActionSnackbar
        text={snackbarState.snackbarText}
        open={snackbarOpen}
        setOpen={setSnackbarOpen}
        alertSeverity={snackbarState.alertSeverity}/>
    </>
  )
}
