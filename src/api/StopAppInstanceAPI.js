import BaseAPI from './BaseAPI'
import DeviceAPIConfiguration from './api-config'

export default class StopAppInstanceAPI extends BaseAPI {
  stopAppInstance (appId, instanceId) {
    // POST request using fetch with error handling
    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ appId, instanceId })
    }

    const response = this.callAPI(DeviceAPIConfiguration.POST_STOP_INSTANCE_URL, requestOptions)

    return response
  }
}
