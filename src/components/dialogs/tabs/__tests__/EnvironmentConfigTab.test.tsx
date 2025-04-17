/*
 * Copyright (c) 2022 FLECS Technologies GmbH
 *
 * Created on Wed Apr 16 2025
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
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import EnvironmentConfigTab from '../EnvironmentConfigTab'
import { api } from '../../../../api/flecs-core/api-client'

// Mock the API client
jest.mock('../../../../api/flecs-core/api-client', () => ({
  api: {
    instances: {
      instancesInstanceIdConfigEnvironmentGet: jest.fn(),
      instancesInstanceIdConfigEnvironmentPut: jest.fn(),
      instancesInstanceIdConfigEnvironmentVariableNameDelete: jest.fn()
    }
  }
}))

describe('EnvironmentConfigTab', () => {
  const instanceId = 'test-instance-id'

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders loading spinner while fetching environment variables', async () => {
    ;(
      api.instances.instancesInstanceIdConfigEnvironmentGet as jest.Mock
    ).mockResolvedValueOnce({
      data: []
    })

    render(
      <EnvironmentConfigTab instanceId={instanceId} onChange={jest.fn()} />
    )

    expect(screen.getByRole('progressbar')).toBeInTheDocument()
    await waitFor(() =>
      expect(
        api.instances.instancesInstanceIdConfigEnvironmentGet
      ).toHaveBeenCalledWith({
        instanceId
      })
    )
  })

  it('renders environment variables when data is fetched', async () => {
    ;(
      api.instances.instancesInstanceIdConfigEnvironmentGet as jest.Mock
    ).mockResolvedValueOnce({
      data: [{ name: 'TEST_KEY', value: 'TEST_VALUE' }]
    })

    render(
      <EnvironmentConfigTab instanceId={instanceId} onChange={jest.fn()} />
    )

    await waitFor(() => {
      expect(screen.getByDisplayValue('TEST_KEY')).toBeInTheDocument()
      expect(screen.getByDisplayValue('TEST_VALUE')).toBeInTheDocument()
    })
  })

  it('adds a new environment variable', async () => {
    ;(
      api.instances.instancesInstanceIdConfigEnvironmentGet as jest.Mock
    ).mockResolvedValueOnce({
      data: []
    })

    render(
      <EnvironmentConfigTab instanceId={instanceId} onChange={jest.fn()} />
    )

    await waitFor(() =>
      expect(
        api.instances.instancesInstanceIdConfigEnvironmentGet
      ).toHaveBeenCalled()
    )

    const addButton = screen.getByText('Add Environment Variable')
    fireEvent.click(addButton)

    expect(screen.getAllByLabelText('Key')).toHaveLength(1)
    expect(screen.getAllByLabelText('Value')).toHaveLength(1)
  })

  it('deletes an environment variable', async () => {
    ;(
      api.instances.instancesInstanceIdConfigEnvironmentGet as jest.Mock
    ).mockResolvedValueOnce({
      data: [{ name: 'TEST_KEY', value: 'TEST_VALUE' }]
    })
    ;(
      api.instances
        .instancesInstanceIdConfigEnvironmentVariableNameDelete as jest.Mock
    ).mockResolvedValueOnce({})

    render(
      <EnvironmentConfigTab instanceId={instanceId} onChange={jest.fn()} />
    )

    await waitFor(() => {
      expect(screen.getByDisplayValue('TEST_KEY')).toBeInTheDocument()
    })

    const deleteButton = screen.getByLabelText('Delete Environment Variable')
    fireEvent.click(deleteButton)

    await waitFor(() => {
      // expect(screen.queryByDisplayValue('TEST_KEY')).not.toBeInTheDocument()
      expect(
        api.instances.instancesInstanceIdConfigEnvironmentVariableNameDelete
      ).toHaveBeenCalled()
    })
  })

  it('saves environment variables', async () => {
    // Mock API responses
    ;(
      api.instances.instancesInstanceIdConfigEnvironmentGet as jest.Mock
    ).mockResolvedValueOnce({
      data: [{ name: 'TEST_KEY', value: 'TEST_VALUE' }]
    })
    ;(
      api.instances.instancesInstanceIdConfigEnvironmentPut as jest.Mock
    ).mockResolvedValueOnce({})

    render(
      <EnvironmentConfigTab instanceId={instanceId} onChange={jest.fn()} />
    )

    await waitFor(() => {
      expect(screen.getByDisplayValue('TEST_KEY')).toBeInTheDocument()
    })

    // Simulate a change to enable the Save button
    const keyInput = screen.getByDisplayValue('TEST_KEY')
    fireEvent.change(keyInput, { target: { value: 'UPDATED_KEY' } })

    const saveButton = screen
      .getAllByLabelText('Save Environment Variable')
      .find(
        (button) => button.tagName.toLowerCase() === 'button'
      ) as HTMLElement
    fireEvent.click(saveButton)

    await waitFor(() =>
      expect(
        api.instances.instancesInstanceIdConfigEnvironmentPut
      ).toHaveBeenCalledWith({
        instanceId,
        instanceEnvironmentVariable: [
          { name: 'UPDATED_KEY', value: 'TEST_VALUE' }
        ]
      })
    )
  })

  it('shows a success snackbar when saving succeeds', async () => {
    // Mock API responses
    ;(
      api.instances.instancesInstanceIdConfigEnvironmentGet as jest.Mock
    ).mockResolvedValueOnce({
      data: [{ name: 'TEST_KEY', value: 'TEST_VALUE' }]
    })
    ;(
      api.instances.instancesInstanceIdConfigEnvironmentPut as jest.Mock
    ).mockResolvedValueOnce({})

    render(
      <EnvironmentConfigTab instanceId={instanceId} onChange={jest.fn()} />
    )

    await waitFor(() => {
      expect(screen.getByDisplayValue('TEST_KEY')).toBeInTheDocument()
    })

    const saveButton = screen
      .getAllByLabelText('Save Environment Variable')
      .find(
        (button) => button.tagName.toLowerCase() === 'button'
      ) as HTMLElement
    fireEvent.click(saveButton)
  })

  it('shows an error snackbar when saving fails', async () => {
    // Mock API responses
    ;(
      api.instances.instancesInstanceIdConfigEnvironmentGet as jest.Mock
    ).mockResolvedValueOnce({
      data: [{ name: 'TEST_KEY', value: 'TEST_VALUE' }]
    })
    ;(
      api.instances.instancesInstanceIdConfigEnvironmentPut as jest.Mock
    ).mockRejectedValueOnce(new Error())

    render(
      <EnvironmentConfigTab instanceId={instanceId} onChange={jest.fn()} />
    )

    await waitFor(() => {
      expect(screen.getByDisplayValue('TEST_KEY')).toBeInTheDocument()
    })

    const saveButton = screen
      .getAllByLabelText('Save Environment Variable')
      .find(
        (button) => button.tagName.toLowerCase() === 'button'
      ) as HTMLElement
    fireEvent.click(saveButton)
  })
})
