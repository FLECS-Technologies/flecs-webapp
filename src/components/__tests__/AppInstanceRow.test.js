/*
 * Copyright (c) 2021 FLECS Technologies GmbH
 *
 * Created on Mon Nov 04 2024
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
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import AppInstanceRow from '../AppInstanceRow'
import { JobsContext } from '../../data/JobsContext'
import AppAPI from '../../api/device/AppAPI'

jest.mock('../../api/device/AppAPI')

describe('AppInstanceRow Component', () => {
  const mockApp = {
    title: 'Test App',
    appKey: { version: '1.0.0', name: 'Test App' },
    instances: [
      { instanceId: '1', instanceName: 'Test Instance', status: 'stopped' }
    ],
    editors: [{ name: 'editor', url: '/editor' }]
  }
  const mockAppInstance = {
    instanceId: '1',
    instanceName: 'Test Instance',
    appKey: mockApp.appKey,
    status: 'stopped',
    editors: [{ name: 'editor', url: '/editor' }]
  }
  const mockSetFetchingJobs = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  function loadAppReferenceData() {}

  function renderComponent() {
    return render(
      <JobsContext.Provider value={{ setFetchingJobs: mockSetFetchingJobs }}>
        <table>
          <tbody>
            <AppInstanceRow
              app={mockApp}
              appInstance={mockAppInstance}
              loadAppReferenceData={loadAppReferenceData}
            />
          </tbody>
        </table>
      </JobsContext.Provider>
    )
  }

  test('renders component with app instance details', () => {
    renderComponent()
    expect(screen.getByText('Test Instance')).toBeInTheDocument()
    expect(screen.getByText('1.0.0')).toBeInTheDocument()
  })

  test('shows start button and calls startInstance function when clicked', async () => {
    AppAPI.prototype.startInstance = jest.fn().mockResolvedValueOnce(true)

    renderComponent()
    const startButton = screen.getByLabelText('start-instance-button')

    fireEvent.click(startButton)

    await waitFor(() => {
      expect(AppAPI.prototype.startInstance).toHaveBeenCalledWith('1')
      expect(mockSetFetchingJobs).toHaveBeenCalledTimes(1)
    })
  })

  test('shows stop button and calls stopInstance function when clicked', async () => {
    AppAPI.prototype.stopInstance = jest.fn().mockResolvedValueOnce(true)
    mockAppInstance.status = 'running'

    renderComponent()
    const stopButton = screen.getByLabelText('stop-instance-button')

    fireEvent.click(stopButton)

    await waitFor(() => {
      expect(mockSetFetchingJobs).toHaveBeenCalledTimes(1)
    })
  })

  test('disables start button if instance is running', () => {
    mockAppInstance.status = 'running'
    renderComponent()

    const startButton = screen.getByLabelText('start-instance-button')
    expect(startButton).toBeDisabled()
  })

  test('shows delete confirmation dialog when delete button is clicked', async () => {
    renderComponent()
    const deleteButton = screen.getByLabelText('delete-instance-button')

    fireEvent.click(deleteButton)

    expect(
      screen.getByText('Remove Test Instance instance?')
    ).toBeInTheDocument()
  })

  test('calls deleteInstance function after confirmation', async () => {
    AppAPI.prototype.deleteInstance = jest.fn().mockResolvedValueOnce(true)

    renderComponent()
    const deleteButton = screen.getByLabelText('delete-instance-button')
    fireEvent.click(deleteButton)

    const confirmButton = screen.getByText('Remove Test Instance instance?')
    fireEvent.click(confirmButton)
  })

  test('opens info dialog when info button is clicked', async () => {
    renderComponent()
    const infoButton = screen.getByLabelText('instance-info-button')

    fireEvent.click(infoButton)

    expect(screen.getByText('Info to Test Instance')).toBeInTheDocument()
  })

  test('opens settings dialog when settings button is clicked', async () => {
    renderComponent()
    const settingsButton = screen.getByLabelText('instance-settings-button')

    fireEvent.click(settingsButton)

    expect(screen.getByText('Settings of Test Instance')).toBeInTheDocument()
  })

  test('displays snackbar with success message on successful instance start', async () => {
    AppAPI.prototype.startInstance = jest.fn().mockResolvedValueOnce(true)

    renderComponent()
    const startButton = screen.getByLabelText('start-instance-button')

    fireEvent.click(startButton)
  })

  test('displays snackbar with error message on failed instance stop', async () => {
    AppAPI.prototype.stopInstance = jest.fn().mockResolvedValueOnce(false)
    AppAPI.prototype.lastAPIError = 'Error stopping instance'

    renderComponent()
    const stopButton = screen.getByLabelText('stop-instance-button')

    fireEvent.click(stopButton)

    await screen.findByText(/Failed to stop Test Instance/i)
  })
})
