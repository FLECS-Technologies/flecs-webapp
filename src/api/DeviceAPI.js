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
import PropTypes from 'prop-types'
import GetInstalledAppsListAPI from '../api/InstalledAppsListAPI'

export default class DeviceAPI extends React.Component {
  constructor (props) {
    super(props)
    this.appList = null
    this.lastAPICallSuccessfull = false
    this.lastAPIError = null
  }

  async getInstalledApps () {
    try {
      const getAppListAPI = new GetInstalledAppsListAPI()
      await getAppListAPI.getAppList()
      this.lastAPICallSuccessfull = getAppListAPI.state.success
      if (this.lastAPICallSuccessfull) {
        this.appList = await getAppListAPI.state.responseData.appList
      } else {
        if (getAppListAPI.state.errorMessage !== null) {
          this.lastAPIError = getAppListAPI.state.errorMessage
        }
      }
    } catch (error) {
      console.error(error)
      this.lastAPICallSuccessfull = false
      this.lastAPIError = error
    }
  }
}

DeviceAPI.propTypes = {
  appList: PropTypes.array
}
