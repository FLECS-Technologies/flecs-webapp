/*
 * Copyright (c) 2022 FLECS Technologies GmbH
 *
 * Created on Tue May 03 2022
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
import { getInstanceConfig, putInstanceConfig } from '../InstanceConfigService'

jest.mock('axios')

const mockConfig = {
  data: {
    nicConfig: [{
      nic: 'eth0',
      enabled: false
    },
    {
      nic: 'eth1',
      enabled: true
    }]
  }
}

describe('InstanceConfigService', () => {
  beforeAll(() => {
    axios.post = jest.fn()
    axios.put = jest.fn()
  })

  afterAll(() => {
    jest.resetAllMocks()
  })
  test('calls successfull getInstanceConfig', async () => {
    axios.post.mockResolvedValueOnce(mockConfig)
    const details = await waitFor(() => getInstanceConfig('InstanceId'))

    expect(details.nicConfig).toHaveLength(2)
  })

  test('calls unsuccessfull getInstanceConfig', async () => {
    axios.post.mockRejectedValueOnce(new Error('Failed to load config details'))
    await act(async () => {
      expect(getInstanceConfig('InstanceId')).rejects.toThrowError()
    })
  })

  test('calls successfull putInstanceConfig', async () => {
    axios.put.mockResolvedValueOnce(mockConfig)
    const details = await waitFor(() => putInstanceConfig('InstanceId'))

    expect(details.nicConfig).toHaveLength(2)
  })

  test('calls unsuccessfull putInstanceConfig', async () => {
    axios.put.mockRejectedValueOnce(new Error('Failed to save config details'))
    await act(async () => {
      expect(putInstanceConfig('InstanceId')).rejects.toThrowError()
    })
  })
})
