/*
 * Copyright (c) 2022 FLECS Technologies GmbH
 *
 * Created on Fri Feb 21 2023
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
import '@testing-library/jest-dom'
import { JobsContextProvider } from '../JobsContext'

const mockJobs = [
  {
    id: 1,
    description: 'Went fishing',
    status: 'successful'
  },
  {
    id: 2,
    description: 'Do the laundry',
    status: 'failed'
  },
  {
    id: 3,
    description: 'Repair sink',
    status: 'pending'
  },
  {
    id: 4,
    description: 'Drive home',
    status: 'running'
  }
]

jest.mock('react', () => {
  const ActualReact = jest.requireActual('react')
  return {
    ...ActualReact,
    useContext: () => ({ mockJobs }) // what you want to return when useContext get fired goes here
  }
})

describe('JobsContextProvider', () => {
  afterAll(() => {
    jest.clearAllMocks()
  })
  test('renders JobsContextProvider component', () => {
    render(<JobsContextProvider />)
  })
})
