/*
 * Copyright (c) 2022 FLECS Technologies GmbH
 *
 * Created on Fri Dec 09 2022
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
import '@testing-library/dom'
import { postImportApps } from '../ImportAppsService'
import { DeviceAPIConfiguration } from '../../api-config'

describe('ImportAppsService', () => {
  beforeAll(() => {})

  afterAll(() => {
    jest.clearAllMocks()
  })

  test('calls successful postImportApps', async () => {
    nock('http://localhost')
      .post(
        DeviceAPIConfiguration.DEVICE_BASE_ROUTE +
          DeviceAPIConfiguration.POST_IMPORT_URL
      )
      .reply(202, {
        jobId: 1
      })

    const file = new File([], 'flecs-export.tar')
    const fileName = 'flecs-export.tar'
    const response = await postImportApps(file, fileName)
    expect(JSON.parse(response).jobId).toBe(1)
  })

  test('calls unsuccessful postImportApps', async () => {
    nock('http://localhost')
      .post(
        DeviceAPIConfiguration.DEVICE_BASE_ROUTE +
          DeviceAPIConfiguration.POST_IMPORT_URL
      )
      .reply(400, {})

    expect(postImportApps()).rejects.toThrowError()
  })
})
