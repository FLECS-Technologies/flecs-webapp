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
    this.lastAPICallSuccessful = false
    this.lastAPIError = null
    this.serviceMeshData = null
    this.instances = null
  }

  async getInstances () {
    this.lastAPICallSuccessful = true
    this.instances = [{ instanceId: '4f75d3b9', instanceName: 'AnyViz Cloud Adapter0', appKey: { name: 'io.anyviz.cloudadapter', version: '0.9.5.1' }, status: 'stopped', desired: 'stopped' }, { instanceId: '409f3f70', instanceName: 'edgeConnector Modbus0', appKey: { name: 'com.softingindustrial.edgeconnector-modbus', version: 'v2-35-1' }, status: 'running', desired: 'running' }]
  }

  async getInstalledApps () {
    this.lastAPICallSuccessful = true
    this.appList = [{
      appKey: {
        name: 1,
        version: '1'
      }
    }, {
      appKey: {
        name: 2,
        version: '2'
      }
    }, {
      appKey: {
        name: 3,
        version: '3'
      }
    }]
  }

  async browseServiceMesh () {
    this.lastAPICallSuccessful = true
    this.serviceMeshData = [1, 2, 3]
  }
}

DeviceAPI.propTypes = {
  appList: PropTypes.array
}
