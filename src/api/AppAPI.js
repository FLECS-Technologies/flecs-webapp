import React from "react";

import PostInstallAppAPI from "../api/InstallAppAPI";
import PostCreateAppInstanceAPI from "../api/CreateAppInstanceAPI";
import PostStartAppInstanceAPI from "../api/StartAppInstanceAPI";
import PostUninstallAppAPI from "../api/UninstallAppAPI";

export default class AppAPI extends React.Component {
  constructor(props) {
    super(props);
    this.app = {
      appId: props.appId,
      avatar: props.avatar,
      title: props.title,
      vendor: props.vendor,
      version: props.version,
      description: props.description,
      status: props.status,
      availability: props.availability
    };
    this.instances = [];
  }

  // Installs an app from the marketplace and automatically creates and starts an instance of this app
  installFromMarketplace() {
    var returnValue = false;
    if (this.app) {
      var installAPI = new PostInstallAppAPI();
      var createInstanceAPI = new PostCreateAppInstanceAPI();
      var startInstanceAPI = new PostStartAppInstanceAPI();

      if (installAPI.installApp(this.app.appId, this.app.version)) {
        if (
          createInstanceAPI.createAppInstance(
            this.app.appId,
            this.app.version,
            this.app.title
          )
        ) {
          var length = this.instances.push(
            createInstanceAPI.state.responseData.instanceId
          );

          if (
            startInstanceAPI.startAppInstance(
              this.app.appId,
              this.instances[length - 1]
            )
          ) {
            returnValue = true;
          } else {
            // catch response of start app instance was not OK
          }
        } else {
          // catch response of create app inscance was not OK
        }
      } else {
        // catch response of install app api was not OK
      }

      return returnValue;
    }
  }

  uninstall(){
    var returnValue = false;
    if(this.app){

    }
    return returnValue;
  }
}
