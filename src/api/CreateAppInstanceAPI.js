import BaseAPI from './BaseAPI'
import DeviceAPIConfiguration from './api-config'

export default class CreateAppInstanceAPI extends BaseAPI {
  async createAppInstance (appId, appVersion, instanceName) {
    // POST request using fetch with error handling
    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ appId, appVersion, instanceName })
    }

    try {
      const response = await fetch(this.callAPI(
        DeviceAPIConfiguration.POST_CREATE_APP_INSTANCE_URL,
        requestOptions
      )).then(response => response.json)
      if (response.ok) {
        return response.ok
      } else {
        throw Error('Failed to perform CreateAppInstanceAPI.createAppInstance()')
      }
    } catch (error) {
      console.log(error)
    }
    return false
  }
}
