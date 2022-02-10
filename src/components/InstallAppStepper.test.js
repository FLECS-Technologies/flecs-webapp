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
import { render, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import InstallAppStepper from './InstallAppStepper'

describe('Test InstallAppStepper', () => {
  test('renders InstallAppStepper component', () => {
    const { getByTestId } = render(<InstallAppStepper />)

    const stepper = getByTestId('install-app-stepper')

    expect(stepper).toBeVisible()
  })

  test('one step forward, one step back', async () => {
    const { getByTestId } = render(<InstallAppStepper />)

    const stepper = getByTestId('install-app-stepper')

    expect(stepper).toBeVisible()

    const nextButton = getByTestId('next-button')
    const backButton = getByTestId('back-button')
    let selectTicket = getByTestId('select-ticket-step')
    expect(nextButton).toBeEnabled()
    expect(backButton).toBeDisabled()
    expect(selectTicket).toBeVisible()

    // next step
    fireEvent.click(nextButton)

    const installApp = await waitFor(() => getByTestId('install-app-step'))

    expect(nextButton).toBeDisabled()
    expect(backButton).toBeEnabled()
    expect(installApp).toBeVisible()

    // step back
    fireEvent.click(backButton)

    selectTicket = await waitFor(() => getByTestId('select-ticket-step'))

    expect(nextButton).toBeEnabled()
    expect(backButton).toBeDisabled()
    expect(selectTicket).toBeVisible()
  })
})
