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
    let returnValue

    try {
      if (this.app) {
        const installAPI = new PostInstallAppAPI()
        const startInstanceAPI = new PostStartAppInstanceAPI()

        const installOK = await fetch(installAPI.installApp(this.app.app, this.app.version)).then(response => response.json)
        if (!installOK.ok) {
          returnValue = installOK
          throw Error('InstallApp(): Failed to install app')
        }

        const createOK = await fetch(this.createInstance(this.app.name + this.app.instances.length)).then(response => response.json)
        if (!createOK.ok) {
          returnValue = createOK
          throw Error('InstallApp(): Failed to create instance')
        }

        const startOK = await fetch(startInstanceAPI.startAppInstance(this.app.app, this.app.instances[length - 1])).then(response => response.json)
        if (!startOK) {
          returnValue = startOK
          throw Error('InstallApp(): Failed to start instance')
        } else {
          this.app.instances[length - 1].status = 'started'
          returnValue = true
        }
      }
    } catch (error) {
      console.error(error)
    }

    return returnValue
  }

  async uninstall () {
    let returnValue
    try {
      if (this.app) {
        const uninstallAPI = new PostUninstallAppAPI()
        const uninstallOK = await fetch(uninstallAPI.uninstallApp(this.app.app, this.app.version)).then(response => response.json)
        if (uninstallOK.ok) {
          returnValue = uninstallOK
        } else {
        // catch response of uninstall app was not OK
          returnValue = uninstallOK
          throw Error('failed to uninstalled app')
        }
      }
    } catch (error) {
      console.error(error)
    }
    return returnValue
  }

  async createInstance (instanceName) {
    let returnValue
    try {
      if (this.app) {
        const createInstanceAPI = new PostCreateAppInstanceAPI()
        const createOK = await fetch(createInstanceAPI.createAppInstance(this.app.app, this.app.version, instanceName)).then(response => response.json)
        if (createOK.ok) {
          this.app.instances.push(
            {
              instanceId: createInstanceAPI.state.responseData.instanceId,
              instanceName: instanceName,
              status: 'stopped'
            }
          )
          returnValue = createOK
        } else {
          returnValue = createOK
          throw Error('failed to create instance')
        }
      }
    } catch (error) {
      console.error(error)
    }
    return returnValue
  }

  async startInstance (instanceId) {
    let returnValue

    try {
      if (this.app) {
        const startInstanceAPI = new PostStartAppInstanceAPI()
        const startOK = await fetch(
          startInstanceAPI.startAppInstance(
            this.app.app,
            instanceId
          )
        ).then(response => response.json)
        if (startOK.ok) {
          this.app.instances.map(item =>
            item.instanceId === instanceId
              ? { ...item, status: 'started' }
              : item)

          returnValue = startOK
        } else {
        // catch response of start app instance was not OK
          returnValue = startOK
          throw Error('failed to start instance')
        }
      }
    } catch (error) {
      console.error(error)
    }
    return returnValue
  }

  async stopInstance (instanceId) {
    let returnValue

    try {
      if (this.app) {
        const stopInstanceAPI = new PostStopAppInstanceAPI()
        const stopOK = await fetch(
          stopInstanceAPI.stopAppInstance(
            this.app.app,
            instanceId
          )
        ).then(response => response.json)
        if (stopOK.ok) {
          this.app.instances.map(item =>
            item.instanceId === instanceId
              ? { ...item, status: 'stopped' }
              : item)

          returnValue = stopOK
        } else {
        // catch response of stop app instance was not OK
          returnValue = stopOK
          throw Error('failed to stop instance')
        }
      }
    } catch (error) {
      console.error(error)
    }
    return returnValue
  }

  async deleteInstance (instanceId) {
    let returnValue

    try {
      if (this.app) {
        const deleteInstanceAPI = new PostDeleteAppInstanceAPI()
        const deleteOK = await fetch(
          deleteInstanceAPI.deleteAppInstance(
            this.app.app,
            instanceId
          )
        ).then(response => response.json)
        if (deleteOK.ok) {
        // remove instance from array
          this.app.instances = this.app.instances.filter(instance => instance.instanceId === instanceId)

          returnValue = deleteOK
        } else {
        // catch response of delete instance was not OK
          returnValue = deleteOK
          throw Error('failed to delete instance')
        }
      }
    } catch (error) {
      console.error(error)
    }
    return returnValue
  }

  async sideloadApp (appYaml) {
    let returnValue

    try {
      const sideload = new PutSideloadAppAPI()
      const sideloadOK = await fetch(sideload.sideloadApp(appYaml)).then(response => response.json)

      if (sideloadOK.ok) {
        returnValue = sideloadOK
      } else {
        returnValue = sideloadOK
        throw Error('failed to sideload app')
      }
    } catch (error) {
      console.error(error)
    }

    return returnValue
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
