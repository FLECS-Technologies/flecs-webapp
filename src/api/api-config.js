import { Component } from 'react'

const GET_DEVICE_INFO_URL = 'http://localhost:80/GetDeviceInfo'
const GET_INSTALLED_APP_LIST_URL = 'http://localhost:80/InstalledAppList'
const GET_INSTANTIATED_APP_LIST_URL = 'http://localhost:80/InstantiatedApps'

const POST_INSTALL_APP_URL = 'http://localhost:80/InstallApp'
const POST_UNINSTALL_APP_URL = 'http://localhost:80/UninstallApp'
const POST_START_INSTANCE_URL = 'http://localhost:80/StartInstance'
const POST_STOP_INSTANCE_URL = 'http://localhost:80/StopInstance'
const POST_CREATE_APP_INSTANCE_URL = 'http://localhost:80/CreateAppInstance'
const POST_DELETE_APP_INSTANCE_URL = 'http://localhost:80/DeleteAppInstance'

const PUT_SIDELOAD_APP = 'http://localhost:80/SideloadApp'

const GET_APP_LIST_URL = 'http://marketplace.flecs.tech/AppList'

export default class DeviceAPIConfiguration extends Component {
  // post requests
  static get POST_INSTALL_APP_URL () {
    return POST_INSTALL_APP_URL
  }

  static get POST_UNINSTALL_APP_URL () {
    return POST_UNINSTALL_APP_URL
  }

  static get POST_START_INSTANCE_URL () {
    return POST_START_INSTANCE_URL
  }

  static get POST_STOP_INSTANCE_URL () {
    return POST_STOP_INSTANCE_URL
  }

  static get POST_CREATE_APP_INSTANCE_URL () {
    return POST_CREATE_APP_INSTANCE_URL
  }

  static get POST_DELETE_APP_INSTANCE_URL () {
    return POST_DELETE_APP_INSTANCE_URL
  }

  // get requests
  static get GET_DEVICE_INFO_URL () {
    return GET_DEVICE_INFO_URL
  }

  static get GET_INSTALLED_APP_LIST_URL () {
    return GET_INSTALLED_APP_LIST_URL
  }

  static get GET_INSTANTIATED_APP_LIST_URL () {
    return GET_INSTANTIATED_APP_LIST_URL
  }

  // put requests
  static get PUT_SIDELOAD_APP () {
    return PUT_SIDELOAD_APP
  }
}

export class MarketplaceAPIConfiguration {
  // get requests
  static get GET_APP_LIST_URL () {
    return GET_APP_LIST_URL
  }
  // post requests
}
