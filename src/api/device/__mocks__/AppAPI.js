/*
 * Copyright (c) 2022 FLECS Technologies GmbH
 *
 * Created on Tue Feb 22 2022
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
import { sleep } from '../../../utils/sleep'

export default class AppAPI extends React.Component {
  constructor (props) {
    super(props)

    this.app = {
      appKey: {
        name: props.appKey.name,
        version: props.appKey.version
      },
      avatar: props.avatar,
      title: props.title,
      author: props.author,
      description: props.description,
      status: props.status,
      availability: props.availability,
      instances: props.instances,
      multiInstance: props.multiInstance
    }

    this._lastAPICallSuccessfull = false
    this.lastAPIError = null
    this.jobId = null
    this.jobStatus = null
  }

  setAppData (props) {
    if (props) {
      this.app = {
        appKey: {
          name: props.appKey.name,
          version: props.appKey.version
        },
        avatar: props.avatar,
        title: props.title,
        author: props.author,
        description: props.description,
        status: props.status,
        availability: props.availability,
        instances: props.instances,
        multiInstance: props.multiInstance
      }
    }
  }

  get lastAPICallSuccessfull () {
    return this._lastAPICallSuccessfull
  }

  set lastAPICallSuccessfull (value) {
    this._lastAPICallSuccessfull = value
  }

  // Installs an app from the marketplace and automatically creates and starts an instance of this app
  async installFromMarketplace (version, licenseKey, handleInstallationJob) {
    if (licenseKey === undefined) handleInstallationJob('failed')
    else {
      handleInstallationJob('running')
      await sleep(500)
      handleInstallationJob('successful')
    }
    this.lastAPICallSuccessfull = true
  }

  async uninstall () {
    this.lastAPICallSuccessfull = true
  }

  async createInstance (instanceName) {
    this.lastAPICallSuccessfull = true
  }

  async startInstance (instanceId) {
    this.lastAPICallSuccessfull = true
  }

  async stopInstance (instanceId) {
    this.lastAPICallSuccessfull = true
  }

  async deleteInstance (instanceId) {
    this.lastAPICallSuccessfull = true
  }

  async sideloadApp (appYaml, licenseKey, handleInstallationJob) {
    if (licenseKey === undefined) handleInstallationJob('failed')
    else {
      handleInstallationJob('running')
      await sleep(500)
      handleInstallationJob('successful')
    }
    this.lastAPICallSuccessfull = true
  }

  createInstanceName () {
    return 'new-instance'
  }

  static get propTypes () {
    return {
      appKey: PropTypes.object,
      avatar: PropTypes.string,
      title: PropTypes.string,
      author: PropTypes.string,
      description: PropTypes.string,
      status: PropTypes.string,
      availability: PropTypes.string,
      multiInstance: PropTypes.bool,
      instances: PropTypes.array
    }
  }
}
