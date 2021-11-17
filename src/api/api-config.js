export default class DeviceAPIConfiguration {
  // get requests
  GET_DEVICE_INFO_URL = "http://localhost:80/GetDeviceInfo";
  GET_INSTALLED_APP_LIST_URL = "http://localhost:80/InstalledAppList";
  GET_INSTANTIATED_APP_LIST_URL = "http://localhost:80/InstantiatedApps";

  // post requests
  POST_INSTALL_APP_URL = "http://localhost:80/InstallApp";
  POST_UNINSTALL_APP_URL = "http://localhost:80/UninstallApp";
  POST_START_INSTANCE_URL = "http://localhost:80/StartInstance";
  POST_STOP_INSTANCE_URL = "http://localhost:80/StopInstance";
  POST_CREATE_APP_INSTANCE_URL = "http://localhost:80/CreateAppInstance";
  POST_DELETE_APP_INSTANCE_URL = "http://localhost:80/DeleteAppInstance";
}

export class MarketplaceAPIConfiguration {
  // get requests
  GET_APP_LIST_URL = "http://marketplace.flecs.tech/AppList";

  // post requests
  
}
