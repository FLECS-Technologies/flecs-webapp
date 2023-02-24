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
import { getInstanceLog, getLog } from '../InstanceLogService'

jest.mock('axios')

const mockLog = {
  data: {
    additionalInfo: '',
    log: 'This is the log...'
  }
}

describe('InstanceLogService', () => {
  beforeAll(() => {
    axios.post = jest.fn()
  })

  afterAll(() => {
    jest.resetAllMocks()
  })
  test('calls successfull getInstanceLog', async () => {
    axios.get.mockResolvedValueOnce(mockLog)
    const response = await waitFor(() => getInstanceLog('abcd'))

    expect(response.log).toBe(mockLog.data.log)
  })

  test('calls unsuccessfull getInstanceLog', async () => {
    axios.get.mockRejectedValueOnce(new Error('Failed to load instance log'))
    await act(async () => {
      expect(getInstanceLog('abcd')).rejects.toThrowError()
    })
  })

  test('Get log from the response', () => {
    const log = getLog(mockLog.data)
    expect(log).toBe('--- stdout\n\n' + mockLog.data.stdout + '--- stderr\n\n' + mockLog.data.stderr)
  })
})
