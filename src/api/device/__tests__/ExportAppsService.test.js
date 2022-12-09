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
import { getExportApps } from '../ExportAppsService'

jest.mock('axios')

const mockPostImportApps = {
  data: {
    additionalInfo: 'Ok'
  }
}

describe('ExportAppsService', () => {
  beforeAll(() => {
    axios.get = jest.fn()
  })

  afterAll(() => {
    jest.resetAllMocks()
  })
  test('calls successfull getExportApps', async () => {
    axios.get.mockResolvedValueOnce(mockPostImportApps)
    const response = await waitFor(() => getExportApps())

    expect(response.additionalInfo).toBe(mockPostImportApps.data.additionalInfo)
  })

  test('calls unsuccessfull getExportApps', async () => {
    axios.get.mockRejectedValueOnce(new Error('Failed to export apps.'))
    await act(async () => {
      expect(getExportApps()).rejects.toThrowError()
    })
  })
})
