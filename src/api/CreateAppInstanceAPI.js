import BaseAPI from "./BaseAPI";
import DeviceAPIConfiguration from "./api-config";

export default class CreateAppInstanceAPI extends BaseAPI {
  constructor(props) {
    super(props);

    this.state = {
      status: null,
      additionalInfo: null,
      appId: null,
      instanceId: null
    };
  }

  createAppInstance(appId, appVersion, instanceName) {
    // POST request using fetch with error handling
    var requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ appId, appVersion, instanceName })
    };

    var apiURL = new DeviceAPIConfiguration();

    this.callAPI(apiURL.POST_CREATE_APP_INSTANCE_URL, requestOptions);

    return this.state;
  }
}
