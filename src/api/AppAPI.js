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
import PostInstallAppAPI from '../api/InstallAppAPI'
import PostCreateAppInstanceAPI from '../api/CreateAppInstanceAPI'
import PostStartAppInstanceAPI from '../api/StartAppInstanceAPI'
import PostStopAppInstanceAPI from '../api/StopAppInstanceAPI'
import PostUninstallAppAPI from '../api/UninstallAppAPI'
import PostDeleteAppInstanceAPI from '../api/DeleteAppInstanceAPI'
import PutSideloadAppAPI from '../api/SideloadAppAPI'

export default class AppAPI extends React.Component {
  constructor (props) {
    super(props)

    this.app = {
      app: props.app,
      avatar: props.avatar,
      name: props.name,
      author: props.author,
      version: props.version,
      description: props.description,
      status: props.status,
      availability: props.availability,
      instances: props.instances
    }

    this.lastAPICallSuccessfull = false
    this.lastAPIError = null
  }

  setAppData (props) {
    if (props) {
      this.app = {
        app: props.app,
        avatar: props.avatar,
        name: props.name,
        author: props.author,
        version: props.version,
        description: props.description,
        status: props.status,
        availability: props.availability,
        instances: props.instances
      }
    }
  }

  // Installs an app from the marketplace and automatically creates and starts an instance of this app
  async installFromMarketplace () {
    try {
      if (this.app) {
        const installAPI = new PostInstallAppAPI()
        const startInstanceAPI = new PostStartAppInstanceAPI()

        await installAPI.installApp(this.app.app, this.app.version)
        if (installAPI.state.success) {
          this.app.status = 'installed'
        } else {
          this.lastAPICallSuccessfull = false
          throw Error('failed to install app.')
        }

        await this.createInstance(this.createInstanceName())
        if (!this.lastAPICallSuccessfull) {
          throw Error('failed to create instance after installing the app.')
        }

        await startInstanceAPI.startAppInstance(this.app.app, this.app.version, this.app.instances[this.app.instances.length - 1].instanceId)
        if (this.lastAPICallSuccessfull) {
          this.app.instances[this.app.instances.length - 1].status = 'running'
          // pop this instance, because it'll be automatically reloaded from the device. Leaving it in the list leads to double entries in the instance list
          this.app.instances.pop()
        } else {
          throw Error('failed to start instance after installing the app.')
        }
      }
    } catch (error) {
      console.error(error)
    }
  }

  async uninstall () {
    try {
      if (this.app) {
        const uninstallAPI = new PostUninstallAppAPI()
        await uninstallAPI.uninstallApp(this.app.app, this.app.version)
        this.lastAPICallSuccessfull = uninstallAPI.state.success
        if (this.lastAPICallSuccessfull) {
          this.app.status = 'uninstalled'
        } else {
          this.lastAPIError = uninstallAPI.state.errorMessage
        }
      }
    } catch (error) {
      console.error(error)
      this.lastAPICallSuccessfull = false
      this.lastAPIError = error
    }
  }

  async createInstance (instanceName) {
    try {
      if (this.app) {
        const createInstanceAPI = new PostCreateAppInstanceAPI()
        await createInstanceAPI.createAppInstance(this.app.app, this.app.version, instanceName)
        if (createInstanceAPI.state.success) {
          if (this.app.instances == null) {
            this.app.instances = []
          }
          this.app.instances.push(
            {
              instanceId: createInstanceAPI.state.responseData.instanceId,
              instanceName: instanceName,
              status: 'stopped',
              version: this.app.version
            }
          )
          this.lastAPICallSuccessfull = true
        } else {
          throw Error('failed to create instance')
        }
      }
    } catch (error) {
      console.error(error)
      this.lastAPICallSuccessfull = false
    }
  }

  async startInstance (version, instanceId) {
    try {
      if (this.app) {
        const startInstanceAPI = new PostStartAppInstanceAPI()
        await startInstanceAPI.startAppInstance(this.app.app, version, instanceId)

        if (startInstanceAPI.state.success) {
          this.app.instances = this.app.instances.map(item =>
            item.instanceId === instanceId
              ? { ...item, status: 'running' }
              : item)

          this.lastAPICallSuccessfull = true
        } else {
        // catch response of start app instance was not OK
          throw Error('failed to start instance')
        }
      }
    } catch (error) {
      console.error(error)
      this.lastAPICallSuccessfull = false
    }
  }

  async stopInstance (version, instanceId) {
    try {
      if (this.app) {
        const stopInstanceAPI = new PostStopAppInstanceAPI()
        await stopInstanceAPI.stopAppInstance(this.app.app, version, instanceId)

        if (stopInstanceAPI.state.success) {
          this.app.instances = this.app.instances.map(item =>
            item.instanceId === instanceId
              ? { ...item, status: 'stopped' }
              : item)

          this.lastAPICallSuccessfull = true
        } else {
        // catch response of stop app instance was not OK
          throw Error('failed to stop instance')
        }
      }
    } catch (error) {
      console.error(error)
      this.lastAPICallSuccessfull = false
    }
  }

  async deleteInstance (version, instanceId) {
    try {
      if (this.app) {
        const deleteInstanceAPI = new PostDeleteAppInstanceAPI()
        await deleteInstanceAPI.deleteAppInstance(this.app.app, version, instanceId)
        if (deleteInstanceAPI.state.success) {
          // remove instance from array
          this.app.instances = this.app.instances.filter(instance => instance.instanceId !== instanceId)

          this.lastAPICallSuccessfull = true
        } else {
        // catch response of delete instance was not OK
          throw Error('failed to delete instance')
        }
      }
    } catch (error) {
      console.error(error)
      this.lastAPICallSuccessfull = false
    }
  }

  async sideloadApp (appYaml) {
    try {
      // sideload app - this request takes the .yml file and tries to install the app
      const sideload = new PutSideloadAppAPI()
      await sideload.sideloadApp(appYaml)
      if (sideload.state.success) {
        this.app.status = 'installed'
      } else {
        this.lastAPICallSuccessfull = false
        throw Error('failed to install app.')
      }

      // create new instance
      await this.createInstance(this.createInstanceName())
      if (!this.lastAPICallSuccessfull) {
        throw Error('failed to create instance after installing the app.')
      }

      // start new instance
      await this.startInstance(this.app.version, this.app.instances[this.app.instances.length - 1].instanceId)
      if (this.lastAPICallSuccessfull) {
        this.app.instances[this.app.instances.length - 1].status = 'running'
      } else {
        throw Error('failed to start instance after installing the app.')
      }
    } catch (error) {
      console.error(error)
    }
  }

  createInstanceName () {
    let i = 0
    if (this.app.instances) {
      let tmpName = this.app.name + i
      let tmpList = this.app.instances.filter(instance => instance.instanceName === tmpName)
      while ((tmpList.length > 0) && (i < this.app.instances.length)) {
        i++
        tmpName = this.app.name + i
        tmpList = this.app.instances.filter(instance => instance.instanceName === tmpName)
      }
      return tmpName
    } else { return this.app.name + i }
  }

  static get propTypes () {
    return {
      app: PropTypes.string,
      avatar: PropTypes.string,
      name: PropTypes.string,
      author: PropTypes.string,
      version: PropTypes.string,
      description: PropTypes.string,
      status: PropTypes.string,
      availability: PropTypes.string,
      instances: PropTypes.array
    }
  }
}
