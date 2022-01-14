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
import { render, screen, fireEvent, within } from '@testing-library/react'
import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import { BrowserRouter as Router } from 'react-router-dom'
import Login from './Login'
import nock from 'nock'

describe('Login', () => {
  beforeEach(() => {
    nock.disableNetConnect()
    nock.enableNetConnect('127.0.0.1')
  })
  afterEach(() => {
    nock.cleanAll()
    nock.enableNetConnect()
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

  test('Login', () => {
    const { getByLabelText } = render(<Router><Login /></Router>)

    const goButton = getByLabelText('login-button')
    const passwordInput = getByLabelText('password-input')
    const userInput = getByLabelText('user-name')
    const input = within(userInput).getByRole('textbox')

    fireEvent.change(input, { target: { value: 'Homer' } })
    userEvent.type(passwordInput, 'pass1234')

    expect(goButton).toBeEnabled()
    fireEvent.click(goButton)
  })
})
