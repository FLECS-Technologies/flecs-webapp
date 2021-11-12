import BaseAPI from "./BaseAPI";
import DeviceAPIConfiguration from "./api-config";

export default class PostInstallAppAPI extends BaseAPI {
  constructor(props) {
    super(props);

    this.state = {
      status: null,
      additionalInfo: null
    };
  }

  installApp(appId, appVersion) {
    // POST request using fetch with error handling
    var requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ appId, appVersion })
    };

    var apiURL = new DeviceAPIConfiguration();

    var response = this.callAPI(apiURL.POST_INSTALL_APP_URL, requestOptions);

    return response;
  }
}
