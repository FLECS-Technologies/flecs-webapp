/*
 * Copyright (c) 2022 FLECS Technologies GmbH
 *
 * Created on Wed Jan 12 2022
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
import { render, screen, fireEvent, within, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import { BrowserRouter as Router } from 'react-router-dom'
import Login from '../Login'
import { DeviceAPIConfiguration, MarketplaceAPIConfiguration } from '../../api/api-config'
import axios from 'axios'
import { useAuth } from '../../components/AuthProvider'

jest.mock('axios')
jest.mock('../../components/AuthProvider', () => ({ useAuth: jest.fn() }))

describe('Login', () => {
  const homer = {
    user: {
      data: {
        ID: 4,
        user_login: 'homer-simpson',
        user_nicename: 'Homer Simpson',
        display_name: 'Homer Simpson',
        user_url: '',
        user_email: 'homer-simpson@springfield.io',
        user_registered: '2022-01-13 08:43:14'
      },
      redirect: null,
      jwt: {
        token: 'supersafetoken',
        token_expires: 1642255418
      }
    },
    setUser: jest.fn()
  }

  afterAll(() => {
    jest.resetAllMocks()
  })

  test('renders Login page', () => {
    render(<Router><Login /></Router>)

    expect(screen.getByLabelText('user-name')).toBeVisible()
    expect(screen.getByLabelText('password')).toBeVisible()
    expect(screen.getByLabelText('login-button')).toBeVisible()
    expect(screen.getByLabelText('create-account-link')).toBeVisible()
    expect(screen.getByLabelText('forgot-password-link')).toBeVisible()
    expect(screen.getByLabelText('privacy-policy-link')).toBeVisible()
  })

  test('Enter Username', () => {
    const { getByLabelText } = render(<Router><Login /></Router>)

    const goButton = getByLabelText('login-button')
    const userInput = getByLabelText('user-name')
    const input = within(userInput).getByRole('textbox')

    fireEvent.change(input, { target: { value: 'Homer' } })

    expect(goButton).toBeDisabled()
  })

  test('Enter Password', () => {
    const { getByLabelText } = render(<Router><Login /></Router>)

    const goButton = getByLabelText('login-button')
    const passwordInput = getByLabelText('password-input')
    userEvent.type(passwordInput, 'pass1234')

    expect(goButton).toBeDisabled()
  })

  test('Show Password', () => {
    const { getByLabelText } = render(<Router><Login /></Router>)

    const goButton = getByLabelText('login-button')
    const showPassword = getByLabelText('toggle password visibility')
    const passwordInput = getByLabelText('password-input')
    userEvent.type(passwordInput, 'pass1234')

    expect(goButton).toBeDisabled()
    expect(showPassword).toBeEnabled()

    fireEvent.mouseDown(showPassword)
    fireEvent.click(showPassword)
  })

  test('Enter Username and Password', () => {
    const { getByLabelText } = render(<Router><Login /></Router>)

    const goButton = getByLabelText('login-button')
    const passwordInput = getByLabelText('password-input')
    const userInput = getByLabelText('user-name')
    const input = within(userInput).getByRole('textbox')

    fireEvent.change(input, { target: { value: 'Homer' } })
    userEvent.type(passwordInput, 'pass1234')

    expect(goButton).toBeEnabled()
  })

  test('Successfull Login', async () => {
    axios.post.mockResolvedValueOnce(homer)
    axios.post.mockResolvedValueOnce()
    useAuth.mockReturnValue(homer)
    const { getByLabelText } = render(<Router><Login /></Router>)

    const goButton = getByLabelText('login-button')
    const passwordInput = getByLabelText('password-input')
    const userInput = getByLabelText('user-name')
    const input = within(userInput).getByRole('textbox')

    fireEvent.change(input, { target: { value: 'homer-simpson' } })
    userEvent.type(passwordInput, 'pass1234')

    expect(goButton).toBeEnabled()
    fireEvent.click(goButton)

    await waitFor(() => getByLabelText('message'))
    const message = getByLabelText('message')

    expect(message).toHaveTextContent('Successfully logged in!')
    expect(axios.post).toHaveBeenCalledTimes(2)
    expect(axios.post).toHaveBeenCalledWith(MarketplaceAPIConfiguration.BETA_BASE_URL + MarketplaceAPIConfiguration.POST_AUTHENTICATE_URL, { issueJWT: true, password: 'pass1234', username: 'homer-simpson' })
    expect(axios.post).toHaveBeenCalledWith(DeviceAPIConfiguration.DEVICE_ROUTE + DeviceAPIConfiguration.MARKETPLACE_ROUTE + DeviceAPIConfiguration.POST_MP_LOGIN_URL, { user: undefined, token: undefined })
  })

  test('Unsuccessfull Login', async () => {
    axios.post.mockRejectedValueOnce(new Error('Failed to login'))
    const { getByLabelText } = render(<Router><Login /></Router>)

    const goButton = getByLabelText('login-button')
    const passwordInput = getByLabelText('password-input')
    const userInput = getByLabelText('user-name')
    const input = within(userInput).getByRole('textbox')

    fireEvent.change(input, { target: { value: 'homer-simpson' } })
    userEvent.type(passwordInput, 'pass1234')

    expect(goButton).toBeEnabled()
    fireEvent.click(goButton)

    await waitFor(() => getByLabelText('message'))
    const message = getByLabelText('message')

    expect(message).toHaveTextContent('Failed to login')
    expect(axios.post).toHaveBeenCalledWith(MarketplaceAPIConfiguration.BETA_BASE_URL + MarketplaceAPIConfiguration.POST_AUTHENTICATE_URL, { issueJWT: true, password: 'pass1234', username: 'homer-simpson' })
  })
})
