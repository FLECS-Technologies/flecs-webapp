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
import { UpdateAppService } from '../UpdateAppService'

jest.mock('../../api/InstallAppAPI')
jest.mock('../../api/UpdateInstanceService')

describe('UpdateAppService', () => {
  const mockInstances = [{ instanceId: '123' }, { instanceId: '456' }]
  test('calls successfull UpdateAppService', async () => {
    const response = await waitFor(() => UpdateAppService('app'))

    expect(response).toBe('App successfully updated.')
  })

  test('calls successfull UpdateAppService with instances', async () => {
    const response = await waitFor(() => UpdateAppService('app', '1.0.0', '2.0.0', 'ABC', mockInstances))

    expect(response).toHaveLength(2)
  })

  test('calls unsuccessfull UpdateAppService', async () => {
    await act(async () => {
      expect(UpdateAppService()).rejects.toThrowError()
    })
  })
})
