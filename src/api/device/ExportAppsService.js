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

async function postExportApps (apps, instances) {
  return axios
    .post(DeviceAPIConfiguration.TARGET + DeviceAPIConfiguration.DEVICE_V2_ROUTE + DeviceAPIConfiguration.POST_APP_EXPORT_URL, { apps, instances })
    .then(response => {
      return response.data
    })
    .catch(error => {
      return Promise.reject(error)
    })
}

async function getExports () {
  return axios
    .get(DeviceAPIConfiguration.TARGET + DeviceAPIConfiguration.DEVICE_V2_ROUTE + DeviceAPIConfiguration.GET_EXPORTS_URL)
    .then(response => {
      return response.data
    })
    .catch(error => {
      return Promise.reject(error)
    })
}

async function getDownloadExport (exportFile) {
  return axios
    .get(DeviceAPIConfiguration.TARGET + DeviceAPIConfiguration.DEVICE_V2_ROUTE + DeviceAPIConfiguration.GET_DOWNLOAD_URL(exportFile), { responseType: 'blob' })
    .then(response => {
      return response.data
    })
    .catch(error => {
      return Promise.reject(error)
    })
}

async function downloadLatestExport (apps, instances) {
  // 1. export apps & instances
  return postExportApps(apps, instances)

  // 2. get all exports
    .then(response => {
      return getExports()
    })
  // 3. download latest export
    .then(response => {
    // 3.1 get export list from response
      const lastExport = response?.exports?.shift()
      // 3.2 call download endpoint with the latest export file
      return getDownloadExport(lastExport)
    })
    .catch(error => {
      return Promise.reject(error)
    })
}

export { postExportApps, getExports, getDownloadExport, downloadLatestExport }
