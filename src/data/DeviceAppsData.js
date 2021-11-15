export let appData = [
  {
    appId: "com.codesys.codesyscontrol",
    avatar:
      "https://store.codesys.com/media/catalog/product/cache/adefa4dac3229abc7b8dba2f1e919681/c/o/codesys-200px_1.png",
    status: "installed",
    title: "CODESYS Control",
    vendor: "CODESYS GmbH",
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
    avatar:
      "https://store.codesys.com/media/catalog/product/cache/adefa4dac3229abc7b8dba2f1e919681/c/o/codesys-200px_1.png",
    status: "installed",
    title: "CODESYS Edge Gateway",
    vendor: "CODESYS GmbH",
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
    avatar:
      "https://d1q6f0aelx0por.cloudfront.net/product-logos/library-eclipse-mosquitto-logo.png",
    status: "installed",
    title: "Mosquitto MQTT",
    vendor: "Eclipse Foundation",
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
    appId: "com.mirasoft.anvizcloudadapter",
    avatar:
      "https://www.anyviz.io/wp-content/uploads/2021/06/AnyViz-Logo-Compact.svg",
    status: "installed",
    title: "AnyViz Cloud Adapter",
    vendor: "Mirasoft GmbH & Co. KG",
    version: "6.3.9",
    instances: [
      {
        instanceId: "com.mirasoft.anvizcloudadapter.12345678",
        instancename: "AnyViz Cloud Adapter",
        status: "started",
        version: "6.3.9"
      }
    ]
  }
];
