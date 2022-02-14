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
import { DeviceAPIConfiguration } from './api-config'
import axios from 'axios'

async function postMPLogin (currentUser) {
  try {
    let url = ''
    const user = currentUser?.user?.data?.user_login
    const token = currentUser?.jwt?.token

    if (process.env.NODE_ENV === 'development') {
      url = process.env.REACT_APP_DEV_VM_IP
    }
    url = url + DeviceAPIConfiguration.DEVICE_ROUTE + DeviceAPIConfiguration.POST_MP_LOGIN_URL
    return axios
      .post(url, { user, token })
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
async function postMPLogout (currentUser) {
  try {
    if (currentUser) {
      let url = ''
      const user = currentUser?.user?.data?.user_login

      if (process.env.NODE_ENV === 'development') {
        url = process.env.REACT_APP_DEV_VM_IP
      }
      url = url + DeviceAPIConfiguration.DEVICE_ROUTE + DeviceAPIConfiguration.POST_MP_LOGOUT_URL
      return axios
        .post(url, { user })
        .then(response => {
          return response
        })
        .catch(error => {
          return Promise.reject(error)
        })
    } else { return Promise.resolve() }
  } catch (error) {
    return Promise.reject(error)
  }
}

export { postMPLogin, postMPLogout }
