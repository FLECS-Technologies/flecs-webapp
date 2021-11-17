import BaseAPI from "./BaseAPI";
import DeviceAPIConfiguration from "./api-config";

export default class DeleteAppInstanceAPI extends BaseAPI {
  deleteAppInstance(appId, appVersion, instanceName) {
    // POST request using fetch with error handling
    var requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ appId, appVersion, instanceName })
    };

    var apiURL = new DeviceAPIConfiguration();

    var response = this.callAPI(
      apiURL.POST_DELETE_APP_INSTANCE_URL,
      requestOptions
    );

    return response;
  }
}
