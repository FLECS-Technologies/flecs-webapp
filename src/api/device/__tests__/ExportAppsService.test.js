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
import '@testing-library/dom'
import { waitFor } from '@testing-library/react'
import { act } from 'react-dom/test-utils'
import axios from 'axios'
import { downloadExport, getDownloadExport, getExports, postExportApps } from '../ExportAppsService'

jest.mock('axios')

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

  test('calls successfull postExportApps', async () => {
    axios.post.mockResolvedValueOnce('wonderful')
    await waitFor(() => postExportApps())
  })

  test('calls unsuccessfull postExportApps', async () => {
    axios.post.mockRejectedValueOnce(new Error('Failed to export apps.'))
    await act(async () => {
      expect(postExportApps()).rejects.toThrowError()
    })
  })

  test('calls successfull getExports', async () => {
    axios.get.mockResolvedValueOnce(mockGetExports)
    const response = await waitFor(() => getExports())

    expect(response.exports).toBe(mockGetExports.data.exports)
  })

  test('calls unsuccessfull getExports', async () => {
    axios.get.mockRejectedValueOnce(new Error('Failed to list all exports.'))
    await act(async () => {
      expect(getExports()).rejects.toThrowError()
    })
  })

  test('calls successfull getDownloadExport', async () => {
    axios.get.mockResolvedValueOnce(new Blob())
    await waitFor(() => getDownloadExport('latest'))
  })

  test('calls unsuccessfull getDownloadExport', async () => {
    axios.get.mockRejectedValueOnce(new Error('Failed to download an export.'))
    await act(async () => {
      expect(getDownloadExport()).rejects.toThrowError()
    })
  })

  test('calls successfull downloadExport', async () => {
    axios.post.mockResolvedValueOnce('wonderful')
    axios.get.mockResolvedValueOnce(mockGetExports)
    axios.get.mockResolvedValueOnce(new Blob())
    await waitFor(() => downloadExport('latest'))
  })

  test('calls unsuccessfull downloadExport', async () => {
    axios.post.mockRejectedValueOnce(new Error('Failed to export apps.'))
    await act(async () => {
      expect(downloadExport()).rejects.toThrowError()
    })
  })
})
