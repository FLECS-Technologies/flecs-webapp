/*
 * Copyright (c) 2022 FLECS Technologies GmbH
 *
 * Created on Fri Jun 07 2024
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
import InstancePorts from '../InstancePorts'
import * as PortsAPI from '../../../../api/device/instances/ports/ports'
// Automatically mock the entire module
jest.mock('../../../../api/device/instances/ports/ports')

describe('InstancePorts', () => {
  const instanceId = 'test-instance-id'

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks()

    // Set up mock resolved values using the jest.Mock type assertion
    ;(PortsAPI.fetchPorts as jest.Mock).mockResolvedValue([
      '8080:80',
      '1880:1880'
    ])
  })

  it('renders without crashing and fetches ports', async () => {
    render(<InstancePorts instanceId={instanceId} />)
    await waitFor(() => {
      expect(PortsAPI.fetchPorts).toHaveBeenCalledWith(instanceId)
      expect(screen.getAllByRole('textbox').length).toBe(2)
    })
  })

  it('handles input changes', async () => {
    render(<InstancePorts instanceId={instanceId} />)
    await waitFor(() => {
      expect(screen.getByText('Add Port Mapping')).toBeInTheDocument()
      expect(screen.getAllByRole('textbox').length).toBe(2)
    })

    // Casting the element to HTMLInputElement
    const textBox = screen.getAllByRole('textbox')[0] as HTMLInputElement
    fireEvent.change(textBox, { target: { value: '8090:9090' } })
    expect(textBox.value).toBe('8090:9090')
  })

  it('allows adding a port mapping', async () => {
    render(<InstancePorts instanceId={instanceId} />)
    await waitFor(() => screen.getByText('Add Port Mapping'))
    userEvent.click(screen.getByText('Add Port Mapping'))
    await waitFor(() => expect(screen.getAllByRole('textbox').length).toBe(3)) // including the new empty one)
  })

  it('allows deleting a port mapping', async () => {
    render(<InstancePorts instanceId={instanceId} />)
    await waitFor(() => screen.getByText('Add Port Mapping'))
    const initialCount = screen.getAllByRole('textbox').length
    userEvent.click(screen.getAllByLabelText('delete-port-button')[0]) // the delete button for the first environment
    await waitFor(() =>
      expect(screen.getAllByRole('textbox').length).toBe(initialCount - 1)
    )
  })

  it('saves modified ports', async () => {
    const spy = jest
      .spyOn(
        require('../../../../api/device/instances/ports/ports'),
        'putPorts'
      )
      .mockResolvedValueOnce('')

    render(<InstancePorts instanceId={instanceId} />)
    await waitFor(() => screen.getByText('Add Port Mapping'))
    userEvent.click(screen.getByText('Add Port Mapping'))
    await waitFor(() => expect(screen.getAllByRole('textbox').length).toBe(3))
    await waitFor(() => screen.getByText('Save Port Mappings'))
    userEvent.click(screen.getByText('Save Port Mappings'))
    await waitFor(() => {
      expect(spy).toHaveBeenCalledWith(instanceId, expect.any(Array))
    })
  })

  it('failes to save modified ports', async () => {
    const spy = jest
      .spyOn(
        require('../../../../api/device/instances/ports/ports'),
        'putPorts'
      )
      .mockRejectedValueOnce('')

    render(<InstancePorts instanceId={instanceId} />)
    await waitFor(() => screen.getByText('Add Port Mapping'))
    userEvent.click(screen.getByText('Add Port Mapping'))
    await waitFor(() => expect(screen.getAllByRole('textbox').length).toBe(3))
    await waitFor(() => screen.getByText('Save Port Mappings'))
    userEvent.click(screen.getByText('Save Port Mappings'))
    await waitFor(() => {
      expect(spy).toHaveBeenCalledWith(instanceId, expect.any(Array))
    })
  })
})
