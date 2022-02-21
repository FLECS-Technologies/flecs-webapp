/*
 * Copyright (c) 2021 FLECS Technologies GmbH
 *
 * Created on Tue Dec 14 2021
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

// import React from 'react'
import nock from 'nock'
// import { render /*, screen */ } from '@testing-library/react'
import '@testing-library/jest-dom'

import PutSideloadAppAPI from '../SideloadAppAPI'

describe('PutSideloadAppAPI', () => {
  beforeEach(() => {
    nock.disableNetConnect()
    nock.enableNetConnect('127.0.0.1')
  })
  afterEach(() => {
    nock.cleanAll()
    nock.enableNetConnect()
  })
  test('calls PutSideloadAppAPI with success response', async () => {
    nock('http://localhost')
      .put('/api/SideloadApp')
      .reply(200, {
        app: 'org.eclipse.mosquitto',
        title: 'Mosquitto MQTT broker',
        version: '2.0.14-openssl',
        description: 'Mosquitto MQTT broker',
        author: 'alex@flecs.tech',
        category: ['communication'],
        image: 'eclipse-mosquitto',
        multiInstance: false,
        volumes: ['data:/mosquitto/data/', 'log:/mosquitto/log/'],
        ports: ['1883:1883', '9001:9001']
      }, {
        'Access-Control-Allow-Origin': '*',
        'Content-type': 'application/yaml'
      })

    const testSideload = new PutSideloadAppAPI()
    await testSideload.sideloadApp('')

    expect(testSideload.state.success).toBeTruthy()
    expect(testSideload.state.responseData.app).toBe('org.eclipse.mosquitto')
  })

  test('calls PutSideloadAppAPI with unsuccessfull response', async () => {
    nock('http://localhost')
      .put('/api/SideloadApp')
      .reply(405, {
        'Access-Control-Allow-Origin': '*',
        'Content-type': 'application/json'
      })

    const testSideload = new PutSideloadAppAPI()
    await testSideload.sideloadApp('')

    expect(testSideload.state.success).toBeFalsy()
    const errorMsg = testSideload.state.errorMessage.message
    expect(errorMsg).toBe('HTTP status: 405 additional info: undefined')
  })
})
