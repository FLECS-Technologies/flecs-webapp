/*
 * Copyright (c) 2022 FLECS Technologies GmbH
 *
 * Created on Thu Jan 13 2022
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
import { MarketplaceAPIConfiguration } from '../api-config'
import { postMPLogout } from '../device/DeviceAuthAPI'

class AuthService {
  login (username, password) {
    const issueJWT = true
    const url = MarketplaceAPIConfiguration.MP_PROXY_URL + MarketplaceAPIConfiguration.POST_AUTHENTICATE_URL
    return axios
      .post(url, {
        username,
        password,
        issueJWT
      })
      .then(response => {
        if (response.data?.jwt?.token) {
          localStorage.setItem('user', JSON.stringify(response.data))
        }

        return response.data
      })
      .catch(error => {
        return Promise.reject(error)
      })
  }

  validate (jwt) {
    const url = MarketplaceAPIConfiguration.MP_PROXY_URL + MarketplaceAPIConfiguration.POST_VALIDATE_URL
    return axios
      .post(url, {
        jwt
      })
      .then(response => {
        if (response.data?.isValid) {
          return response.data
        }
      })
      .catch(error => {
        this.logout()
        return Promise.reject(error)
      })
  }

  logout () {
    postMPLogout(this.getCurrentUser())
      .then(
        () => { /* successfully logged out from the device */ },
        error => { console.log(error.message) }
      )
      .finally(() => {
        localStorage.removeItem('user')
      })
  }

  getCurrentUser () {
    return JSON.parse(localStorage.getItem('user'))
  }
}

export default new AuthService()
