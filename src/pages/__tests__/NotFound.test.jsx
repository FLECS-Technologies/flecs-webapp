/*
 * Copyright (c) 2022 FLECS Technologies GmbH
 *
 * Created on Tue Jan 04 2022
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
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import NotFound from '../NotFound'
import { BrowserRouter as Router } from 'react-router-dom'

describe('NotFound', () => {
  test('renders NotFound page', () => {
    render(<Router><NotFound /></Router>)

    expect(screen.getByLabelText('404')).toBeVisible()
    expect(screen.getByLabelText('sorry')).toBeVisible()
    expect(screen.getByLabelText('take-me-back')).toBeVisible()
  })
})
