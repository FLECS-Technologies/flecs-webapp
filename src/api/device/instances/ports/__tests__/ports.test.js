/*
 * Copyright (c) 2022 FLECS Technologies GmbH
 *
 * Created on Fri Jun 07 2024
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
import { fetchPorts, putPorts } from '../ports'

jest.mock('axios')

describe('port API', () => {
  const instanceId = 'test-instance-id'
  const mockPorts = { data: ['8080:80', '1880:1880'] }
  beforeAll(() => {
    axios.get = jest.fn()
    axios.put = jest.fn()
  })

  afterAll(() => {
    jest.resetAllMocks()
  })
  test('calls successful fetchPorts', async () => {
    axios.get.mockResolvedValueOnce(mockPorts)
    const response = await waitFor(() => fetchPorts(instanceId))

    expect(response).toBe(mockPorts.data)
  })

  test('calls unsuccessful fetchPorts', async () => {
    axios.get.mockRejectedValueOnce(new Error('fetchPorts failed'))
    await act(async () => {
      expect(fetchPorts()).rejects.toThrowError()
    })
  })

  test('calls successful putPorts', async () => {
    axios.put.mockResolvedValueOnce()
    const response = await waitFor(() => putPorts(instanceId, mockPorts.data))

    expect(response).toBe(undefined)
  })

  test('calls unsuccessful fetchPorts', async () => {
    axios.put.mockRejectedValueOnce(new Error('fetchPorts failed'))
    await act(async () => {
      expect(fetchPorts(instanceId, mockPorts.data)).rejects.toThrowError()
    })
  })
})
