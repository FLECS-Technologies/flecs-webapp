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
import { screen, render, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import Card from '../Card'

describe('Card', () => {
  const relatedLinks = [
    {
      text: 'Buy',
      link: 'https://store.codesys.com/de/codesys-control-for-linux-sl-bundle.html'
    }
  ]

  beforeEach(() => {
    nock.disableNetConnect()
    nock.enableNetConnect('127.0.0.1')
  })
  afterEach(() => {
    nock.cleanAll()
    nock.enableNetConnect()
  })

  test('renders Card component', () => {
    render(<Card />)

    // screen.debug()
  })

  test('Click request', async () => {
    const { getByTestId } = render(<Card />)

    const requestButton = getByTestId('app-request-button')
    // const confirmDialog = getByTestId('confirm-dialog')
    expect(requestButton).toBeVisible()
    expect(requestButton).toBeEnabled()

    fireEvent.click(requestButton)

    // expect(confirmDialog).toBeVisible()
    // screen.debug()
  })

  test('Click install', async () => {
    nock('http://localhost')
      .post('/InstallApp')
      .reply(200, {
        app: 'Testapp',
        version: 'Test App Version',
        additionalInfo: ''
      }, {
        'Access-Control-Allow-Origin': '*',
        'Content-type': 'application/json'
      })

    nock('http://localhost')
      .post('/CreateAppInstance')
      .reply(200, {
        app: 'Testapp',
        version: 'Test App Version',
        instanceName: 'Test app instance',
        instanceId: '01234567',
        additionalInfo: ''
      }, {
        'Access-Control-Allow-Origin': '*',
        'Content-type': 'application/json'
      })

    nock('http://localhost')
      .post('/StartAppInstance')
      .reply(200, {
        app: 'Testapp',
        version: 'Test App Version',
        instanceId: '01234567',
        additionalInfo: ''
      }, {
        'Access-Control-Allow-Origin': '*',
        'Content-type': 'application/json'
      })
    const { getByLabelText, getByTestId } = render(<Card
      app= 'Testapp'
      avatar= ''
      title= 'Test App Title'
      author= 'Test App author'
      version= 'Test App Version'
      description= 'Test App Description'
      status= 'uninstalled'
      availability='available'
      requirement='all FLECS devices'
      installedVersions={[]}
      instances={[]} />)

    const installButton = getByLabelText('install-app-button')
    const uninstallButton = screen.queryByText('Uninstall')
    const requestButton = getByTestId('app-request-button')
    expect(installButton).toBeVisible()
    expect(installButton).toBeEnabled()
    expect(uninstallButton).toBeNull()
    expect(requestButton).not.toBeVisible()
    fireEvent.click(installButton)

    // screen.debug()
  })

  test('Click uninstall', async () => {
    render(<Card
      app= 'Testapp'
      avatar= ''
      title= 'Test App Title'
      author= 'Test App author'
      version= 'Test App Version'
      description= 'Test App Description'
      status= 'installed'
      availability='available'
      installedVersions={['Test App Version']}
      instances={[]} />)

    const uninstallButton = screen.queryByText('Uninstall')
    fireEvent.click(uninstallButton)

    // todo: add what to expect
    // expect(screen.getByText("Profile")).toBeVisible();

    // screen.debug()
  })

  test('Card with related links', async () => {
    const { getByTestId } = render(<Card relatedLinks={relatedLinks} />)

    expect(getByTestId('more-vert-icon')).toBeVisible()
  })

  test('Card without related links', async () => {
    const { getByTestId } = render(<Card />)

    expect(() => getByTestId('more-vert-icon')).toThrow()
  })

  test('Card requirements - unsupported architecture', async () => {
    const { getByLabelText } = render(<Card
      app= 'Testapp'
      avatar= ''
      title= 'Test App Title'
      author= 'Test App author'
      version= 'Test App Version'
      description= 'Test App Description'
      status= 'uninstalled'
      availability='available'
      instances={[]}
      requirement='amd60000000' />) // invalid architecture

    const installButton = getByLabelText('install-app-button')
    expect(installButton).not.toBeEnabled()
  })

  test('Card requirements - supported architecture', async () => {
    const { getByLabelText } = render(<Card
      app= 'Testapp'
      avatar= ''
      title= 'Test App Title'
      author= 'Test App author'
      version= 'Test App Version'
      description= 'Test App Description'
      status= 'uninstalled'
      availability='available'
      instances={[]}
      requirement='all FLECS devices' />)

    const installButton = getByLabelText('install-app-button')
    expect(installButton).toBeEnabled()
  })
})
