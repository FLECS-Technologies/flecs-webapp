import BaseAPI from "./BaseAPI";
import DeviceAPIConfiguration from "./api-config";

export default class PostUninstallAppAPI extends BaseAPI {
  constructor(props) {
    super(props);

    this.state = {
      status: null,
      additionalInfo: null
    };
  }

  uninstallApp(appId, appVersion) {
    // POST request using fetch with error handling
    var requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ appId, appVersion })
    };

    var apiURL = new DeviceAPIConfiguration();

    this.callAPI(apiURL.POST_UNINSTALL_APP_URL, requestOptions);

    return this.state.status;
  }
}
