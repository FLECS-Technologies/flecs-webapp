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
import { MarketplaceAPIConfiguration } from './api-config'
import axios from 'axios'
import { jwt } from './auth-header'

function getCurrentUserLicenses () {
  let url
  if (process.env.NODE_ENV === 'development') {
    url = process.env.REACT_APP_DEV_LOCAL_MP_URL
  } else {
    url = MarketplaceAPIConfiguration.BASE_URL
  }
  const data = new FormData()
  data.append('aam-jwt', jwt())
  return axios
    .post(url + MarketplaceAPIConfiguration.POST_GET_CURRENT_USER_LICENSES_URL, data)
    .then(response => {
      if (response?.data?.response?.licenses) {
        return response.data.response.licenses
      }
    })
    .catch(error => {
      return Promise.reject(error)
    })
}

export { getCurrentUserLicenses }
