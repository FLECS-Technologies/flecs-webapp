/*
 * Copyright (c) 2022 FLECS Technologies GmbH
 *
 * Created on Thu Apr 07 2022
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
import { SystemInfo } from '../SystemInfoService'

jest.mock('axios')

const mockSystemInfo = {
  data: {
    platform: 'Weidmüller'
  }
}

describe('SystemInfo', () => {
  beforeAll(() => {
    axios.get = jest.fn()
  })

  afterAll(() => {
    jest.resetAllMocks()
  })
  test('calls successfull SystemInfo', async () => {
    axios.get.mockResolvedValueOnce(mockSystemInfo)
    const response = await waitFor(() => SystemInfo())

    expect(response.platform).toBe(mockSystemInfo.data.platform)
  })

  test('calls unsuccessfull SystemInfo', async () => {
    axios.post.mockRejectedValueOnce(new Error('Failed to get system info'))
    await act(async () => {
      expect(SystemInfo()).rejects.toThrowError()
    })
  })
})
