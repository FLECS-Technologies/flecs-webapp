/*
 * Copyright (c) 2022 FLECS Technologies GmbH
 *
 * Created on Mon Apr 29 2024
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
import { fetchEnvironments, putEnvironments } from '../environment'

jest.mock('axios')

describe('environment API', () => {
  const instanceId = 'test-instance-id'
  const mockEnvs = { data: ['ENV_VAR=1', 'ENV_VAR=2'] }
  beforeAll(() => {
    axios.get = jest.fn()
    axios.put = jest.fn()
  })

  afterAll(() => {
    jest.clearAllMocks()
  })
  test('calls successful fetchEnvironments', async () => {
    axios.get.mockResolvedValueOnce(mockEnvs)
    const response = await waitFor(() => fetchEnvironments(instanceId))

    expect(response).toBe(mockEnvs.data)
  })

  test('calls unsuccessful fetchEnvironments', async () => {
    axios.get.mockRejectedValueOnce(new Error('fetchEnvironment failed'))
    await act(async () => {
      expect(fetchEnvironments()).rejects.toThrowError()
    })
  })

  test('calls successful putEnvironments', async () => {
    axios.put.mockResolvedValueOnce()
    const response = await waitFor(() =>
      putEnvironments(instanceId, mockEnvs.data)
    )

    expect(response).toBe(undefined)
  })

  test('calls unsuccessful fetchEnvironments', async () => {
    axios.put.mockRejectedValueOnce(new Error('putEnvironment failed'))
    await act(async () => {
      expect(putEnvironments(instanceId, mockEnvs.data)).rejects.toThrowError()
    })
  })
})
