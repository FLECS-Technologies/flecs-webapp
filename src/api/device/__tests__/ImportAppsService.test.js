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
import { postImportApps } from '../ImportAppsService'

jest.mock('axios')

const mockPostImportApps = {
  data: {
    additionalInfo: 'Ok'
  }
}

describe('ImportAppsService', () => {
  beforeAll(() => {
    axios.get = jest.fn()
  })

  afterAll(() => {
    jest.resetAllMocks()
  })
  test('calls successfull postImportApps', async () => {
    axios.post.mockResolvedValueOnce(mockPostImportApps)
    const file = new File([], 'flecs-export.tar')
    const response = await waitFor(() => postImportApps(file))

    expect(response.additionalInfo).toBe(mockPostImportApps.data.additionalInfo)
  })

  test('calls unsuccessfull postImportApps', async () => {
    axios.post.mockRejectedValueOnce(new Error('Failed to import apps.'))
    await act(async () => {
      expect(postImportApps()).rejects.toThrowError()
    })
  })
})
