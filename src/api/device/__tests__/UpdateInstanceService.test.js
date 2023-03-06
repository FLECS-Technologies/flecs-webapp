/*
 * Copyright (c) 2022 FLECS Technologies GmbH
 *
 * Created on Thu Nov 29 2022
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
import { UpdateInstanceService } from '../UpdateInstanceService'

jest.mock('axios')

const mockUpdateInstanceService = {
  data: {
    additionalInfo: 'Ok'
  }
}

describe('UpdateInstanceService', () => {
  beforeAll(() => {
    axios.get = jest.fn()
  })

  afterAll(() => {
    jest.resetAllMocks()
  })
  test('calls successful UpdateInstanceService', async () => {
    axios.patch.mockResolvedValueOnce(mockUpdateInstanceService)
    const response = await waitFor(() => UpdateInstanceService())

    expect(response.additionalInfo).toBe(mockUpdateInstanceService.data.additionalInfo)
  })

  test('calls unsuccessful UpdateInstanceService', async () => {
    axios.patch.mockRejectedValueOnce(new Error('Failed to update instance'))
    await act(async () => {
      expect(UpdateInstanceService()).rejects.toThrowError()
    })
  })
})
