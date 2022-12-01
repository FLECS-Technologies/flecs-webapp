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

export default class DeviceAPI extends React.Component {
  constructor (props) {
    super(props)
    this.appList = null
    this.lastAPICallSuccessfull = false
    this.lastAPIError = null
    this.serviceMeshData = null
  }

  async getInstalledApps () {
    this.lastAPICallSuccessfull = true
    this.appList = [1, 2, 3]
  }

  async browseServiceMesh () {
    this.lastAPICallSuccessfull = true
    this.serviceMeshData = [1, 2, 3]
  }
}

DeviceAPI.propTypes = {
  appList: PropTypes.array
}
