/*
 * Copyright (c) 2022 FLECS Technologies GmbH
 *
 * Created on Mon Feb 14 2022
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
import { DeviceAPIConfiguration } from '../api-config'
import axios from 'axios'

async function postMPLogin (currentUser) {
  try {
    let url = ''

    if (process.env.REACT_APP_ENVIRONMENT === 'development') {
      url = process.env.REACT_APP_DEV_CORE_URL
    }
    url = url + DeviceAPIConfiguration.DEVICE_ROUTE + DeviceAPIConfiguration.CONSOLE_ROUTE + DeviceAPIConfiguration.PUT_CONSOLE_AUTH_URL
    return axios
      .put(url, currentUser)
      .then(response => {
        return response
      })
      .catch(error => {
        return Promise.reject(error)
      })
  } catch (error) {
    return Promise.reject(error)
  }
}
async function postMPLogout () {
  try {
    let url = ''

    if (process.env.REACT_APP_ENVIRONMENT === 'development') {
      url = process.env.REACT_APP_DEV_CORE_URL
    }
    url = url + DeviceAPIConfiguration.DEVICE_ROUTE + DeviceAPIConfiguration.CONSOLE_ROUTE + DeviceAPIConfiguration.DELETE_CONSOLE_AUTH_URL
    return axios
      .delete(url)
      .then(response => {
        return response
      })
      .catch(error => {
        return Promise.reject(error)
      })
  } catch (error) {
    return Promise.reject(error)
  }
}

export { postMPLogin, postMPLogout }
