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
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import AppBar from './AppBar'

describe('AppBar', () => {
  test('renders AppBar component', () => {
    render(<AppBar />)

    // test if logo is there
    expect(screen.getByLabelText('FLECS-Logo')).toBeVisible()
    // test if FLECS brand name is there
    expect(screen.getByText('FLECS')).toBeVisible()
    // screen.debug()
  })

  test('Select user avatar', async () => {
    render(<AppBar />)

    fireEvent.click(screen.getByLabelText('account of current user'))

    await waitFor(() => screen.getByText('Profile'))

    expect(screen.getByText('Profile')).toBeVisible()
    expect(screen.getByText('Sign out')).toBeVisible()

    // screen.debug()
  })
})
