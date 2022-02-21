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
import nock from 'nock'
import '@testing-library/jest-dom'
import DeviceAPI from '../DeviceAPI'
import { DeviceAPIConfiguration } from '../api-config'

const appList =
  [
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
const providers = [

  {
    provider: 'tech.flecs.mqtt',
    protocol: 'MQTT',
    data: []
  },

  {
    provider: 'tech.flecs.opcua',
    protocol: 'OPCUA',
    data: []
  }
]

describe('DeviceAPI', () => {
  beforeEach(() => {
    nock.disableNetConnect()
    nock.enableNetConnect('127.0.0.1')
  })
  afterEach(() => {
    nock.cleanAll()
    nock.enableNetConnect()
  })

  test('calls successfull DeviceAPI.getInstalledApps', async () => {
    nock('http://localhost')
      .get(DeviceAPIConfiguration.DEVICE_ROUTE + DeviceAPIConfiguration.GET_INSTALLED_APP_LIST_URL)
      .reply(200, { appList }, {
        'Access-Control-Allow-Origin': '*',
        'Content-type': 'application/json'
      })
    const devAPI = new DeviceAPI()
    await devAPI.getInstalledApps()

    expect(devAPI.lastAPICallSuccessfull).toBeTruthy()
    expect(devAPI.appList).toHaveLength(2)
  })

  test('calls failed DeviceAPI.getInstalledApps', async () => {
    nock('http://localhost')
      .get(DeviceAPIConfiguration.DEVICE_ROUTE + DeviceAPIConfiguration.GET_INSTALLED_APP_LIST_URL)
      .reply(400, {
        'Access-Control-Allow-Origin': '*',
        'Content-type': 'application/json'
      })

    const devAPI = new DeviceAPI()
    await devAPI.getInstalledApps()

    expect(devAPI.lastAPICallSuccessfull).toBeFalsy()
    expect(devAPI.appList).toBeNull()
  })

  test('calls successfull DeviceAPI.browseServiceMesh', async () => {
    nock('http://localhost')
      .get(DeviceAPIConfiguration.DEVICE_ROUTE + DeviceAPIConfiguration.GET_BROWSE_SERVICE_MESH)
      .reply(200, { providers }, {
        'Access-Control-Allow-Origin': '*',
        'Content-type': 'application/json'
      })

    const devAPI = new DeviceAPI()
    await devAPI.browseServiceMesh()

    expect(devAPI.lastAPICallSuccessfull).toBeTruthy()
    expect(devAPI.serviceMeshData).toHaveLength(2)
  })

  test('calls failed DeviceAPI.browseServiceMesh', async () => {
    nock('http://localhost')
      .get(DeviceAPIConfiguration.DEVICE_ROUTE + DeviceAPIConfiguration.GET_BROWSE_SERVICE_MESH)
      .reply(400, {
        'Access-Control-Allow-Origin': '*',
        'Content-type': 'application/json'
      })

    const devAPI = new DeviceAPI()
    await devAPI.browseServiceMesh()

    expect(devAPI.lastAPICallSuccessfull).toBeFalsy()
    expect(devAPI.serviceMeshData).toBeNull()
  })

  test('calls DeviceAPI.browseServiceMesh with null response', async () => {
    nock('http://localhost')
      .get(DeviceAPIConfiguration.DEVICE_ROUTE + DeviceAPIConfiguration.GET_BROWSE_SERVICE_MESH)
      .reply(200, { testfail: 'NULL response' }, {
        'Access-Control-Allow-Origin': '*',
        'Content-type': 'application/json'
      })

    const devAPI = new DeviceAPI()
    await devAPI.browseServiceMesh()

    expect(devAPI.lastAPICallSuccessfull).toBeFalsy()
    expect(devAPI.serviceMeshData).toBeNull()
  })
})
