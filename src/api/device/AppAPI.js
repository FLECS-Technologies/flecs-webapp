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
import PostInstallAppAPI from './InstallAppAPI'
import PostCreateAppInstanceAPI from './CreateAppInstanceAPI'
import PostStartAppInstanceAPI from './StartAppInstanceAPI'
import PostStopAppInstanceAPI from './StopAppInstanceAPI'
import DeleteUninstallAppAPI from './UninstallAppAPI'
import DeleteDeleteAppInstanceAPI from './DeleteAppInstanceAPI'
import PostSideloadAppAPI from './SideloadAppAPI'
import DeviceAPI from './DeviceAPI'
import { getAppInstances } from '../../data/AppList' // is this the best approach?
import GetJobsAPI from './JobsAPI'
import { sleep } from '../../utils/sleep'

export default class AppAPI extends React.Component {
  constructor (props) {
    super(props)

    this.app = {
      app: props.app,
      avatar: props.avatar,
      title: props.title,
      author: props.author,
      version: props.version,
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
    this.instances = []
  }

  setAppData (props) {
    if (props) {
      this.app = {
        app: props.appKey.name,
        avatar: props.avatar,
        title: props.title,
        author: props.author,
        version: props.appKey.version,
        description: props.description,
        status: props.status,
        availability: props.availability,
        instances: props.instances,
        multiInstance: props.multiInstance
      }
    }
  }

  setVersion (version) {
    this.app.version = version
  }

  get lastAPICallSuccessfull () {
    return this._lastAPICallSuccessfull
  }

  set lastAPICallSuccessfull (value) {
    this._lastAPICallSuccessfull = value
  }

  // Installs an app from the marketplace and automatically creates and starts an instance of this app
  async installFromMarketplace (version, licenseKey, handleInstallationJob) {
    try {
      if (this.app) {
        await this.installApp(version, licenseKey, handleInstallationJob)
        if (this.jobStatus === 'successful') { // app has been installed
          await this.createInstance(this.createInstanceName())
          if (this.jobStatus === 'successful') { // instance has been created
            await this.fetchInstances()
            await this.startInstance(this.instances[this.instances.length - 1].instanceId)
          }
        }
      }
    } catch (error) {
      console.error(error)
    }
  }

  async uninstall () {
    try {
      if (this.app) {
        const uninstallAPI = new DeleteUninstallAppAPI()
        await uninstallAPI.uninstallApp(this.app.app, this.app.version)
        this.jobId = uninstallAPI.state.responseData.jobId
        await this.waitUntilJobIsComplete(this.jobId)

        if (this.jobStatus === 'successful') {
          this.lastAPICallSuccessfull = true
          this.app.status = 'uninstalled'
        } else {
          if (uninstallAPI.state.errorMessage !== null) {
            this.lastAPIError = uninstallAPI.state.errorMessage
          }
        }
      }
    } catch (error) {
      console.error(error)
      this.lastAPICallSuccessfull = false
      this.lastAPIError = error
    }
  }

  async fetchInstances () {
    try {
      const deviceAPI = new DeviceAPI()
      await deviceAPI.getInstances()
      if (deviceAPI.lastAPICallSuccessfull) {
        this.instances = await getAppInstances(this.app, deviceAPI.instances)
      }
    } catch (error) {
      console.error(error)
    }
  }

  async waitUntilJobIsComplete (jobId, handleInstallationJob) {
    const getJobsAPI = new GetJobsAPI()
    await getJobsAPI.getJob(jobId)
    this.jobStatus = getJobsAPI.state.responseData[0].status
    if (handleInstallationJob) {
      handleInstallationJob(this.jobStatus)
    }

    while (this.jobStatus !== 'successful' && this.jobStatus !== 'failed' && this.jobStatus !== 'cancelled') {
      await getJobsAPI.getJob(jobId)
      this.jobStatus = getJobsAPI.state.responseData[0].status
      if (handleInstallationJob) {
        handleInstallationJob(this.jobStatus)
      }
      await sleep(500)
    }
  }

  async installApp (version, licenseKey, handleInstallationJob) {
    try {
      if (this.app) {
        const installAPI = new PostInstallAppAPI()
        await installAPI.installApp(this.app.app, (version || this.app.version), licenseKey)
        this.jobId = installAPI.state.responseData.jobId
        await this.waitUntilJobIsComplete(this.jobId, handleInstallationJob)

        if (this.jobStatus === 'successful') {
          this.app.status = 'installed'
          this.app.version = version || this.app.version
        } else {
          this.lastAPICallSuccessfull = false
          if (installAPI.state.errorMessage !== null) {
            this.lastAPIError = installAPI.state.errorMessage.message
          }
          throw Error('failed to install app.')
        }
      }
    } catch (error) {
      console.error(error)
    }
  }

  async createInstance (instanceName) {
    try {
      if (this.app) {
        const createInstanceAPI = new PostCreateAppInstanceAPI()
        await createInstanceAPI.createAppInstance(this.app.app, this.app.version, instanceName)
        this.jobId = createInstanceAPI.state.responseData.jobId
        await this.waitUntilJobIsComplete(this.jobId)

        if (this.jobStatus === 'successful') {
          this.lastAPICallSuccessfull = true
        } else {
          this.lastAPICallSuccessfull = false
          if (createInstanceAPI.state.errorMessage !== null) {
            this.lastAPIError = createInstanceAPI.state.errorMessage.message
          }
          throw Error('failed to create instance')
        }
      }
    } catch (error) {
      console.error(error)
      this.lastAPICallSuccessfull = false
      throw Error('failed to create instance after installing the app.')
    }
  }

  async startInstance (instanceId) {
    try {
      if (this.app) {
        const startInstanceAPI = new PostStartAppInstanceAPI()
        await startInstanceAPI.startAppInstance(instanceId)
        this.jobId = startInstanceAPI.state.responseData.jobId
        await this.waitUntilJobIsComplete(this.jobId)

        if (this.jobStatus === 'successful') {
          this.lastAPICallSuccessfull = true
        } else {
        // catch response of start app instance was not OK
          this.lastAPICallSuccessfull = false
          if (startInstanceAPI.state.errorMessage !== null) {
            this.lastAPIError = startInstanceAPI.state.errorMessage.message
          }
          throw Error('failed to start instance')
        }
      }
    } catch (error) {
      console.error(error)
      this.lastAPICallSuccessfull = false
      throw Error('failed to start instance after installing the app.')
    }
  }

  async stopInstance (instanceId) {
    try {
      if (this.app) {
        const stopInstanceAPI = new PostStopAppInstanceAPI()
        await stopInstanceAPI.stopAppInstance(instanceId)
        this.jobId = stopInstanceAPI.state.responseData.jobId
        await this.waitUntilJobIsComplete(this.jobId)

        if (this.jobStatus === 'successful') {
          this.lastAPICallSuccessfull = true
        } else {
        // catch response of stop app instance was not OK
          this.lastAPICallSuccessfull = false
          if (stopInstanceAPI.state.errorMessage !== null) {
            this.lastAPIError = stopInstanceAPI.state.errorMessage.message
          }
          throw Error('failed to stop instance')
        }
      }
    } catch (error) {
      console.error(error)
      this.lastAPICallSuccessfull = false
    }
  }

  async deleteInstance (instanceId) {
    try {
      if (this.app) {
        const deleteInstanceAPI = new DeleteDeleteAppInstanceAPI()
        await deleteInstanceAPI.deleteAppInstance(instanceId)
        this.jobId = deleteInstanceAPI.state.responseData.jobId
        await this.waitUntilJobIsComplete(this.jobId)

        if (this.jobStatus === 'successful') {
          this.lastAPICallSuccessfull = true
        } else {
        // catch response of delete instance was not OK
          this.lastAPICallSuccessfull = false
          if (deleteInstanceAPI.state.errorMessage !== null) {
            this.lastAPIError = deleteInstanceAPI.state.errorMessage.message
          }
          throw Error('failed to delete instance')
        }
      }
    } catch (error) {
      console.error(error)
      this.lastAPICallSuccessfull = false
    }
  }

  async sideloadApp (appYaml, licenseKey, handleInstallationJob) {
    try {
      if (appYaml && licenseKey) {
        // sideload app - this request takes the .yml file and tries to install the app
        const sideload = new PostSideloadAppAPI()
        await sideload.sideloadApp(appYaml, licenseKey)
        this.jobId = sideload.state.responseData.jobId
        await this.waitUntilJobIsComplete(this.jobId, handleInstallationJob)

        if (this.jobStatus === 'successful') { // app has been installed
          await this.createInstance(this.createInstanceName())
          if (this.jobStatus === 'successful') { // instance has been created
            await this.fetchInstances()
            await this.startInstance(this.instances[this.instances.length - 1].instanceId)
          }
        }
      }
    } catch (error) {
      console.error(error)
    }
  }

  createInstanceName () {
    let i = 0
    if (this.app.instances) {
      let tmpName = this.app.title + i
      let tmpList = this.app.instances.filter(instance => instance.instanceName === tmpName)
      while ((tmpList.length > 0) && (i < this.app.instances.length)) {
        i++
        tmpName = this.app.title + i
        tmpList = this.app.instances.filter(instance => instance.instanceName === tmpName)
      }
      return tmpName
    } else { return this.app.title + i }
  }

  static get propTypes () {
    return {
      app: PropTypes.string,
      appKey: PropTypes.object,
      avatar: PropTypes.string,
      title: PropTypes.string,
      author: PropTypes.string,
      version: PropTypes.string,
      description: PropTypes.string,
      status: PropTypes.string,
      availability: PropTypes.string,
      multiInstance: PropTypes.bool,
      instances: PropTypes.array
    }
  }
}
