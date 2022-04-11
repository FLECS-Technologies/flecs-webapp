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
import { render /*, screen */ } from '@testing-library/react'
import '@testing-library/jest-dom'
import { SystemContextProvider } from '../SystemProvider'

const mockSystem = {
  ping: true,
  setPing: jest.fn(),
  loading: false,
  setLoading: jest.fn()
}

jest.mock('react', () => {
  const ActualReact = jest.requireActual('react')
  return {
    ...ActualReact,
    useContext: () => ({ mockSystem }) // what you want to return when useContext get fired goes here
  }
})

describe('SystemContextProvider', () => {
  afterAll(() => {
    jest.clearAllMocks()
  })
  test('renders SystemContextProvider component', () => {
    render(<SystemContextProvider />)
  })
})
