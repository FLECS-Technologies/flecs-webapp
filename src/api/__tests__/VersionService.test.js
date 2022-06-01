/*
 * Copyright (c) 2022 FLECS Technologies GmbH
 *
 * Created on Wed Jun 01 2022
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
import { getVersion } from '../VersionService'

jest.mock('axios')

const mockVersion = {
  data: {
    core: '1.1.0-porpoise-475591c'
  }
}

describe('VersionService', () => {
  beforeAll(() => {
    axios.get = jest.fn()
  })

  afterAll(() => {
    jest.resetAllMocks()
  })
  test('calls successfull getVersion', async () => {
    axios.get.mockResolvedValueOnce(mockVersion)
    const version = await waitFor(() => getVersion())

    expect(version.core).toBe(mockVersion.data.core)
  })

  test('calls unsuccessfull getVersion', async () => {
    axios.get.mockRejectedValueOnce(new Error('Failed to load config details'))
    await act(async () => {
      expect(getVersion()).rejects.toThrowError()
    })
  })
})
