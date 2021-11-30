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
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import Card from './Card'

describe('Card', () => {
  test('renders Card component', () => {
    render(<Card />)

    // screen.debug()
  })

  test('Click request', async () => {
    render(<Card />)

    fireEvent.click(screen.getByLabelText('app-request-button'))

    // todo: add what to expect
    // expect(screen.getByText("Profile")).toBeVisible();

    // screen.debug()
  })

  test('Click install', async () => {
    render(<Card
      app= 'Testapp'
      avatar= ''
      name= 'Test App Name'
      author= 'Test App author'
      version= 'Test App Version'
      description= 'Test App Description'
      status= 'uninstalled'
      availability='avialable'
      instances={[]} />)

    fireEvent.click(screen.getByLabelText('install-app-button'))

    // expect(screen.getByText("Profile")).toBeVisible();

    // screen.debug()
  })

  test('Click uninstall', async () => {
    render(<Card />)

    fireEvent.click(screen.getByLabelText('uninstall-app-button'))

    // todo: add what to expect
    // expect(screen.getByText("Profile")).toBeVisible();

    // screen.debug()
  })
})
