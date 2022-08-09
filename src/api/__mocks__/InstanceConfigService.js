/*
 * Copyright (c) 2022 FLECS Technologies GmbH
 *
 * Created on Thu Apr 07 2022
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
function getInstanceConfig (instanceId) {
  return new Promise((resolve, reject) => {
    instanceId
      ? resolve(
        {
          instanceId,
          networkAdapters: [{
            name: 'eth0',
            ipAddress: '192.168.100.1',
            subnetMask: '255.255.255.0',
            active: false
          },
          {
            name: 'eth1',
            ipAddress: '192.168.100.2',
            subnetMask: '255.255.255.0',
            active: true
          }],
          devices: {
            usb: [
              {
                device: '3.0 root hub',
                pid: 3,
                port: 'usb4',
                vendor: 'Linux Foundation',
                vid: 7531,
                active: true,
                connected: true
              },
              {
                device: 'license dongle',
                pid: 5,
                port: 'usb1',
                vendor: 'wibu',
                vid: 7512,
                active: false,
                connected: true
              }
            ]
          }
        }
      )
      : reject(new Error('Mock: Failed to get config'))
  })
}

function putInstanceConfig (instanceId) {
  return new Promise((resolve, reject) => {
    resolve()
  })
}

export { getInstanceConfig, putInstanceConfig }
