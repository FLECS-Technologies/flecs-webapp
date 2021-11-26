import BaseAPI from './BaseAPI'
import DeviceAPIConfiguration from './api-config'

export default class StartAppInstanceAPI extends BaseAPI {
  async startAppInstance (appId, instanceId) {
    // POST request using fetch with error handling
    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ appId, instanceId })
    }

    try {
      const response = await fetch(this.callAPI(DeviceAPIConfiguration.POST_START_INSTANCE_URL, requestOptions)).then(response => response.json)
      if (response.ok) {
        return response
      } else {
        throw Error('Failed to perform StartAppInstanceAPI.startAppInstance()')
      }
    } catch (error) {
      console.log(error)
    }
    return false
  }
}
