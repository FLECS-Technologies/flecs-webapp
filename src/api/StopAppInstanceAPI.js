import BaseAPI from './BaseAPI'
import DeviceAPIConfiguration from './api-config'

export default class StopAppInstanceAPI extends BaseAPI {
  async stopAppInstance (app, instanceId) {
    // POST request using fetch with error handling
    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ app, instanceId })
    }

    try {
      const response = await fetch(this.callAPI(DeviceAPIConfiguration.POST_STOP_INSTANCE_URL, requestOptions)).then(response => response.json)
      if (response.ok) {
        return response
      } else {
        throw Error('Failed to perform StopAppInstanceAPI.stopAppInstance()')
      }
    } catch (error) {
      console.log(error)
    }

    return false
  }
}
