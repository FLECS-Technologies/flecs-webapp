/*
 * Copyright (c) 2021 FLECS Technologies GmbH
 *
 * Created on Tue Nov 30 2021
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

import React from 'react'
import { DeviceAPIConfiguration } from './api-config'

export default class BaseAPI extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      responseData: null,
      success: false,
      errorMessage: null
    }
  }

  async callAPI (apiURL, requestOptions) {
    try {
      let url
      let data
      if (process.env.NODE_ENV === 'development') {
        url = process.env.REACT_APP_DEV_VM_IP + DeviceAPIConfiguration.DEVICE_ROUTE + apiURL
      } else {
        url = DeviceAPIConfiguration.DEVICE_ROUTE + apiURL
      }
      const response = await fetch(url, requestOptions)

      // try to read data. This might fail e.g. for 404, because .json() can't parse the html in the response body
      try {
        data = await response.json()
      } catch (error) {

      }

      if (response.ok && response.status === 200) {
        this.state.responseData = data
        this.state.success = true
      } else {
        const error = 'HTTP status: ' + response.status + ' additional info: ' + (data && data.additionalInfo)
        throw Error(error)
      }
    } catch (error) {
      this.state.success = false
      this.state.errorMessage = error
    }
  }
}
