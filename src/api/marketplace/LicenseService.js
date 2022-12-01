/*
 * Copyright (c) 2022 FLECS Technologies GmbH
 *
 * Created on Wed Feb 16 2022
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
import { MarketplaceAPIConfiguration } from '../api-config'
import axios from 'axios'
import { jwt } from '../auth-header'

function getCurrentUserLicenses () {
  const data = new FormData()
  data.append('aam-jwt', jwt())
  return axios
    .post(MarketplaceAPIConfiguration.MP_PROXY_URL + MarketplaceAPIConfiguration.POST_GET_CURRENT_USER_LICENSES_URL, data)
    .then(response => {
      if (response?.data?.response?.licenses) {
        // filter only active licenses
        let activeLicenses = response.data.response.licenses.filter(e => e?.remaining_activations > 0)
        const today = new Date()
        activeLicenses = activeLicenses.filter(e => (e?.expiration_date === null || new Date(e?.expiration_date) > today))
        return activeLicenses
      }
    })
    .catch(error => {
      return Promise.reject(error)
    })
}

function setLicensedApp (license_key, appTitle) {
  const data = new FormData()
  data.append('aam-jwt', jwt())
  data.append('license_key', license_key)
  data.append('meta_key', 'Licensed App')
  data.append('meta_value', appTitle)
  // const meta_key = 'Licensed App'
  // const meta_value = appTitle
  return axios
    .post(MarketplaceAPIConfiguration.MP_PROXY_URL + MarketplaceAPIConfiguration.POST_SET_LICENSE_META_URL, data)
    .then(response => {
      if (response?.data?.response?.code === '970') {
        return response?.data?.response
      } else {
        return Promise.reject(new Error(response?.data?.response?.message))
      }
    })
    .catch(error => {
      return Promise.reject(error)
    })
}

export { getCurrentUserLicenses, setLicensedApp }
