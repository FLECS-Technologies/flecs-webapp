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

// async function postExportApps (apps, instances) {
//   console.log('entering ExportAppsService.js/postExportApps')
//   console.log({ apps, instances })
//   return axios
//     .post(DeviceAPIConfiguration.DEVICE_ROUTE + DeviceAPIConfiguration.POST_APP_EXPORT_URL, { apps, instances })
//     .then(response => {
//       return response.data
//     })
//     .catch(error => {
//       return Promise.reject(error)
//     })
// }

async function getExports () {
  return axios
    // .get(DeviceAPIConfiguration.DEVICE_ROUTE + DeviceAPIConfiguration.GET_EXPORTS_URL)
    .get('http://localhost/api/v2/exports')
    .then(response => {
      return response.data
    })
    .catch(error => {
      return Promise.reject(error)
    })
}

async function getDownloadExport (exportFile) {
  return axios
    // .get(DeviceAPIConfiguration.DEVICE_ROUTE + DeviceAPIConfiguration.GET_DOWNLOAD_URL(exportFile), { responseType: 'blob' })
    .get(`http://localhost/api/v2/exports/${exportFile}`, { responseType: 'blob' })
    .then(response => {
      return response.data
    })
    .catch(error => {
      return Promise.reject(error)
    })
}

async function downloadLatestExport (apps, instances) {
  // 1. export apps & instances
  // return postExportApps(apps, instances)

  // alternative with fetch instead of axios
  const exportAPI = new ExportApps()
  return exportAPI.postExportApps(apps, instances)

  // 2. get all exports
    .then(response => {
      return getExports()
    })
  // 3. download latest export
    .then(response => {
    // 3.1 get export list from response
      const lastExport = response?.shift()
      // 3.2 call download endpoint with the latest export file
      return getDownloadExport(lastExport)
    })
    .catch(error => {
      return Promise.reject(error)
    })
}

class ExportApps extends BaseAPI {
  async postExportApps (apps, instances) {
    // POST request using fetch with error handling
    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ apps, instances })
    }

    try {
      await this.callAPI(DeviceAPIConfiguration.POST_APP_EXPORT_URL, requestOptions)
    } catch (error) { }
  }
}

export { /* postExportApps, */getExports, getDownloadExport, downloadLatestExport }
