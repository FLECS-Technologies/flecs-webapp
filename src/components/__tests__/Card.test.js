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
import nock from 'nock'
import { screen, render, fireEvent, act } from '@testing-library/react'
import '@testing-library/jest-dom'
import Card from '../Card'
import { SystemContextProvider } from '../../data/SystemProvider'
import { SystemData } from '../../data/SystemData'
import { JobsContextProvider } from '../../data/JobsContext'
jest.mock('../../api/device/SystemInfoService')
jest.mock('../../api/device/SystemPingService')
jest.mock('../../api/device/JobsAPI')
jest.mock('../../api/device/AppAPI')
jest.mock('../../api/device/DeviceAuthAPI')
jest.mock('../../api/device/license/activation')
jest.mock('../../api/device/license/status')

describe('Card', () => {
  const relatedLinks = [
    {
      text: 'Buy',
      link: 'https://flecs.tech'
    }
  ]

  beforeEach(() => {
    nock.disableNetConnect()
    nock.enableNetConnect(['127.0.0.1'])
  })
  afterEach(() => {
    nock.cleanAll()
    nock.enableNetConnect()
  })

  afterAll(() => {
    jest.resetAllMocks()
  })

  test('renders Card component', () => {
    render(
      <JobsContextProvider>
        <Card />
      </JobsContextProvider>
    )

    // screen.debug()
  })

  test('Click request', async () => {
    const { getByTestId } = render(
      <JobsContextProvider>
        <Card />
      </JobsContextProvider>
    )

    const requestButton = getByTestId('app-request-button')
    // const confirmDialog = getByTestId('confirm-dialog')
    expect(requestButton).toBeVisible()
    expect(requestButton).toBeEnabled()

    fireEvent.click(requestButton)

    // expect(confirmDialog).toBeVisible()
    // screen.debug()
  })

  test('Click install', async () => {
    await act(async () => {
      render(
        <JobsContextProvider>
          <SystemContextProvider>
            <SystemData>
              <Card
                app='Testapp'
                avatar=''
                title='Test App Title'
                author='Test App author'
                versions={['Test App Version']}
                description='Test App Description'
                status='uninstalled'
                availability='available'
                requirement={['amd64']} // valid architecture
                installedVersions={[]}
                instances={[]}
              />
            </SystemData>
          </SystemContextProvider>
        </JobsContextProvider>
      )
    })

    const installButton = screen.getByLabelText('install-app-button')
    const uninstallButton = screen.queryByText('Uninstall')
    const requestButton = screen.getByTestId('app-request-button')
    expect(installButton).toBeVisible()
    expect(installButton).toBeEnabled()
    expect(uninstallButton).toBeNull()
    expect(requestButton).not.toBeVisible()
  })

  test('Click uninstall', async () => {
    render(
      <JobsContextProvider>
        <Card
          app='Testapp'
          avatar=''
          title='Test App Title'
          author='Test App author'
          version='Test App Version'
          description='Test App Description'
          status='installed'
          availability='available'
          installedVersions={['Test App Version']}
          instances={[]}
        />
      </JobsContextProvider>
    )

    const uninstallButton = screen.queryByText('Uninstall')
    fireEvent.click(uninstallButton)

    // todo: add what to expect
    // expect(screen.getByText("Profile")).toBeVisible();

    // screen.debug()
  })

  test('Card with related links', async () => {
    const { getByTestId } = render(
      <JobsContextProvider>
        <Card relatedLinks={relatedLinks} />
      </JobsContextProvider>
    )

    expect(getByTestId('more-vert-icon')).toBeVisible()
  })

  test('Card without related links', async () => {
    const { getByTestId } = render(
      <JobsContextProvider>
        <Card />
      </JobsContextProvider>
    )

    expect(() => getByTestId('more-vert-icon')).toThrow()
  })
})
