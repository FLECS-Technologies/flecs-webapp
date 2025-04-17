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
import { SystemPing } from '../SystemPingService'

jest.mock('axios')

const mockPing = {
  data: {
    additionalInfo: 'Ok'
  }
}

describe('SystemPing', () => {
  beforeAll(() => {
    axios.get = jest.fn()
  })

  afterAll(() => {
    jest.clearAllMocks()
  })
  test('calls successful SystemPing', async () => {
    axios.get.mockResolvedValueOnce(mockPing)
    const response = await waitFor(() => SystemPing())

    expect(response.additionalInfo).toBe(mockPing.data.additionalInfo)
  })

  test('calls unsuccessful SystemPing', async () => {
    axios.get.mockRejectedValueOnce(new Error('Failed to ping'))
    await act(async () => {
      expect(SystemPing()).rejects.toThrowError()
    })
  })
})
