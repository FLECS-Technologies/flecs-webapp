import BaseAPI from './BaseAPI'
import DeviceAPIConfiguration from './api-config'

export default class PostInstallAppAPI extends BaseAPI {
  async installApp (appId, appVersion) {
    // POST request using fetch with error handling
    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ appId, appVersion })
    }

    try {
      const response = await fetch(this.callAPI(DeviceAPIConfiguration.POST_INSTALL_APP_URL, requestOptions)).then(response => response.json)
      if (response.ok) {
        return response
      } else {
        throw Error('Failed to perform PostInstallAppAPI.installApp()')
      }
    } catch (error) {
      console.log(error)
    }
  }
}
