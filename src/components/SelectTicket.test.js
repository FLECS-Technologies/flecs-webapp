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
import { render, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import SelectTicket from './SelectTicket'

describe('Test SelectTicket', () => {
  test('renders SelectTicket component', () => {
    const { getByTestId } = render(<SelectTicket />)

    const sideloadButton = getByTestId('select-ticket-step')

    expect(sideloadButton).toBeVisible()
  })

  test('Click on the open-cart card', () => {
    const { getByTestId } = render(<SelectTicket />)

    const openCartCard = getByTestId('open-cart-card-action')

    expect(openCartCard).toBeEnabled()

    fireEvent.click(openCartCard)
  })
})
