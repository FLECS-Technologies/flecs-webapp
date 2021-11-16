export let installedAppsList = [
  {
    appId: "com.codesys.codesyscontrol",
    status: "installed",
    version: "4.2.0",
    instances: [
      {
        instanceId: "com.codesys.codesyscontrol.01234567",
        instancename: "Smarthome",
        status: "started",
        version: "4.2.0"
      },
      {
        instanceId: "com.codesys.codesyscontrol.12345678",
        instancename: "Energymanager",
        status: "stopped",
        version: "4.2.0"
      }
    ]
  },
  {
    appId: "com.codesys.codesysgateway",
    status: "installed",
    version: "4.1.0",
    instances: [
      {
        instanceId: "com.codesys.codesysgateway.12345678",
        instancename: "cdsgateway",
        status: "started",
        version: "4.1.0"
      }
    ]
  },
  {
    appId: "com.eclipse.mosquitto",
    status: "installed",
    version: "2.0.13",
    instances: [
      {
        instanceId: "com.eclipse.mosquitto.12345678",
        instancename: "mosquittobroker",
        status: "started",
        version: "2.0.13"
      }
    ]
  },
  {
    appId: "com.mirasoft.cloudadapter",
    status: "installed",
    version: "6.3.9",
    instances: [
      {
        instanceId: "com.mirasoft.cloudadapter.12345678",
        instancename: "AnyViz Cloud Adapter",
        status: "started",
        version: "6.3.9"
      }
    ]
  }
];
