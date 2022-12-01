/*
 * Copyright (c) 2022 FLECS Technologies GmbH
 *
 * Created on Tue May 03 2022
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
async function getInstanceConfig (instanceId) {
  return axios
    .post(DeviceAPIConfiguration.TARGET + DeviceAPIConfiguration.DEVICE_ROUTE + DeviceAPIConfiguration.POST_INSTANCE_CONFIG_URL, { instanceId })
    .then(response => {
      return response.data
    })
    .catch(error => {
      return Promise.reject(error)
    })
}

async function putInstanceConfig (instanceId, networkAdapters, devices) {
  return axios
    .put(DeviceAPIConfiguration.TARGET + DeviceAPIConfiguration.DEVICE_ROUTE + DeviceAPIConfiguration.PUT_INSTANCE_CONFIG_URL, { instanceId, networkAdapters, devices })
    .then(response => {
      return response.data
    })
    .catch(error => {
      return Promise.reject(error)
    })
}

export { getInstanceConfig, putInstanceConfig }
