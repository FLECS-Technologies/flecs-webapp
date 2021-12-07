export const TestDataInstalledApps = {
  additionalInfo: '',
  appList:
    [
      {
        app: 'com.codesys.codesyscontrol',
        status: 'installed',
        version: '4.2.0',
        instances: [
          {
            instanceId: 'com.codesys.codesyscontrol.01234567',
            instanceName: 'Smarthome',
            status: 'started',
            version: '4.2.0'
          },
          {
            instanceId: 'com.codesys.codesyscontrol.12345678',
            instanceName: 'Energymanager',
            status: 'stopped',
            version: '4.2.0'
          }
        ]
      },
      {
        app: 'org.mosquitto.broker',
        desired: 'installed',
        installed_size: 0,
        instances:
            [
              {
                desired: 'created',
                instanceId: '9f73adf2',
                instanceName: 'Mosquitto MQTT7',
                status: 'created',
                version: '2.0.14-openssl'
              },
              {
                desired: 'created',
                instanceId: '287ec590',
                instanceName: 'Mosquitto MQTT8',
                status: 'created',
                version: '2.0.14-openssl'
              }
            ],
        status: 'installed',
        version: '2.0.14-openssl'
      }
    ]
}
