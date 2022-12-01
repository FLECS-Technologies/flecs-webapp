/*
 * Copyright (c) 2022 FLECS Technologies GmbH
 *
 * Created on Mon Apr 11 2022
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

import React from 'react'
import { render } from '@testing-library/react'
import { act } from 'react-dom/test-utils'
import '@testing-library/jest-dom'
import { SystemData } from '../SystemData'
import { useSystemContext } from '../SystemProvider'

jest.mock('../../api/device/SystemPingService')
jest.mock('../../api/device/SystemInfoService')
jest.mock('../SystemProvider', () => ({ useSystemContext: jest.fn() }))

const mockSystem = {
  ping: true,
  setPing: jest.fn(),
  loading: false,
  setLoading: jest.fn(),
  systemInfo: undefined,
  setSystemInfo: jest.fn()
}

jest.mock('react', () => {
  const ActualReact = jest.requireActual('react')
  return {
    ...ActualReact,
    useContext: () => ({ mockSystem }) // what you want to return when useContext get fired goes here
  }
})

describe('SystemData', () => {
  afterAll(() => {
    jest.clearAllMocks()
  })
  test('renders SystemData component', () => {
    useSystemContext.mockReturnValue(mockSystem)
    act(() => {
      render(<SystemData></SystemData>)
    })
  })
})
