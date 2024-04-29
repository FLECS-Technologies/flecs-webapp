/*
 * Copyright (c) 2022 FLECS Technologies GmbH
 *
 * Created on Thu Apr 25 2024
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
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import InstanceEnvironments from '../InstanceEnvironments'
import * as EnvironmentAPI from '../../../../api/device/instances/environment/environment'
// Automatically mock the entire module
jest.mock('../../../../api/device/instances/environment/environment')

describe('InstanceEnvironments', () => {
  const instanceId = 'test-instance-id'

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks()

    // Set up mock resolved values using the jest.Mock type assertion
    ;(EnvironmentAPI.fetchEnvironments as jest.Mock).mockResolvedValue([
      'ENV_VAR=1',
      'ENV_VAR=2'
    ])
  })

  it('renders without crashing and fetches environments', async () => {
    render(<InstanceEnvironments instanceId={instanceId} />)
    await waitFor(() => {
      expect(EnvironmentAPI.fetchEnvironments).toHaveBeenCalledWith(instanceId)
      expect(screen.getAllByRole('textbox').length).toBe(2)
    })
  })

  it('handles input changes', async () => {
    render(<InstanceEnvironments instanceId={instanceId} />)
    await waitFor(() => {
      expect(screen.getByText('Add Environment Variable')).toBeInTheDocument()
      expect(screen.getAllByRole('textbox').length).toBe(2)
    })

    // Casting the element to HTMLInputElement
    const textBox = screen.getAllByRole('textbox')[0] as HTMLInputElement
    fireEvent.change(textBox, { target: { value: 'NEW_ENV=123' } })
    expect(textBox.value).toBe('NEW_ENV=123')
  })

  it('allows adding an environment variable', async () => {
    render(<InstanceEnvironments instanceId={instanceId} />)
    await waitFor(() => screen.getByText('Add Environment Variable'))
    userEvent.click(screen.getByText('Add Environment Variable'))
    await waitFor(() => expect(screen.getAllByRole('textbox').length).toBe(3)) // including the new empty one)
  })

  it('allows deleting an environment variable', async () => {
    render(<InstanceEnvironments instanceId={instanceId} />)
    await waitFor(() => screen.getByText('Add Environment Variable'))
    const initialCount = screen.getAllByRole('textbox').length
    userEvent.click(screen.getAllByLabelText('delete-env-button')[0]) // the delete button for the first environment
    await waitFor(() =>
      expect(screen.getAllByRole('textbox').length).toBe(initialCount - 1)
    )
  })

  it('saves modified environments', async () => {
    const spy = jest
      .spyOn(
        require('../../../../api/device/instances/environment/environment'),
        'putEnvironments'
      )
      .mockResolvedValueOnce('')

    render(<InstanceEnvironments instanceId={instanceId} />)
    await waitFor(() => screen.getByText('Add Environment Variable'))
    userEvent.click(screen.getByText('Add Environment Variable'))
    await waitFor(() => expect(screen.getAllByRole('textbox').length).toBe(3))
    await waitFor(() => screen.getByText('Save Environments'))
    userEvent.click(screen.getByText('Save Environments'))
    await waitFor(() => {
      expect(spy).toHaveBeenCalledWith(instanceId, expect.any(Array))
    })
  })

  it('failes to save modified environments', async () => {
    const spy = jest
      .spyOn(
        require('../../../../api/device/instances/environment/environment'),
        'putEnvironments'
      )
      .mockRejectedValueOnce('')

    render(<InstanceEnvironments instanceId={instanceId} />)
    await waitFor(() => screen.getByText('Add Environment Variable'))
    userEvent.click(screen.getByText('Add Environment Variable'))
    await waitFor(() => expect(screen.getAllByRole('textbox').length).toBe(3))
    await waitFor(() => screen.getByText('Save Environments'))
    userEvent.click(screen.getByText('Save Environments'))
    await waitFor(() => {
      expect(spy).toHaveBeenCalledWith(instanceId, expect.any(Array))
    })
  })
})
