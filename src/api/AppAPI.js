import React from 'react'
import PropTypes from 'prop-types'
import PostInstallAppAPI from '../api/InstallAppAPI'
import PostCreateAppInstanceAPI from '../api/CreateAppInstanceAPI'
import PostStartAppInstanceAPI from '../api/StartAppInstanceAPI'
import PostStopAppInstanceAPI from '../api/StopAppInstanceAPI'
import PostUninstallAppAPI from '../api/UninstallAppAPI'
import PostDeleteAppInstanceAPI from '../api/DeleteAppInstanceAPI'

export default class AppAPI extends React.Component {
  constructor (props) {
    super(props)

    this.app = {
      appId: props.appId,
      avatar: props.avatar,
      title: props.title,
      vendor: props.vendor,
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
        appId: props.appId,
        avatar: props.avatar,
        title: props.title,
        vendor: props.vendor,
        version: props.version,
        description: props.description,
        status: props.status,
        availability: props.availability,
        instances: props.instances
      }
    }
  }

  // Installs an app from the marketplace and automatically creates and starts an instance of this app
  installFromMarketplace () {
    let returnValue = false

    if (this.app) {
      const installAPI = new PostInstallAppAPI()
      const startInstanceAPI = new PostStartAppInstanceAPI()

      if (installAPI.installApp(this.app.appId, this.app.version)) {
        if (this.createInstance(this.app.title + this.app.instances.length)) {
          if (
            startInstanceAPI.startAppInstance(
              this.app.appId,
              this.app.instances[length - 1]
            )
          ) {
            this.app.instances[length - 1].status = 'started'
            returnValue = true
          } else {
            // catch response of start app instance was not OK
          }
        } else {
          // catch response of create app inscance was not OK
        }
      } else {
        // catch response of install app api was not OK
      }

      return returnValue
    }
  }

  uninstall () {
    let returnValue = false
    if (this.app) {
      const uninstallAPI = new PostUninstallAppAPI()
      if (uninstallAPI.uninstallApp(this.app.appId, this.app.version)) {
        returnValue = true
      } else {
        // catch response of uninstall app was not OK
      }
    }
    return returnValue
  }

  createInstance (instanceName) {
    let returnValue = false
    if (this.app) {
      const createInstanceAPI = new PostCreateAppInstanceAPI()
      if (createInstanceAPI.createAppInstance(this.app.appId, this.app.version, instanceName)) {
        this.app.instances.push(
          {
            instanceId: createInstanceAPI.state.responseData.instanceId,
            instanceName: instanceName,
            status: 'stopped'
          }
        )
        returnValue = true
      }
    }
    return returnValue
  }

  startInstance (instanceId) {
    let returnValue = false

    if (this.app) {
      const startInstanceAPI = new PostStartAppInstanceAPI()
      if (
        startInstanceAPI.startAppInstance(
          this.app.appId,
          instanceId
        )
      ) {
        this.app.instances.map(item =>
          item.instanceId === instanceId
            ? { ...item, status: 'started' }
            : item)

        returnValue = true
      } else {
        // catch response of start app instance was not OK
      }
    }

    return returnValue
  }

  stopInstance (instanceId) {
    let returnValue = false

    if (this.app) {
      const stopInstanceAPI = new PostStopAppInstanceAPI()
      if (
        stopInstanceAPI.stopAppInstance(
          this.app.appId,
          instanceId
        )
      ) {
        this.app.instances.map(item =>
          item.instanceId === instanceId
            ? { ...item, status: 'stopped' }
            : item)

        returnValue = true
      } else {
        // catch response of start app instance was not OK
      }
    }

    return returnValue
  }

  deleteInstance (instanceId) {
    let returnValue = false

    if (this.app) {
      const deleteInstanceAPI = new PostDeleteAppInstanceAPI()
      if (
        deleteInstanceAPI.deleteAppInstance(
          this.app.appId,
          instanceId
        )
      ) {
        // remove instance from array
        this.app.instances = this.app.instances.filter(instance => instance.instanceId === instanceId)

        returnValue = true
      } else {
        // catch response of start app instance was not OK
      }
    }

    return returnValue
  }

  static get propTypes () {
    return {
      appId: PropTypes.string,
      avatar: PropTypes.string,
      title: PropTypes.string,
      vendor: PropTypes.string,
      version: PropTypes.string,
      description: PropTypes.string,
      status: PropTypes.string,
      availability: PropTypes.string,
      instances: PropTypes.array
    }
  }
}
