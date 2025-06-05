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
import { render, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter as Router } from 'react-router-dom'
import AppBar from '../AppBar'
import { DarkModeState } from '../ThemeHandler'
import { JobsContextProvider } from '../../data/JobsContext'
import { vi } from 'vitest'
import * as AuthProvider from '../AuthProvider'
import { QuestContextProvider } from '../quests/QuestContext'

// mock react-router-dom navigate
const mockedUsedNavigate = vi.fn()

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    useNavigate: () => mockedUsedNavigate,
  }
})

// mock API services
vi.mock('../../api/device/ExportAppsService.js')

// mock auth
const currentUser = {
  user: {
    user: {
      data: {
        ID: 4,
        user_login: 'development-customer',
        user_nicename: 'development-customer',
        display_name: 'development-customer',
        user_url: '',
        user_email: 'development-customer@flecs.tech',
        user_registered: '2022-01-13 08:43:14',
      },
    },
  },
  setUser: vi.fn(),
}

vi.mock('../AuthProvider', async () => {
  const actual = await vi.importActual<typeof import('../AuthProvider')>(
    '../AuthProvider'
  )
  return {
    ...actual,
    useAuth: vi.fn(),
  }
})

describe('AppBar', () => {
  afterAll(() => {
    vi.clearAllMocks()
  })

  test('renders AppBar component', () => {
    const { getByLabelText, getByText } = render(
      <Router>
        <QuestContextProvider>
          <JobsContextProvider>
            <AppBar />
          </JobsContextProvider>
        </QuestContextProvider>
      </Router>
    )

    expect(getByLabelText('logo')).toBeVisible()
    expect(getByText('FLECS')).toBeVisible()
  })

  test('Click on login', async () => {
    const { getByLabelText } = render(
      <Router>
        <QuestContextProvider>
          <JobsContextProvider>
            <AppBar />
          </JobsContextProvider>
        </QuestContextProvider>
      </Router>
    )

    const loginButton = getByLabelText('login-button')
    fireEvent.click(loginButton)

    expect(mockedUsedNavigate).toHaveBeenCalledWith('/Login')
  })

  test('Click on user menu', async () => {
    vi.spyOn(AuthProvider, 'useAuth').mockReturnValue(currentUser)

    const { getByLabelText, getByText } = render(
      <Router>
        <QuestContextProvider>
          <JobsContextProvider>
            <AppBar />
          </JobsContextProvider>
        </QuestContextProvider>
      </Router>
    )

    const userMenuButton = getByLabelText('user-menu-button')
    fireEvent.click(userMenuButton)

    await waitFor(() => getByText('Profile'))

    expect(getByText('Profile')).toBeVisible()
    expect(getByText('Sign out')).toBeVisible()

    const menu = getByLabelText('user-menu')
    fireEvent.keyDown(menu, { key: 'Escape' })
  })

  test('Click on logout', async () => {
    vi.spyOn(AuthProvider, 'useAuth').mockReturnValue(currentUser)

    const { getByLabelText, getByText } = render(
      <Router>
        <QuestContextProvider>
          <JobsContextProvider>
            <AppBar />
          </JobsContextProvider>
        </QuestContextProvider>
      </Router>
    )

    const userMenuButton = getByLabelText('user-menu-button')
    fireEvent.click(userMenuButton)

    await waitFor(() => getByText('Sign out'))

    const signOut = getByText('Sign out')
    expect(signOut).toBeVisible()

    fireEvent.click(signOut)

    expect(currentUser.setUser).toHaveBeenCalled()
  })

  test('Change theme', async () => {
    const { getByLabelText } = render(
      <DarkModeState>
        <Router>
          <QuestContextProvider>
            <JobsContextProvider>
              <AppBar />
            </JobsContextProvider>
          </QuestContextProvider>
        </Router>
      </DarkModeState>
    )

    const changeThemeButton = getByLabelText('change-theme-button')
    fireEvent.click(changeThemeButton)

    const darkmodeIcon = getByLabelText('DarkModeIcon')
    expect(darkmodeIcon).toBeVisible()

    fireEvent.click(changeThemeButton)

    const lightModeIcon = getByLabelText('LightModeIcon')
    expect(lightModeIcon).toBeVisible()
  })
})
