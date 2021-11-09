export class DeviceAPIConfiguration {
  // get requests
  GET_DEVICE_INFO_URL = "http://localhost:8080/GetDeviceInfo";
  GET_INSTALLED_APP_LIST_URL = "http://localhost:8080/InstalledAppList";
  GET_INSTANTIATED_APP_LIST = "http://localhost:8080/InstantiatedApps";

  // post requests
  POST_INSTALL_APP_URL = "http://localhost:8080/InstallApp";
  POST_UNINSTALL_APP_URL = "http://localhost:8080/UninstallApp";
  POST_START_APP_URL = "http://localhost:8080/StartApp";
  POST_STOP_APP_URL = "http://localhost:8080/StopApp";
  POST_CREATE_APP_INSTANCE_URL = "http://localhost:8080/CreateAppInstance";
  POST_DELETE_APP_INSTANCE_URL = "http://localhost:8080/DeleteAppInstance";
}

export class MarketplaceAPIConfiguration {
  // get requests
  GET_APP_LIST_URL = "http://marketplace.flecs.tech/AppList";

  // post requests
}
