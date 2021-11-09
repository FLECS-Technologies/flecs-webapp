export class DeviceAPIConfiguration {
  POST_INSTALL_APP_URL = "http://localhost:8080/InstallApp";
  POST_UNINSTALL_APP_URL = "http://localhost:8080/UninstallApp";
  GET_INSTALLED_APP_LIST_URL = "http://localhost:8080/InstalledAppList";
  GET_INSTANTIATED_APP_LIST = "http://localhost:8080/InstantiatedApps";
}

export class MarketplaceAPIConfiguration {
  GET_APP_LIST_URL = "http://marketplace.flecs.tech/AppList";
}
