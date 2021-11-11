import BaseAPI from "./BaseAPI";
import DeviceAPIConfiguration from "./api-config";

export default class StartAppInstanceAPI extends BaseAPI {
  constructor(props) {
    super(props);

    this.state = {
      status: null,
      additionalInfo: null
    };
  }

  startAppInstance(appId, instanceId) {
    // POST request using fetch with error handling
    var requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ appId, instanceId })
    };

    var apiURL = new DeviceAPIConfiguration();

    this.callAPI(apiURL.POST_START_INSTANCE_URL, requestOptions);

    return this.state;
  }
}
