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
import nock from 'nock'
import '@testing-library/jest-dom'
import AppAPI from '../AppAPI'
import { DeviceAPIConfiguration } from '../../api-config'

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
    availability: 'available'
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
    nock.disableNetConnect()
    nock.enableNetConnect('127.0.0.1')
  })
  afterEach(() => {
    nock.cleanAll()
    nock.enableNetConnect()
  })
  test('calls AppAPI.setAppData', async () => {
    const appAPI = new AppAPI(testApp)
    expect(appAPI.app.appKey.name).toBe(testApp.appKey.name)
    expect(appAPI.app.title).toBe(testApp.title)
    expect(appAPI.app.author).toBe(testApp.author)
    expect(appAPI.app.appKey.version).toBe(testApp.appKey.version)
    expect(appAPI.app.description).toBe(testApp.description)
    expect(appAPI.app.multiInstance).toBe(testApp.multiInstance)
    expect(appAPI.app.status).toBe(testApp.status)
    expect(appAPI.app.availability).toBe(testApp.availability)
    expect(appAPI.lastAPIError).toBe(null)
    expect(appAPI.lastAPICallSuccessful).toBe(false)

    testApp.author = 'Homer Simpson'
    appAPI.setAppData(testApp)
    expect(appAPI.app.appKey.name).toBe(testApp.appKey.name)
    expect(appAPI.app.author).toBe(testApp.author)
  })

  test('calls AppAPI.createInstanceName', async () => {
    const appAPI = new AppAPI(testApp)
    expect(appAPI.app.appKey.name).toBe(testApp.appKey.name)

    let instName = appAPI.createInstanceName()
    expect(instName).toBe('Mosquitto MQTT broker0')

    appAPI.app.instances = [testInstance]
    instName = appAPI.createInstanceName()
    expect(instName).toBe('Mosquitto MQTT broker1')
  })

  test('calls AppAPI.uninstall', async () => {
    nock('http://localhost')
      .delete(DeviceAPIConfiguration.DEVICE_BASE_ROUTE + DeviceAPIConfiguration.APP_ROUTE + DeviceAPIConfiguration.DELETE_UNINSTALL_APP_URL + '/' + testApp.appKey.name + '?version=' + testApp.appKey.version)
      .reply(202, {
        jobId: 1
      })

    testApp.status = 'installed'
    const appAPI = new AppAPI(testApp)
    expect(appAPI.app.appKey.name).toBe(testApp.appKey.name)
    expect(appAPI.app.status).toBe(testApp.status)

    await appAPI.uninstall()

    expect(appAPI.lastAPICallSuccessful).toBeTruthy()
    expect(appAPI.app.status).toBe('uninstalled')
  })

  test('calls AppAPI.createInstance', async () => {
    nock('http://localhost')
      .post(DeviceAPIConfiguration.DEVICE_BASE_ROUTE + DeviceAPIConfiguration.POST_CREATE_INSTANCE_URL)
      .reply(202, {
        jobId: 1
      })

    // used for fetchInstances()
    nock('http://localhost')
      .get(DeviceAPIConfiguration.DEVICE_BASE_ROUTE + DeviceAPIConfiguration.INSTANCES_ROUTE)
      .reply(200, [{ instanceId: testInstance.instanceId, instanceName: 'Mosquitto MQTT broker0', appKey: { name: 'org.eclipse.mosquitto', version: '2.0.14-openssl' }, status: 'stopped', desired: 'running' }, { instanceId: '0291fa61', instanceName: 'AnyViz Cloud Adapter0', appKey: { name: 'io.anyviz.cloudadapter', version: '0.9.5.1' }, status: 'running', desired: 'running' }]
      )

    testApp.status = 'installed'
    testApp.instances = []
    const appAPI = new AppAPI(testApp)
    expect(appAPI.app.appKey.name).toBe(testApp.appKey.name)
    expect(appAPI.app.status).toBe(testApp.status)

    const instName = appAPI.createInstanceName()
    await appAPI.createInstance(instName)
    await appAPI.fetchInstances()

    expect(appAPI.lastAPICallSuccessful).toBeTruthy()
    expect(appAPI.app.status).toBe('installed')
    expect(appAPI.app.instances.length).toBe(1)
    expect(appAPI.app.instances[0].status).toBe('stopped')
    expect(appAPI.app.instances[0].appKey.version).toBe(testApp.appKey.version)
    expect(appAPI.app.instances[0].instanceName).toBe(instName)
    expect(appAPI.app.instances[0].instanceId).toBe(testInstance.instanceId)
  })

  test('calls AppAPI.startInstance', async () => {
    nock('http://localhost')
      .post(DeviceAPIConfiguration.DEVICE_BASE_ROUTE + DeviceAPIConfiguration.POST_START_INSTANCE_URL(testInstance.instanceId))
      .reply(202, {
        jobId: 1
      })

    // used for fetchInstances()
    nock('http://localhost')
      .get(DeviceAPIConfiguration.DEVICE_BASE_ROUTE + DeviceAPIConfiguration.INSTANCES_ROUTE)
      .reply(200, [{ instanceId: testInstance.instanceId, instanceName: 'Mosquitto MQTT broker0', appKey: { name: 'org.eclipse.mosquitto', version: '2.0.14-openssl' }, status: 'running', desired: 'running' }, { instanceId: '0291fa61', instanceName: 'AnyViz Cloud Adapter0', appKey: { name: 'io.anyviz.cloudadapter', version: '0.9.5.1' }, status: 'running', desired: 'running' }]
      )

    testApp.status = 'installed'
    testInstance.status = 'stopped'
    testApp.instances = [testInstance]
    const appAPI = new AppAPI(testApp)
    expect(appAPI.app.appKey.name).toBe(testApp.appKey.name)
    expect(appAPI.app.status).toBe(testApp.status)

    await appAPI.startInstance(testInstance.instanceId)
    await appAPI.fetchInstances()

    expect(appAPI.lastAPICallSuccessful).toBeTruthy()
    expect(appAPI.app.status).toBe('installed')
    expect(appAPI.app.instances.length).toBe(1)
    expect(appAPI.app.instances[0].status).toBe('running')
    expect(appAPI.app.instances[0].appKey.version).toBe(testApp.appKey.version)
    expect(appAPI.app.instances[0].instanceName).toBe(testInstance.instanceName)
    expect(appAPI.app.instances[0].instanceId).toBe(testInstance.instanceId)
  })

  test('calls AppAPI.stopInstance', async () => {
    nock('http://localhost')
      .post(DeviceAPIConfiguration.DEVICE_BASE_ROUTE + DeviceAPIConfiguration.POST_STOP_INSTANCE_URL(testInstance.instanceId))
      .reply(202, {
        jobId: 1
      })

    // used for fetchInstances()
    nock('http://localhost')
      .get(DeviceAPIConfiguration.DEVICE_BASE_ROUTE + DeviceAPIConfiguration.INSTANCES_ROUTE)
      .reply(200, [{ instanceId: testInstance.instanceId, instanceName: 'Mosquitto MQTT broker0', appKey: { name: 'org.eclipse.mosquitto', version: '2.0.14-openssl' }, status: 'stopped', desired: 'stopped' }, { instanceId: '0291fa61', instanceName: 'AnyViz Cloud Adapter0', appKey: { name: 'io.anyviz.cloudadapter', version: '0.9.5.1' }, status: 'running', desired: 'running' }]
      )

    testApp.status = 'installed'
    testInstance.status = 'running'
    testApp.instances = [testInstance]
    const appAPI = new AppAPI(testApp)
    expect(appAPI.app.appKey.name).toBe(testApp.appKey.name)
    expect(appAPI.app.status).toBe(testApp.status)

    await appAPI.stopInstance(testInstance.instanceId)
    await appAPI.fetchInstances()

    expect(appAPI.lastAPICallSuccessful).toBeTruthy()
    expect(appAPI.app.status).toBe('installed')
    expect(appAPI.app.instances.length).toBe(1)
    expect(appAPI.app.instances[0].status).toBe('stopped')
    expect(appAPI.app.instances[0].appKey.version).toBe(testApp.appKey.version)
    expect(appAPI.app.instances[0].instanceName).toBe(testInstance.instanceName)
    expect(appAPI.app.instances[0].instanceId).toBe(testInstance.instanceId)
  })

  test('calls AppAPI.deleteInstance', async () => {
    nock('http://localhost')
      .delete(DeviceAPIConfiguration.DEVICE_BASE_ROUTE + DeviceAPIConfiguration.DELETE_INSTANCE_URL(testInstance.instanceId))
      .reply(202, {
        jobId: 1
      })

    // used for fetchInstances()
    nock('http://localhost')
      .get(DeviceAPIConfiguration.DEVICE_BASE_ROUTE + DeviceAPIConfiguration.INSTANCES_ROUTE)
      .reply(200, [{ instanceId: '0291fa61', instanceName: 'AnyViz Cloud Adapter0', appKey: { name: 'io.anyviz.cloudadapter', version: '0.9.5.1' }, status: 'running', desired: 'running' }]
      )

    testApp.status = 'installed'
    testInstance.status = 'running'
    testApp.instances = [testInstance]
    const appAPI = new AppAPI(testApp)
    expect(appAPI.app.appKey.name).toBe(testApp.appKey.name)
    expect(appAPI.app.status).toBe(testApp.status)

    await appAPI.deleteInstance(testInstance.instanceId)
    await appAPI.fetchInstances()

    expect(appAPI.lastAPICallSuccessful).toBeTruthy()
    expect(appAPI.app.status).toBe('installed')
    expect(appAPI.app.instances.length).toBe(0)
  })

  test('calls AppAPI.installFromMarketplace', async () => {
    nock('http://localhost')
      .post(DeviceAPIConfiguration.DEVICE_BASE_ROUTE + DeviceAPIConfiguration.APP_ROUTE + DeviceAPIConfiguration.POST_INSTALL_APP_URL)
      .reply(202, {
        jobId: 1
      })

    nock('http://localhost')
      .post(DeviceAPIConfiguration.DEVICE_BASE_ROUTE + DeviceAPIConfiguration.POST_CREATE_INSTANCE_URL)
      .reply(202, {
        jobId: 1
      })

    nock('http://localhost')
      .post(DeviceAPIConfiguration.DEVICE_BASE_ROUTE + DeviceAPIConfiguration.POST_START_INSTANCE_URL(testInstance.instanceId))
      .reply(202, {
        jobId: 1
      })

    // used for fetchInstances()
    nock('http://localhost')
      .get(DeviceAPIConfiguration.DEVICE_BASE_ROUTE + DeviceAPIConfiguration.INSTANCES_ROUTE)
      .reply(200, [{ instanceId: testInstance.instanceId, instanceName: 'Mosquitto MQTT broker0', appKey: { name: 'org.eclipse.mosquitto', version: '2.0.14-openssl' }, status: 'running', desired: 'running' }, { instanceId: '0291fa61', instanceName: 'AnyViz Cloud Adapter0', appKey: { name: 'io.anyviz.cloudadapter', version: '0.9.5.1' }, status: 'running', desired: 'running' }]
      )

    testApp.status = 'uninstalled'
    testApp.instances = []
    const appAPI = new AppAPI(testApp)
    expect(appAPI.app.appKey.name).toBe(testApp.appKey.name)
    expect(appAPI.app.status).toBe(testApp.status)

    await appAPI.installFromMarketplace()
    await appAPI.fetchInstances()

    expect(appAPI.lastAPICallSuccessful).toBeTruthy()
    expect(appAPI.app.status).toBe('installed')
    expect(appAPI.app.instances.length).toBe(1)
  })

  test('calls AppAPI.sideloadApp', async () => {
    nock('http://localhost')
      .post(DeviceAPIConfiguration.DEVICE_BASE_ROUTE + DeviceAPIConfiguration.APP_ROUTE + DeviceAPIConfiguration.POST_SIDELOAD_APP)
      .reply(202, {
        jobId: 1
      })

    nock('http://localhost')
      .post(DeviceAPIConfiguration.DEVICE_BASE_ROUTE + DeviceAPIConfiguration.POST_CREATE_INSTANCE_URL)
      .reply(202, {
        jobId: 1
      })

    nock('http://localhost')
      .post(DeviceAPIConfiguration.DEVICE_BASE_ROUTE + DeviceAPIConfiguration.POST_START_INSTANCE_URL(testInstance.instanceId))
      .reply(202, {
        jobId: 1
      })

    // used for fetchInstances()
    nock('http://localhost')
      .get(DeviceAPIConfiguration.DEVICE_BASE_ROUTE + DeviceAPIConfiguration.INSTANCES_ROUTE)
      .reply(200, [{ instanceId: testInstance.instanceId, instanceName: 'Mosquitto MQTT broker0', appKey: { name: 'org.eclipse.mosquitto', version: '2.0.14-openssl' }, status: 'running', desired: 'running' }, { instanceId: '0291fa61', instanceName: 'AnyViz Cloud Adapter0', appKey: { name: 'io.anyviz.cloudadapter', version: '0.9.5.1' }, status: 'running', desired: 'running' }]
      )

    testApp.status = 'uninstalled'
    testApp.instances = []
    const appAPI = new AppAPI(testApp)
    expect(appAPI.app.appKey.name).toBe(testApp.appKey.name)
    expect(appAPI.app.status).toBe(testApp.status)

    await appAPI.sideloadApp('fakeYaml')
    await appAPI.fetchInstances()

    expect(appAPI.lastAPICallSuccessful).toBeTruthy()
    expect(appAPI.app.status).toBe('installed')
    expect(appAPI.app.instances.length).toBe(1)
    expect(appAPI.app.instances[0].status).toBe('running')
  })
})
