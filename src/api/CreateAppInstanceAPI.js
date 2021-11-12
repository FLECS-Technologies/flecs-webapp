import BaseAPI from "./BaseAPI";
import DeviceAPIConfiguration from "./api-config";

export default class CreateAppInstanceAPI extends BaseAPI {
  createAppInstance(appId, appVersion, instanceName) {
    // POST request using fetch with error handling
    var requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ appId, appVersion, instanceName })
    };

    var apiURL = new DeviceAPIConfiguration();

    var response = this.callAPI(
      apiURL.POST_CREATE_APP_INSTANCE_URL,
      requestOptions
    );

    return response;
  }
}
