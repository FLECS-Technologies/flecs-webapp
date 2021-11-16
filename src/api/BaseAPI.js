import React from "react";

export default class BaseAPI extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      responseData: null
    };
  }

  callAPI(apiURL, requestOptions) {
    fetch(apiURL, requestOptions)
      .then(async (response) => {
        const isJson = response.headers
          .get("content-type")
          ?.includes("application/json");
        const data = isJson && (await response.json());

        // check for error response
        if (response.headers.status !== 200) {
          // get error message from body or default to response status
          const error = (data && data.additionalInfo) || response.status;
          return Promise.reject(error);
        }

        this.setState({ responseData: data });
        return response.ok;
      })
      .catch((error) => {
        this.setState({ errorMessage: error });
        console.error("There was an error!", error);
      });
  }
}
