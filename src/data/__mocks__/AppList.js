export const mockInstalledApps = [
  {
    appKey: {
      name: 'com.vendor.app',
      version: '4.2.0'
    },
    title: 'App',
    author: 'Vendor GmbH',
    description: 'Runtime.',
    availability: 'available',
    status: 'installed',
    multiInstance: true,
    instances: []
  },
  {
    appKey: {
      name: 'com.vendor.app2',
      version: '4.1.0'
    },
    title: 'App 2',
    author: 'Vendor GmbH',
    description: 'App 2.',
    availability: 'available',
    status: 'uninstalled',
    multiInstance: false,
    instances: []
  },
  {
    appKey: {
      name: 'org.mosquitto.broker',
      version: '2.0.14-openssl'
    },
    title: 'Mosquitto MQTT',
    author: 'Eclipse Foundation',
    description: 'MQTT broker.',
    availability: 'available',
    status: 'uninstalled',
    multiInstance: false,
    instances: []
  }
]
