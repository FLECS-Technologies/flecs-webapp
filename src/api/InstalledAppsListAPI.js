import BaseAPI from './BaseAPI'
import DeviceAPIConfiguration from './api-config'

export default class GetInstalledAppsListAPI extends BaseAPI {
  getAppList () {
    // POST request using fetch with error handling
    const requestOptions = {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    }

    const response = this.callAPI(DeviceAPIConfiguration.GET_INSTALLED_APP_LIST_URL, requestOptions)

    return response
  }
}
