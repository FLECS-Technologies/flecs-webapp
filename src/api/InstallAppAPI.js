import React from "react";
import DeviceAPIConfiguration from "./api-config";

export default class PostInstallAppAPI extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      status: null,
      additionalInfo: null
    };
  }

  installApp(appId, appVersion) {
    // POST request using fetch with error handling
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ appId: { appId }, version: { appVersion } })
    };

    fetch(DeviceAPIConfiguration.POST_INSTALL_APP_URL, requestOptions)
      .then(async (response) => {
        const isJson = response.headers
          .get("content-type")
          ?.includes("application/json");
        const data = isJson && (await response.json());

        // check for error response
        if (!response.ok) {
          // get error message from body or default to response status
          const error = (data && data.additionalInfo) || response.status;
          return Promise.reject(error);
        }

        this.setState({ status: data.status });
      })
      .catch((error) => {
        this.setState({ errorMessage: error });
        console.error("There was an error!", error);
      });

    return this.state.status;
  }
}
