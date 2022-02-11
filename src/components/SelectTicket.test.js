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
import SelectTicket from './SelectTicket'
import { addToCart } from '../api/Cart'

jest.mock('../api/Cart', () => ({
  ...jest.requireActual('../api/Cart'),
  addToCart: jest.fn()
}))

describe('Test SelectTicket', () => {
  test('renders SelectTicket component', () => {
    const { getByTestId } = render(<SelectTicket />)

    const sideloadButton = getByTestId('select-ticket-step')

    expect(sideloadButton).toBeVisible()
  })

  test('Click on the open-cart card', async () => {
    const closeSpy = jest.fn()
    window.open = jest.fn().mockReturnValue({ close: closeSpy })
    addToCart.mockReturnValueOnce(Promise.resolve('my-cart-key'))
    const { getByTestId } = render(<SelectTicket />)

    const openCartCard = getByTestId('open-cart-card-action')

    expect(openCartCard).toBeEnabled()

    fireEvent.click(openCartCard)

    await waitFor(() => expect(getByTestId('open-cart-card-action')).toBeEnabled())
    expect(window.open).toHaveBeenCalled()
  })

  test('Failed to load cart', async () => {
    const closeSpy = jest.fn()
    window.open = jest.fn().mockReturnValue({ close: closeSpy })
    addToCart.mockReturnValueOnce(Promise.reject(new Error('failed to load cart')))
    const { getByTestId } = render(<SelectTicket />)

    const openCartCard = getByTestId('open-cart-card-action')

    expect(openCartCard).toBeEnabled()

    fireEvent.click(openCartCard)

    await waitFor(() => expect(getByTestId('open-cart-card-action')).toBeEnabled())
    expect(window.open).not.toHaveBeenCalled()
  })
})
