/*
 * Copyright (c) 2022 FLECS Technologies GmbH
 *
 * Created on Wed Jun 01 2022
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
import { DeviceAPIConfiguration, MarketplaceAPIConfiguration } from './api-config'

async function getVersion () {
  return axios
    .get(DeviceAPIConfiguration.TARGET + DeviceAPIConfiguration.GET_VERSION_URL)
    .then(response => {
      return response.data
    })
    .catch(error => {
      return Promise.reject(error)
    })
}

async function getLatestVersion () {
  return axios
    .get(MarketplaceAPIConfiguration.MP_PROXY_URL + MarketplaceAPIConfiguration.GET_LATEST_VERSION_URL)
    .then(response => {
      return response.data
    })
    .catch(error => {
      return Promise.reject(error)
    })
}

function isLaterThan (version1, version2) {
  if (version1 && version2) {
    const v1 = version1.split('-')
    const v2 = version2.split('-')
    if (v1[0] > v2[0]) {
      return true
    } else {
      return false
    }
  } else {
    return false
  }
}
export { getVersion, getLatestVersion, isLaterThan }
