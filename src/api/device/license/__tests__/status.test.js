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
import { ValidateDeviceAPI } from '../status'
import { mockValidateDeviceAPIResponse } from '../__mocks__/status'

jest.mock('axios')

describe('ValidateDeviceAPI', () => {
  beforeAll(() => {
    axios.get = jest.fn()
  })

  afterAll(() => {
    jest.clearAllMocks()
  })
  test('calls successful ValidateDeviceAPI', async () => {
    axios.get.mockResolvedValueOnce(mockValidateDeviceAPIResponse)
    const response = await waitFor(() => ValidateDeviceAPI())

    expect(response.isValid).toBe(mockValidateDeviceAPIResponse.data.isValid)
  })

  test('calls unsuccessful ValidateDeviceAPI', async () => {
    axios.get.mockRejectedValueOnce(new Error('Activation failed'))
    await act(async () => {
      expect(ValidateDeviceAPI()).rejects.toThrowError()
    })
  })
})
