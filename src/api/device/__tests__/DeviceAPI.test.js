/*
 * Copyright (c) 2022 FLECS Technologies GmbH
 *
 * Created on Mon Feb 21 2022
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
import '@testing-library/jest-dom'
import DeviceAPI from '../DeviceAPI'

const appList = [
  {
    app: 'io.testauthor.testapp',
    versions: [
      {
        version: '4.1.0',
        status: 'installed',
        desired: 'installed',
        installedSize: 1234
      }
    ],
    instances: [
      {
        instanceId: '01234567',
        instancename: 'testinstance',
        status: 'started',
        desired: 'created',
        version: '4.2.0'
      }
    ]
  },
  {
    app: 'io.testauthor2.testapp2',
    versions: [
      {
        version: '5.1.0',
        status: 'installed',
        desired: 'installed',
        installedSize: 1253
      }
    ],
    instances: [
      {
        instanceId: '12345678',
        instancename: 'lol',
        status: 'started',
        version: '5.1.0'
      }
    ]
  }
]

describe('DeviceAPI', () => {
  beforeEach(() => {
    jest.restoreAllMocks()
  })

  test('calls successful DeviceAPI.getInstalledApps', async () => {
    jest.spyOn(DeviceAPI.prototype, 'getInstalledApps').mockImplementation(async function () {
      this.lastAPICallSuccessful = true
      this.appList = appList
    })

    const devAPI = new DeviceAPI()
    await devAPI.getInstalledApps()

    expect(devAPI.lastAPICallSuccessful).toBeTruthy()
    expect(devAPI.appList).toHaveLength(2)
  })

  test('calls failed DeviceAPI.getInstalledApps', async () => {
    jest.spyOn(DeviceAPI.prototype, 'getInstalledApps').mockImplementation(async function () {
      this.lastAPICallSuccessful = false
      this.appList = null
    })

    const devAPI = new DeviceAPI()
    await devAPI.getInstalledApps()

    expect(devAPI.lastAPICallSuccessful).toBeFalsy()
    expect(devAPI.appList).toBeNull()
  })
})
