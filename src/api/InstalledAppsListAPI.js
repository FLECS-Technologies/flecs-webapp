import BaseAPI from './BaseAPI'
import DeviceAPIConfiguration from './api-config'

export default class GetInstalledAppsListAPI extends BaseAPI {
  async getAppList () {
    // POST request using fetch with error handling
    const requestOptions = {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    }

    try {
      const response = await fetch(this.callAPI(DeviceAPIConfiguration.GET_INSTALLED_APP_LIST_URL, requestOptions)).then(response => response.json)
      if (response.ok) {
        return response
      } else {
        throw Error('Failed to perform GetInstalledAppsListAPI.getAppList()')
      }
    } catch (error) {
      console.log(error)
    }
    return false
  }
}
