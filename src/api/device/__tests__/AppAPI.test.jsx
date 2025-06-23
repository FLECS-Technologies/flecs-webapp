/*
 * Copyright (c) 2021 FLECS Technologies GmbH
 *
 * Created on Fri Dec 17 2021
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
import AppAPI from '../AppAPI'
import { DeviceAPIConfiguration } from '../../api-config'
import axios from 'axios'

jest.mock('../JobsAPI.js')

describe('AppAPI', () => {
  const testApp = {
    appKey: {
      name: 'org.eclipse.mosquitto',
      version: '2.0.14-openssl'
    },
    title: 'Mosquitto MQTT broker',
    description: 'Mosquitto MQTT broker',
    author: 'El Barto',
    category: ['communication'],
    image: 'eclipse-mosquitto',
    multiInstance: false,
    volumes: ['data:/mosquitto/data/', 'log:/mosquitto/log/'],
    ports: ['1883:1883', '9001:9001'],
    status: 'installed',
    availability: 'available',
    instances: []
  }

  const testInstance = {
    appKey: {
      name: 'org.eclipse.mosquitto',
      version: '2.0.14-openssl'
    },
    instanceName: 'Mosquitto MQTT broker0',
    instanceId: '01234567',
    status: 'running'
  }

  beforeEach(() => {
    axios.post = jest.fn()
  })

  afterAll(() => {
    jest.clearAllMocks()
  })

  test('calls AppAPI.setAppData', async () => {
    const appAPI = new AppAPI({ ...testApp })
    expect(appAPI.app.title).toBe(testApp.title)

    const newApp = { ...testApp, author: 'Homer Simpson' }
    appAPI.setAppData(newApp)
    expect(appAPI.app.author).toBe('Homer Simpson')
  })

  test('calls AppAPI.createInstanceName', async () => {
    const appAPI = new AppAPI({ ...testApp })
    let instName = appAPI.createInstanceName()
    expect(instName).toBe('Mosquitto MQTT broker0')

    appAPI.app.instances = [testInstance]
    instName = appAPI.createInstanceName()
    expect(instName).toBe('Mosquitto MQTT broker1')
  })

  test('calls AppAPI.uninstall', async () => {
    jest.spyOn(AppAPI.prototype, 'uninstall').mockImplementation(async function () {
      this.lastAPICallSuccessful = true
      this.app.status = 'uninstalled'
    })

    const appAPI = new AppAPI({ ...testApp })
    await appAPI.uninstall()

    expect(appAPI.lastAPICallSuccessful).toBeTruthy()
    expect(appAPI.app.status).toBe('uninstalled')
  })

  test('calls AppAPI.createInstance', async () => {
    const appAPI = new AppAPI({ ...testApp })

    jest.spyOn(appAPI, 'createInstance').mockImplementation(async (name) => {
      appAPI.lastAPICallSuccessful = true
    })
    jest.spyOn(appAPI, 'fetchInstances').mockImplementation(async () => {
      appAPI.app.instances = [{ ...testInstance, status: 'stopped' }]
    })

    const instName = appAPI.createInstanceName()
    await appAPI.createInstance(instName)
    await appAPI.fetchInstances()

    expect(appAPI.lastAPICallSuccessful).toBeTruthy()
    expect(appAPI.app.instances[0].status).toBe('stopped')
  })

  test('calls AppAPI.startInstance', async () => {
    const appAPI = new AppAPI({ ...testApp, instances: [testInstance] })

    jest.spyOn(appAPI, 'startInstance').mockImplementation(async () => {
      appAPI.lastAPICallSuccessful = true
    })
    jest.spyOn(appAPI, 'fetchInstances').mockImplementation(async () => {
      appAPI.app.instances = [{ ...testInstance, status: 'running' }]
    })

    await appAPI.startInstance(testInstance.instanceId)
    await appAPI.fetchInstances()

    expect(appAPI.lastAPICallSuccessful).toBeTruthy()
    expect(appAPI.app.instances[0].status).toBe('running')
  })

  test('calls AppAPI.stopInstance', async () => {
    const appAPI = new AppAPI({ ...testApp, instances: [testInstance] })

    jest.spyOn(appAPI, 'stopInstance').mockImplementation(async () => {
      appAPI.lastAPICallSuccessful = true
    })
    jest.spyOn(appAPI, 'fetchInstances').mockImplementation(async () => {
      appAPI.app.instances = [{ ...testInstance, status: 'stopped' }]
    })

    await appAPI.stopInstance(testInstance.instanceId)
    await appAPI.fetchInstances()

    expect(appAPI.lastAPICallSuccessful).toBeTruthy()
    expect(appAPI.app.instances[0].status).toBe('stopped')
  })

  test('calls AppAPI.deleteInstance', async () => {
    const appAPI = new AppAPI({ ...testApp, instances: [testInstance] })

    jest.spyOn(appAPI, 'deleteInstance').mockImplementation(async () => {
      appAPI.lastAPICallSuccessful = true
    })
    jest.spyOn(appAPI, 'fetchInstances').mockImplementation(async () => {
      appAPI.app.instances = []
    })

    await appAPI.deleteInstance(testInstance.instanceId)
    await appAPI.fetchInstances()

    expect(appAPI.lastAPICallSuccessful).toBeTruthy()
    expect(appAPI.app.instances.length).toBe(0)
  })

  test('calls AppAPI.installFromMarketplace', async () => {
    const appAPI = new AppAPI({ ...testApp, status: 'uninstalled', instances: [] })

    jest.spyOn(appAPI, 'installFromMarketplace').mockImplementation(async () => {
      appAPI.lastAPICallSuccessful = true
      appAPI.app.status = 'installed'
    })
    jest.spyOn(appAPI, 'fetchInstances').mockImplementation(async () => {
      appAPI.app.instances = [testInstance]
    })

    await appAPI.installFromMarketplace()
    await appAPI.fetchInstances()

    expect(appAPI.lastAPICallSuccessful).toBeTruthy()
    expect(appAPI.app.status).toBe('installed')
    expect(appAPI.app.instances.length).toBe(1)
  })

  test('calls AppAPI.sideloadApp', async () => {
    const appAPI = new AppAPI({ ...testApp, status: 'uninstalled', instances: [] })

    jest.spyOn(appAPI, 'sideloadApp').mockImplementation(async () => {
      appAPI.lastAPICallSuccessful = true
      appAPI.app.status = 'installed'
    })
    jest.spyOn(appAPI, 'fetchInstances').mockImplementation(async () => {
      appAPI.app.instances = [{ ...testInstance, status: 'running' }]
    })

    await appAPI.sideloadApp('fakeYaml')
    await appAPI.fetchInstances()

    expect(appAPI.lastAPICallSuccessful).toBeTruthy()
    expect(appAPI.app.status).toBe('installed')
    expect(appAPI.app.instances[0].status).toBe('running')
  })
})
