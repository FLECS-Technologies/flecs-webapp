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
import AppAPI from './AppAPI'

describe('AppAPI', () => {
  const testApp = {
    app: 'org.eclipse.mosquitto',
    title: 'Mosquitto MQTT broker',
    version: '2.0.14-openssl',
    description: 'Mosquitto MQTT broker',
    author: 'El Barto',
    category: ['communication'],
    image: 'eclipse-mosquitto',
    multiInstance: false,
    volumes: ['data:/mosquitto/data/', 'log:/mosquitto/log/'],
    ports: ['1883:1883', '9001:9001'],
    status: 'uninstalled',
    availability: 'available'
  }
  const testInstance = {
    app: 'org.eclipse.mosquitto',
    instanceName: 'Mosquitto MQTT broker0',
    version: '2.0.14-openssl',
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
    const app = new AppAPI(testApp)
    expect(app.app.app).toBe(testApp.app)
    expect(app.app.title).toBe(testApp.title)
    expect(app.app.author).toBe(testApp.author)
    expect(app.app.version).toBe(testApp.version)
    expect(app.app.description).toBe(testApp.description)
    expect(app.app.multiInstance).toBe(testApp.multiInstance)
    expect(app.app.status).toBe(testApp.status)
    expect(app.app.availability).toBe(testApp.availability)
    expect(app.lastAPIError).toBe(null)
    expect(app.lastAPICallSuccessfull).toBe(false)

    testApp.author = 'Homer Simpson'
    app.setAppData(testApp)
    expect(app.app.app).toBe(testApp.app)
    expect(app.app.author).toBe(testApp.author)
  })

  test('calls AppAPI.createInstanceName', async () => {
    const app = new AppAPI(testApp)
    expect(app.app.app).toBe(testApp.app)

    let instName = app.createInstanceName()
    expect(instName).toBe('Mosquitto MQTT broker0')

    app.app.instances = [testInstance]
    instName = app.createInstanceName()
    expect(instName).toBe('Mosquitto MQTT broker1')
  })

  test('calls AppAPI.uninstall', async () => {
    nock('http://localhost')
      .post('/api/UninstallApp')
      .reply(200, {
        'Access-Control-Allow-Origin': '*',
        'Content-type': 'application/json'
      })

    testApp.status = 'installed'
    const app = new AppAPI(testApp)
    expect(app.app.app).toBe(testApp.app)
    expect(app.app.status).toBe(testApp.status)

    await app.uninstall()

    expect(app.lastAPICallSuccessfull).toBeTruthy()
    expect(app.app.status).toBe('uninstalled')
  })

  test('calls AppAPI.createInstance', async () => {
    nock('http://localhost')
      .post('/api/CreateAppInstance')
      .reply(200, {
        app: testApp.app,
        version: testApp.version,
        instanceId: '01234567',
        additionalInfo: ''
      }, {
        'Access-Control-Allow-Origin': '*',
        'Content-type': 'application/json'
      })

    testApp.status = 'installed'
    testApp.instances = []
    const app = new AppAPI(testApp)
    expect(app.app.app).toBe(testApp.app)
    expect(app.app.status).toBe(testApp.status)

    const instName = app.createInstanceName()
    await app.createInstance(instName)

    expect(app.lastAPICallSuccessfull).toBeTruthy()
    expect(app.app.status).toBe('installed')
    expect(app.app.instances.length).toBe(1)
    expect(app.app.instances[0].status).toBe('stopped')
    expect(app.app.instances[0].version).toBe(testApp.version)
    expect(app.app.instances[0].instanceName).toBe(instName)
    expect(app.app.instances[0].instanceId).toBe('01234567')
  })

  test('calls AppAPI.startInstance', async () => {
    nock('http://localhost')
      .post('/api/StartAppInstance')
      .reply(200, {
        app: testApp.app,
        version: testApp.version,
        instanceId: '01234567',
        additionalInfo: ''
      }, {
        'Access-Control-Allow-Origin': '*',
        'Content-type': 'application/json'
      })

    testApp.status = 'installed'
    testInstance.status = 'stopped'
    testApp.instances = [testInstance]
    const app = new AppAPI(testApp)
    expect(app.app.app).toBe(testApp.app)
    expect(app.app.status).toBe(testApp.status)

    await app.startInstance(testApp.version, testInstance.instanceId)

    expect(app.lastAPICallSuccessfull).toBeTruthy()
    expect(app.app.status).toBe('installed')
    expect(app.app.instances.length).toBe(1)
    expect(app.app.instances[0].status).toBe('running')
    expect(app.app.instances[0].version).toBe(testApp.version)
    expect(app.app.instances[0].instanceName).toBe(testInstance.instanceName)
    expect(app.app.instances[0].instanceId).toBe('01234567')
  })

  test('calls AppAPI.stopInstance', async () => {
    nock('http://localhost')
      .post('/api/StopAppInstance')
      .reply(200, {
        app: testApp.app,
        version: testApp.version,
        instanceId: '01234567',
        additionalInfo: ''
      }, {
        'Access-Control-Allow-Origin': '*',
        'Content-type': 'application/json'
      })

    testApp.status = 'installed'
    testInstance.status = 'running'
    testApp.instances = [testInstance]
    const app = new AppAPI(testApp)
    expect(app.app.app).toBe(testApp.app)
    expect(app.app.status).toBe(testApp.status)

    await app.stopInstance(testApp.version, testInstance.instanceId)

    expect(app.lastAPICallSuccessfull).toBeTruthy()
    expect(app.app.status).toBe('installed')
    expect(app.app.instances.length).toBe(1)
    expect(app.app.instances[0].status).toBe('stopped')
    expect(app.app.instances[0].version).toBe(testApp.version)
    expect(app.app.instances[0].instanceName).toBe(testInstance.instanceName)
    expect(app.app.instances[0].instanceId).toBe('01234567')
  })

  test('calls AppAPI.deleteInstance', async () => {
    nock('http://localhost')
      .post('/api/DeleteAppInstance')
      .reply(200, {
        app: testApp.app,
        version: testApp.version,
        instanceId: '01234567',
        additionalInfo: ''
      }, {
        'Access-Control-Allow-Origin': '*',
        'Content-type': 'application/json'
      })

    testApp.status = 'installed'
    testInstance.status = 'running'
    testApp.instances = [testInstance]
    const app = new AppAPI(testApp)
    expect(app.app.app).toBe(testApp.app)
    expect(app.app.status).toBe(testApp.status)

    await app.deleteInstance(testApp.version, testInstance.instanceId)

    expect(app.lastAPICallSuccessfull).toBeTruthy()
    expect(app.app.status).toBe('installed')
    expect(app.app.instances.length).toBe(0)
  })

  test('calls AppAPI.installFromMarketplace', async () => {
    nock('http://localhost')
      .post('/api/InstallApp')
      .reply(200, {
        app: testApp.app,
        version: testApp.version,
        additionalInfo: ''
      }, {
        'Access-Control-Allow-Origin': '*',
        'Content-type': 'application/json'
      })

    nock('http://localhost')
      .post('/api/CreateAppInstance')
      .reply(200, {
        app: testApp.app,
        version: testApp.version,
        instanceId: '01234567',
        additionalInfo: ''
      }, {
        'Access-Control-Allow-Origin': '*',
        'Content-type': 'application/json'
      })

    nock('http://localhost')
      .post('/api/StartAppInstance')
      .reply(200, {
        app: testApp.app,
        version: testApp.version,
        instanceId: '01234567',
        additionalInfo: ''
      }, {
        'Access-Control-Allow-Origin': '*',
        'Content-type': 'application/json'
      })

    testApp.status = 'uninstalled'
    testApp.instances = []
    const app = new AppAPI(testApp)
    expect(app.app.app).toBe(testApp.app)
    expect(app.app.status).toBe(testApp.status)

    await app.installFromMarketplace()

    expect(app.lastAPICallSuccessfull).toBeTruthy()
    expect(app.app.status).toBe('installed')
    // installfrommarketplace is stateless, so the created instance has to be popped at the end. Therefore we expect no instance to be available at this point
    expect(app.app.instances.length).toBe(0)
  })

  test('calls AppAPI.sideloadApp', async () => {
    nock('http://localhost')
      .put('/api/SideloadApp')
      .reply(200, {
        'Access-Control-Allow-Origin': '*',
        'Content-type': 'application/json'
      })

    nock('http://localhost')
      .post('/api/CreateAppInstance')
      .reply(200, {
        app: testApp.app,
        version: testApp.version,
        instanceId: '01234567',
        additionalInfo: ''
      }, {
        'Access-Control-Allow-Origin': '*',
        'Content-type': 'application/json'
      })

    nock('http://localhost')
      .post('/api/StartAppInstance')
      .reply(200, {
        app: testApp.app,
        version: testApp.version,
        instanceId: '01234567',
        additionalInfo: ''
      }, {
        'Access-Control-Allow-Origin': '*',
        'Content-type': 'application/json'
      })

    testApp.status = 'uninstalled'
    testApp.instances = []
    const app = new AppAPI(testApp)
    expect(app.app.app).toBe(testApp.app)
    expect(app.app.status).toBe(testApp.status)

    await app.sideloadApp('')

    expect(app.lastAPICallSuccessfull).toBeTruthy()
    expect(app.app.status).toBe('installed')
    expect(app.app.instances.length).toBe(1)
    expect(app.app.instances[0].status).toBe('running')
  })
})
