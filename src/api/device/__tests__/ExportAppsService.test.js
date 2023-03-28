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
import { waitFor } from '@testing-library/react'
import { act } from 'react-dom/test-utils'
import axios from 'axios'
import { ExportApps, downloadExport, getDownloadExport, getExports } from '../ExportAppsService'
import { DeviceAPIConfiguration } from '../../api-config'

jest.mock('axios')
jest.mock('../JobsAPI.js')

const mockGetExports = {
  data: {
    exports: ['latest', 'mid', 'oldest']
  }
}

describe('ExportAppsService', () => {
  beforeAll(() => {
    axios.post = jest.fn()
    axios.get = jest.fn()
  })

  afterAll(() => {
    jest.resetAllMocks()
  })

  test('calls successful postExportApps', async () => {
    nock('http://localhost')
      .post(DeviceAPIConfiguration.DEVICE_ROUTE + DeviceAPIConfiguration.POST_EXPORT_URL)
      .reply(202, {
        jobId: 1
      })

    const exportApps = new ExportApps()
    await exportApps.postExportApps()
    const jobId = exportApps.state.responseData.jobId
    expect(jobId).toBe(1)
  })

  test('calls unsuccessful postExportApps', async () => {
    nock('http://localhost')
      .post(DeviceAPIConfiguration.DEVICE_ROUTE + DeviceAPIConfiguration.POST_EXPORT_URL)
      .reply(400, {})

    const exportApps = new ExportApps()
    await exportApps.postExportApps()
    expect(exportApps.state.responseData).toBe(null)
  })

  test('calls successful getExports', async () => {
    axios.get.mockResolvedValueOnce(mockGetExports)
    const response = await waitFor(() => getExports())
    expect(response.exports).toBe(mockGetExports.data.exports)
  })

  test('calls unsuccessful getExports', async () => {
    axios.get.mockRejectedValueOnce(new Error('Failed to list all exports.'))
    await act(async () => {
      expect(getExports()).rejects.toThrowError()
    })
  })

  test('calls successful getDownloadExport', async () => {
    axios.get.mockResolvedValueOnce(new Blob())
    await waitFor(() => getDownloadExport('latest'))
  })

  test('calls unsuccessful getDownloadExport', async () => {
    axios.get.mockRejectedValueOnce(new Error('Failed to download an export.'))
    await act(async () => {
      expect(getDownloadExport()).rejects.toThrowError()
    })
  })

  test('calls successful downloadExport', async () => {
    nock('http://localhost')
      .post(DeviceAPIConfiguration.DEVICE_ROUTE + DeviceAPIConfiguration.POST_EXPORT_URL)
      .reply(202, {
        jobId: 1
      })

    nock('http://localhost')
      .post(DeviceAPIConfiguration.DEVICE_ROUTE + DeviceAPIConfiguration.JOBS_ROUTE)
      .reply(200, [{ status: 'successful', result: { message: '12345678' } }])

    axios.get.mockResolvedValueOnce({ data: 'blob downloaded' })
    const answer = await downloadExport(['1'], [])
    expect(answer.blob).toBe('blob downloaded')
  })

  test('calls unsuccessful downloadExport', async () => {
    nock('http://localhost')
      .post(DeviceAPIConfiguration.DEVICE_ROUTE + DeviceAPIConfiguration.POST_EXPORT_URL)
      .reply(202, {
        jobId: 1
      })

    nock('http://localhost')
      .post(DeviceAPIConfiguration.DEVICE_ROUTE + DeviceAPIConfiguration.JOBS_ROUTE)
      .reply(200, [{ status: 'failed', result: { message: '12345678' } }])

    const answer = await downloadExport(['1'], [])
    expect(answer).toBe(undefined)
  })
})
