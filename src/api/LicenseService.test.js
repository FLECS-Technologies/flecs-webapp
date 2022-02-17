/*
 * Copyright (c) 2022 FLECS Technologies GmbH
 *
 * Created on Thu Feb 17 2022
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
import axios from 'axios'
import { getCurrentUserLicenses } from './LicenseService'

jest.mock('axios')

const mockLicenses = {
  data:
    {
      response: {
        licenses: [1, 2, 3]
      }
    }
}

describe('LicenseService', () => {
  beforeEach(() => {

  })

  afterAll(() => {
    jest.resetAllMocks()
  })
  test('calls successfull getCurrentUserLicenses', async () => {
    axios.post.mockResolvedValueOnce(mockLicenses)
    const licenses = await waitFor(() => getCurrentUserLicenses())

    expect(licenses).toHaveLength(3)
  })

  test('calls unsuccessfull getCurrentUserLicenses', async () => {
    axios.post.mockResolvedValueOnce(mockLicenses)
    const licenses = await waitFor(() => getCurrentUserLicenses())

    expect(licenses).toHaveLength(3)
  })
})
