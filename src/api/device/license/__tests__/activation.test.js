/*
 * Copyright (c) 2022 FLECS Technologies GmbH
 *
 * Created on Wed Jan 31 2024
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
import { ActivateDeviceAPI } from '../activation'
import { mockActivateDeviceAPIResponse } from '../__mocks__/activation'

jest.mock('axios')

describe('ActivateDeviceAPI', () => {
  beforeAll(() => {
    axios.post = jest.fn()
  })

  afterAll(() => {
    jest.clearAllMocks()
  })
  test('calls successful ActivateDeviceAPI', async () => {
    axios.post.mockResolvedValueOnce(mockActivateDeviceAPIResponse)
    const response = await waitFor(() => ActivateDeviceAPI())

    expect(response.additionalInfo).toBe(
      mockActivateDeviceAPIResponse.data.additionalInfo
    )
  })

  test('calls unsuccessful ActivateDeviceAPI', async () => {
    axios.post.mockRejectedValueOnce(new Error('Activation failed'))
    await act(async () => {
      expect(ActivateDeviceAPI()).rejects.toThrowError()
    })
  })
})
