import BaseAPI from "./BaseAPI";
import DeviceAPIConfiguration from "./api-config";

export default class StopAppInstanceAPI extends BaseAPI {
  stopAppInstance(appId, instanceId) {
    // POST request using fetch with error handling
    var requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ appId, instanceId })
    };

    var apiURL = new DeviceAPIConfiguration();

    var response = this.callAPI(apiURL.POST_STOP_INSTANCE_URL, requestOptions);

    return response;
  }
}
