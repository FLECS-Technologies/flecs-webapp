/*
 * Copyright (c) 2022 FLECS Technologies GmbH
 *
 * Created on Thu Oct 13 2022
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
import { UpdateAppService } from '../UpdateAppService'

jest.mock('axios')

const mockUpdateAppService = {
  data: {
    additionalInfo: 'Ok'
  }
}

describe('UpdateAppService', () => {
  beforeAll(() => {
    axios.get = jest.fn()
  })

  afterAll(() => {
    jest.resetAllMocks()
  })
  test('calls successfull UpdateAppService', async () => {
    axios.post.mockResolvedValueOnce(mockUpdateAppService)
    const response = await waitFor(() => UpdateAppService())

    expect(response.additionalInfo).toBe(mockUpdateAppService.data.additionalInfo)
  })

  test('calls unsuccessfull UpdateAppService', async () => {
    axios.post.mockRejectedValueOnce(new Error('Failed to update app'))
    await act(async () => {
      expect(UpdateAppService()).rejects.toThrowError()
    })
  })
})
