import BaseAPI from './BaseAPI'
import DeviceAPIConfiguration from './api-config'

export default class CreateAppInstanceAPI extends BaseAPI {
  createAppInstance (appId, appVersion, instanceName) {
    // POST request using fetch with error handling
    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ appId, appVersion, instanceName })
    }

    const response = this.callAPI(
      DeviceAPIConfiguration.POST_CREATE_APP_INSTANCE_URL,
      requestOptions
    )

    return response
  }
}
