/*
 * Copyright (c) 2021 FLECS Technologies GmbH
 *
 * Created on Tue Nov 30 2021
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

export const installedAppsList = [
  {
    app: 'com.codesys.codesyscontrol',
    status: 'installed',
    version: '4.2.0',
    instances: [
      {
        instanceId: 'com.codesys.codesyscontrol.01234567',
        instanceName: 'Smarthome',
        status: 'running',
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
    app: 'com.codesys.codesysgateway',
    status: 'installed',
    version: '4.1.0',
    instances: [
      {
        instanceId: 'com.codesys.codesysgateway.12345678',
        instanceName: 'cdsgateway',
        status: 'running',
        version: '4.1.0'
      }
    ]
  }
]
