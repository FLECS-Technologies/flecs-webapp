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
import '@testing-library/jest-dom'
import { act } from 'react-dom/test-utils'
import { render, fireEvent, screen, waitFor } from '@testing-library/react'
import Row from '../InstalledAppsListRow'

jest.mock('../../api/AppAPI')

describe('Test Installed Apps List row', () => {
  const app = {
    app: 'com.codesys.codesyscontrol',
    status: 'installed',
    version: '4.2.0',
    editor: ':8080',
    multiInstance: true,
    instances: [
      {
        instanceId: 'com.codesys.codesyscontrol.01234567',
        instanceName: 'Smarthome',
        status: 'running',
        version: '4.2.0'
      },
      {
        instanceId: 'com.codesys.codesyscontrol.12345678',
        instanceName: 'Energymanager',
        status: 'stopped',
        version: '4.2.0'
      }
    ]
  }
  afterAll(() => {
    jest.resetAllMocks()
  })
  test('renders installed apps list row component', async () => {
    await act(async () => {
      render(<Row key = {app.app} row = {app} />)
    })

    const crtInstnButton = screen.getByTestId('start-new-instance-icon-button-icon')
    const deleteButton = screen.getByTestId('DeleteIcon')

    expect(crtInstnButton).toBeVisible()
    expect(deleteButton).toBeVisible()
  })

  test('create new instance', async () => {
    await act(async () => {
      render(<Row key = {app.app} row = {app} />)
    })
    const crtInstnButton = screen.getByTestId('start-new-instance-icon-button-icon')
    const deleteButton = screen.getByTestId('DeleteIcon')

    fireEvent.click(crtInstnButton)

    expect(crtInstnButton).toBeVisible()
    expect(deleteButton).toBeVisible()
  })

  test('test delete app', async () => {
    await act(async () => {
      render(<Row key = {app.app} row = {app} />)
    })
    const createInstanceButton = screen.getByTestId('start-new-instance-icon-button-icon')
    const deleteButton = screen.getByTestId('DeleteIcon')

    fireEvent.click(deleteButton)

    const yesButton = await waitFor(() => screen.getByText('Yes'))
    fireEvent.click(yesButton)

    expect(createInstanceButton).toBeVisible()
    expect(deleteButton).toBeVisible()
  })

  test('test app with relatedLinks', async () => {
    app.relatedLinks = [
      {
        text: 'Buy',
        link: 'https://store.codesys.com/de/codesys-control-for-linux-sl-bundle.html'
      }
    ]
    await act(async () => {
      render(<Row key = {app.app} row = {app} />)
    })

    const relatedLinks = screen.getByTestId('more-horiz-icon')

    await act(async () => {
      fireEvent.click(relatedLinks)
    })

    expect(relatedLinks).toBeVisible()
    expect(relatedLinks).toBeEnabled()
    // screen.debug()
  })

  test('test app without relatedLinks', () => {
    app.relatedLinks = null
    const { getByTestId /*, getByLabelText */ } = render(<Row
        key = {app.app}
        row = {app}
   />)

    expect(() => getByTestId('more-horiz-icon')).toThrow()
    // screen.debug()
  })

  test('renders an app with an editor', () => {
    const closeSpy = jest.fn()
    window.open = jest.fn().mockReturnValue({ close: closeSpy })

    render(<Row key = {app.app} row = {app} />)

    const expandButton = screen.getByLabelText('expand row')
    fireEvent.click(expandButton)

    const editorButton = screen.getByLabelText('open-app-button')
    fireEvent.click(editorButton)

    expect(editorButton).toBeEnabled()
    expect(window.open).toHaveBeenCalled()
    expect(window.open).toHaveBeenCalledWith('http://localhost:8080')
  })
})
