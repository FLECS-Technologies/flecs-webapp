/*
 * Copyright (c) 2021 FLECS Technologies GmbH
 *
 * Created on Tue Nov 30 2021
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
import { BrowserRouter as Router } from 'react-router-dom'
import '@testing-library/jest-dom'
import Frame from '../Frame'
import { DarkModeState } from '../ThemeHandler'
import { JobsContextProvider } from '../../data/JobsContext'

describe('Frame', () => {
  test('renders Frame component', () => {
    render(
        <Router>
            <DarkModeState>
              <JobsContextProvider>
                <Frame />
              </JobsContextProvider>
            </DarkModeState>
        </Router>
    )
    // screen.debug()
  })
})
