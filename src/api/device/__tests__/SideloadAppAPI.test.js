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

import PostSideloadAppAPI from '../SideloadAppAPI'
import { DeviceAPIConfiguration } from '../../api-config'

describe('PostSideloadAppAPI', () => {
  beforeEach(() => {
    nock.disableNetConnect()
    nock.enableNetConnect('127.0.0.1')
  })
  afterEach(() => {
    nock.cleanAll()
    nock.enableNetConnect()
  })
  test('calls PostSideloadAppAPI with success response', async () => {
    nock('http://localhost')
      .post(DeviceAPIConfiguration.DEVICE_BASE_ROUTE + DeviceAPIConfiguration.APP_ROUTE + DeviceAPIConfiguration.POST_SIDELOAD_APP)
      .reply(202, {
        jobId: 1
      })

    const testSideload = new PostSideloadAppAPI()
    await testSideload.sideloadApp('yaml', 'key')

    expect(testSideload.state.success).toBeTruthy()
    expect(testSideload.state.responseData.jobId).toBe(1)
  })

  test('calls PostSideloadAppAPI with unsuccessful response', async () => {
    nock('http://localhost')
      .post(DeviceAPIConfiguration.DEVICE_BASE_ROUTE + DeviceAPIConfiguration.APP_ROUTE + DeviceAPIConfiguration.POST_SIDELOAD_APP)
      .reply(405, {
        'Access-Control-Allow-Origin': '*',
        'Content-type': 'application/json'
      })

    const testSideload = new PostSideloadAppAPI()
    await testSideload.sideloadApp('yaml', 'key')

    expect(testSideload.state.success).toBeFalsy()
    const errorMsg = testSideload.state.errorMessage.message
    expect(errorMsg).toBe('HTTP status: 405 additional info: undefined')
  })
})
