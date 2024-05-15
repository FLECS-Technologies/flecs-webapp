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
import axios from 'axios'
import { DeviceAPIConfiguration } from '../api-config'
import BaseAPI from './BaseAPI'
import JobsAPI from './JobsAPI'
import { sleep } from '../../utils/sleep'

export class ExportApps extends BaseAPI {
  async postExportApps (apps, instances) {
    // POST request using fetch with error handling
    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ apps, instances })
    }

    try {
      await this.callAPI(DeviceAPIConfiguration.POST_EXPORT_URL, requestOptions)
    } catch (error) { }
  }
}

async function downloadExport (apps, instances) {
  try {
    if (apps?.length > 0) {
      // 1. export apps & instances
      const exportAPI = new ExportApps()
      await exportAPI.postExportApps(apps, instances)
      const jobId = exportAPI.state.responseData.jobId
      const { jobStatus, exportId } = await waitUntilJobIsComplete(jobId)

      // 2. get export file
      if (jobStatus === 'successful') { // export has been created in the server
        return await getDownloadExport(exportId)
      } else if (jobStatus === 'failed') {
        return Promise.reject(new Error('There was a problem creating the export file'))
      }
    }
  } catch (error) {
    console.error(error)
  }
}

async function downloadPastExport (exportId) {
  const file = await getDownloadExport(exportId)
  const link = document.createElement('a')
  link.download = `flecs-export-${exportId}.tar.gz`
  link.href = URL.createObjectURL(file.blob)
  link.click()

  // clean up
  URL.revokeObjectURL(link.href)
}

async function deleteExport (exportId) {
  return axios
    .delete(DeviceAPIConfiguration.TARGET + DeviceAPIConfiguration.DEVICE_BASE_ROUTE + DeviceAPIConfiguration.DELETE_EXPORT_URL(exportId))
    .then(response => {
      return response
    })
    .catch(error => {
      return Promise.reject(error)
    })
}

async function getExports () {
  return axios
    .get(DeviceAPIConfiguration.TARGET + DeviceAPIConfiguration.DEVICE_BASE_ROUTE + DeviceAPIConfiguration.EXPORTS_ROUTE)
    .then(response => {
      return response.data
    })
    .catch(error => {
      return Promise.reject(error)
    })
}

async function getDownloadExport (exportId) {
  return axios
    .get(DeviceAPIConfiguration.TARGET + DeviceAPIConfiguration.DEVICE_BASE_ROUTE + DeviceAPIConfiguration.GET_EXPORT_URL(exportId), { responseType: 'blob' })
    .then(response => {
      return { blob: response.data, exportId }
    })
    .catch(error => {
      return Promise.reject(error)
    })
}

const waitUntilJobIsComplete = async (jobId) => {
  const jobsAPI = new JobsAPI()
  await jobsAPI.getJob(jobId)
  let jobStatus = jobsAPI.state.responseData.status

  while (jobStatus !== 'successful' && jobStatus !== 'failed' && jobStatus !== 'cancelled') {
    await jobsAPI.getJob(jobId)
    jobStatus = jobsAPI.state.responseData.status
    await sleep(500)
  }

  const exportId = jobsAPI.state.responseData.result.message

  return { jobStatus, exportId }
}

export { getExports, getDownloadExport, downloadExport, downloadPastExport, deleteExport }
