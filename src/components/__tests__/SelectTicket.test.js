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
import SelectTicket from '../SelectTicket'
import { addToCart } from '../../api/Cart'
import { act } from 'react-dom/test-utils'

jest.mock('../../api/LicenseService')
jest.mock('../../api/Cart', () => ({
  ...jest.requireActual('../../api/Cart'),
  addToCart: jest.fn()
}))

const setTickets = jest.fn()
const tickets = [1, 2, 3]

describe('Test SelectTicket', () => {
  beforeAll(() => {
  })

  afterAll(() => {
    jest.resetAllMocks()
  })
  test('renders SelectTicket component', async () => {
    await act(async () => {
      render(<SelectTicket setTickets={setTickets} tickets={tickets}/>)
    })
    const selectTicket = screen.getByTestId('select-ticket-step')
    expect(selectTicket).toBeVisible()
  })

  test('Click on the open-cart card', async () => {
    const closeSpy = jest.fn()
    const noTickets = []
    window.open = jest.fn().mockReturnValue({ close: closeSpy })

    addToCart.mockReturnValue(Promise.resolve('my-cart-key'))
    await act(async () => {
      render(<SelectTicket setTickets={setTickets} tickets={noTickets}/>)
    })
    const openCartCard = screen.getByTestId('open-cart-card-action')
    await act(async () => { fireEvent.click(openCartCard) })

    await waitFor(() => expect(screen.getByTestId('open-cart-card-action')).toBeEnabled())
    expect(window.open).toHaveBeenCalled()
  })

  test('Failed to load cart', async () => {
    const closeSpy = jest.fn()
    const noTickets = []
    window.open = jest.fn().mockReturnValue({ close: closeSpy })
    addToCart.mockRejectedValue(new Error('failed to load cart'))
    await act(async () => {
      render(<SelectTicket setTickets={setTickets} tickets={noTickets}/>)
    })
    const openCartCard = screen.getByTestId('open-cart-card-action')
    await act(async () => { fireEvent.click(openCartCard) })
    await waitFor(() => expect(screen.getByTestId('open-cart-card-action')).toBeEnabled())
    expect(window.open).not.toHaveBeenCalled()
  })
})
