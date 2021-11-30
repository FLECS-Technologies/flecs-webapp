import BaseAPI from './BaseAPI'
import DeviceAPIConfiguration from './api-config'

export default class PutSideloadAppAPI extends BaseAPI {
  async sideloadApp (appYaml) {
    // PUT request using fetch with error handling
    const requestOptions = {
      method: 'PUT',
      headers: { 'Content-Type': 'application/yaml' },
      body: JSON.st // JSON.stringify({ appYaml })
    }

    try {
      const response = await fetch(this.callAPI(DeviceAPIConfiguration.PUT_SIDELOAD_APP, requestOptions)).then(response => response.json)
      if (response.ok) {
        return response
      } else {
        throw Error('Failed to perform PutSideloadAppAPI.sideloadApp()')
      }
    } catch (error) {
      console.log(error)
    }
  }
}
