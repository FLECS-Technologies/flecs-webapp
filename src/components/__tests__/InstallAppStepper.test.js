/*
 * Copyright (c) 2022 FLECS Technologies GmbH
 *
 * Created on Fri Feb 04 2022
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
import { render, fireEvent, waitFor, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import InstallAppStepper from '../InstallAppStepper'
import { act } from 'react-dom/test-utils'

jest.mock('../../api/marketplace/LicenseService')

describe('Test InstallAppStepper', () => {
  beforeAll(() => {

  })

  afterAll(() => {
    jest.restoreAllMocks()
  })

  test('renders InstallAppStepper component', async () => {
    await act(async () => {
      render(<InstallAppStepper />)
    })
    const stepper = screen.getByTestId('install-app-stepper')

    expect(stepper).toBeVisible()
  })

  test('renders InstallAppStepper component for sideload', async () => {
    await act(async () => {
      render(<InstallAppStepper sideload={true}/>)
    })
    const stepper = screen.getByTestId('install-app-stepper')

    expect(stepper).toBeVisible()
  })

  test('renders InstallAppStepper component for update', async () => {
    await act(async () => {
      render(<InstallAppStepper update={true}/>)
    })
    const stepper = screen.getByTestId('install-app-stepper')

    expect(stepper).toBeVisible()
  })

  test('one step forward, one step back', async () => {
    await act(async () => {
      render(<InstallAppStepper />)
    })
    await screen.findByText('3 Tickets available.')
    const stepper = screen.getByTestId('install-app-stepper')

    expect(stepper).toBeVisible()

    const nextButton = screen.getByTestId('next-button')
    const backButton = screen.getByTestId('back-button')
    let selectTicket = screen.getByTestId('select-ticket-step')
    expect(nextButton).toBeEnabled()
    expect(backButton).toBeDisabled()
    expect(selectTicket).toBeVisible()

    // next step
    await act(async () => { fireEvent.click(nextButton) })

    const installApp = await waitFor(() => screen.getByTestId('install-app-step'))

    expect(nextButton).toBeDisabled()
    expect(backButton).toBeEnabled()
    expect(installApp).toBeVisible()

    // step back
    await act(async () => { fireEvent.click(backButton) })

    selectTicket = await waitFor(() => screen.getByTestId('select-ticket-step'))

    expect(screen.getByTestId('next-button')).toBeEnabled()
    expect(screen.getByTestId('back-button')).toBeDisabled()
    expect(screen.getByTestId('select-ticket-step')).toBeVisible()
  })
})
