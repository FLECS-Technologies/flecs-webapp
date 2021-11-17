import BaseAPI from './BaseAPI'
import DeviceAPIConfiguration from './api-config'

export default class StartAppInstanceAPI extends BaseAPI {
  startAppInstance (appId, instanceId) {
    // POST request using fetch with error handling
    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ appId, instanceId })
    }

    const apiURL = new DeviceAPIConfiguration()

    const response = this.callAPI(apiURL.POST_START_INSTANCE_URL, requestOptions)

    return response
  }
}
