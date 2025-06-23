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
import Button from '@mui/material/Button'
import UploadIcon from '@mui/icons-material/Upload'
import { downloadExport } from '../api/device/ExportAppsService'
import ActionSnackbar from './ActionSnackbar'
import { ReferenceDataContext } from '../data/ReferenceDataContext'
import { JobsContext } from '../data/JobsContext'

export default function Export (props) {
  const { ...buttonProps } = props
  const { appList } = React.useContext(ReferenceDataContext)
  const [exporting, setExporting] = React.useState(false)
  const [snackbarOpen, setSnackbarOpen] = React.useState(false)
  const [snackbarState, setSnackbarState] = React.useState({
    snackbarText: 'Info',
    alertSeverity: 'success'
  })
  const { setFetchingJobs, fetchExports } = React.useContext(JobsContext)

  const exportApps = async (props) => {
    setExporting(true)
    setFetchingJobs(true)

    const apps = appList?.map(app => { return { name: app.appKey.name, version: app.appKey.version } })
    const instances = appList?.map(app => { return app?.instances.map(i => i.instanceId) }).flat()

    downloadExport(apps, instances)
      .then((response) => {
        // create <a> HTML element with href to file & click
        const link = document.createElement('a')
        link.download = `flecs-export-${response.exportId}.tar`
        link.href = URL.createObjectURL(response.blob)
        link.click()

        // clean up
        URL.revokeObjectURL(link.href)

        fetchExports()
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
        setFetchingJobs(false)
      })
  }
  return (
    <>
    <Button {...buttonProps} loading={exporting} variant='outlined' startIcon={<UploadIcon/>} onClick={() => exportApps()}>
        Export
    </Button>
    <ActionSnackbar
        text={snackbarState.snackbarText}
        open={snackbarOpen}
        setOpen={setSnackbarOpen}
        alertSeverity={snackbarState.alertSeverity}/>
    </>
  )
}
