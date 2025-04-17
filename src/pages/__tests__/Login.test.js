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
import { act, render, screen, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import { BrowserRouter as Router } from 'react-router-dom'
import Login from '../Login'
import {
  DeviceAPIConfiguration,
  MarketplaceAPIConfiguration
} from '../../api/api-config'
import axios from 'axios'
import { useAuth } from '../../components/AuthProvider'

jest.mock('axios')
jest.mock('../../components/AuthProvider', () => ({ useAuth: jest.fn() }))

describe('Login', () => {
  const homer = {
    statusCode: 200,
    data: {
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
      }
    },
    setUser: jest.fn()
  }

  afterAll(() => {
    jest.clearAllMocks()
  })

  test('renders Login page', async () => {
    await act(async () => {
      render(
        <Router>
          <Login />
        </Router>
      )
    })

    expect(screen.getByLabelText('user-name')).toBeVisible()
    expect(screen.getByLabelText('password')).toBeVisible()
    expect(screen.getByLabelText('login-button')).toBeVisible()
    expect(screen.getByLabelText('create-account-link')).toBeVisible()
    expect(screen.getByLabelText('forgot-password-link')).toBeVisible()
    expect(screen.getByLabelText('privacy-policy-link')).toBeVisible()
  })

  test('Enter Username', async () => {
    const user = userEvent.setup()
    await act(async () => {
      render(
        <Router>
          <Login />
        </Router>
      )
    })

    const goButton = screen.getByLabelText('login-button')

    // enter user
    await user.keyboard('Homer')
    // move to password field
    await user.keyboard('{Tab}')
    // delete password
    await user.keyboard('{Backspace}')

    expect(goButton).toBeDisabled()
  })

  test('Enter Password', async () => {
    const user = userEvent.setup()
    await act(async () => {
      render(
        <Router>
          <Login />
        </Router>
      )
    })

    const goButton = screen.getByLabelText('login-button')

    // delete the user
    await user.keyboard('{Backspace}')
    // move to password field
    await user.keyboard('{Tab}')
    // enter password
    await user.keyboard('pass1234')

    expect(goButton).toBeDisabled()
    screen.debug()
  })

  test('Show Password', async () => {
    const user = userEvent.setup()
    await act(async () => {
      render(
        <Router>
          <Login />
        </Router>
      )
    })

    const showPassword = screen.getByLabelText('toggle password visibility')

    // move to password field
    await user.keyboard('{Tab}')
    // enter password
    await user.keyboard('pass1234')

    expect(showPassword).toBeEnabled()

    await user.click(showPassword)
  })

  test('Enter Username and Password', async () => {
    const user = userEvent.setup()
    await act(async () => {
      render(
        <Router>
          <Login />
        </Router>
      )
    })

    const goButton = screen.getByLabelText('login-button')

    // enter user
    await user.keyboard('Homer')
    // move to password field
    await user.keyboard('{Tab}')
    // enter password
    await user.keyboard('pass1234')

    expect(goButton).toBeEnabled()
  })

  test('Successful Login', async () => {
    axios.post.mockResolvedValueOnce(homer)
    axios.put.mockResolvedValueOnce()
    useAuth.mockReturnValue(homer)
    const user = userEvent.setup()
    await act(async () => {
      render(
        <Router>
          <Login />
        </Router>
      )
    })

    const goButton = screen.getByLabelText('login-button')

    // enter user
    await user.keyboard('homer-simpson')
    // move to password field
    await user.keyboard('{Tab}')
    // enter password
    await user.keyboard('pass1234')

    expect(goButton).toBeEnabled()
    await act(async () => {
      user.click(goButton)
    })

    await waitFor(() => screen.getByLabelText('message'))
    const message = screen.getByLabelText('message')

    expect(message).toHaveTextContent('Successfully logged in!')
    expect(axios.post).toHaveBeenCalledTimes(1)
    expect(axios.put).toHaveBeenCalledTimes(1)
    expect(axios.post).toHaveBeenCalledWith(
      MarketplaceAPIConfiguration.MP_PROXY_URL +
        MarketplaceAPIConfiguration.POST_AUTHENTICATE_URL,
      { issueJWT: true, password: 'pass1234', username: 'homer-simpson' }
    )
    expect(axios.put).toHaveBeenCalledWith(
      DeviceAPIConfiguration.DEVICE_BASE_ROUTE +
        DeviceAPIConfiguration.CONSOLE_ROUTE +
        DeviceAPIConfiguration.PUT_CONSOLE_AUTH_URL,
      null
    )
  })

  test('Unsuccessful Login', async () => {
    axios.post.mockRejectedValueOnce(new Error('Failed to login'))
    const user = userEvent.setup()
    await act(async () => {
      render(
        <Router>
          <Login />
        </Router>
      )
    })

    const goButton = screen.getByLabelText('login-button')

    // enter user
    await user.keyboard('homer-simpson')
    // move to password field
    await user.keyboard('{Tab}')
    // enter password
    await user.keyboard('pass1234')

    expect(goButton).toBeEnabled()

    await user.click(goButton)

    await waitFor(() => screen.getByLabelText('message'))
    const message = screen.getByLabelText('message')

    expect(message).toHaveTextContent('Failed to login')
    expect(axios.post).toHaveBeenCalledWith(
      MarketplaceAPIConfiguration.MP_PROXY_URL +
        MarketplaceAPIConfiguration.POST_AUTHENTICATE_URL,
      { issueJWT: true, password: 'pass1234', username: 'homer-simpson' }
    )
  })
})
