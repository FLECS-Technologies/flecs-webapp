/*
 * Copyright (c) 2022 FLECS Technologies GmbH
 *
 * Created on Thu May 22 2025
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
import { api } from '../../../../api/flecs-core/api-client'
import EditorConfigTab from '../EditorConfigTab'

// Mock the API client
jest.mock('../../../../api/flecs-core/api-client', () => ({
  api: {
    instances: {
      instancesInstanceIdConfigEditorsGet: jest.fn(),
      instancesInstanceIdConfigEditorsPortPathPrefixDelete: jest.fn(),
      instancesInstanceIdConfigEditorsPortPathPrefixPut: jest.fn()
    }
  }
}))

describe('EditorConfigTab', () => {
  const instanceId = 'test-instance-id'

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders loading spinner while fetching editors', async () => {
    ;(
      api.instances.instancesInstanceIdConfigEditorsGet as jest.Mock
    ).mockResolvedValueOnce({
      data: []
    })

    render(
      <EditorConfigTab instanceId={instanceId} onChange={jest.fn()} />
    )

    expect(screen.getByRole('progressbar')).toBeInTheDocument()
    await waitFor(() =>
      expect(
        api.instances.instancesInstanceIdConfigEditorsGet
      ).toHaveBeenCalledWith({
        instanceId
      })
    )
  })

  it('renders editors when data is fetched', async () => {
    ;(
      api.instances.instancesInstanceIdConfigEditorsGet as jest.Mock
    ).mockResolvedValueOnce({
      data: [{ name: 'Testeditor', port: 200, path_prefix: "test_prefix", url: '/test/url' }]
    })

    render(
      <EditorConfigTab instanceId={instanceId} onChange={jest.fn()} />
    )

    await waitFor(() => {
      expect(screen.getByText('Testeditor')).toBeInTheDocument()
      expect(screen.getByText('200')).toBeInTheDocument()
      expect(screen.getByDisplayValue('test_prefix')).toBeInTheDocument()
      expect(screen.getByText(/\/test\/url$/)).toBeInTheDocument()
    })
  })

  it('changing path prefix updates url', async () => {
    ;(
      api.instances.instancesInstanceIdConfigEditorsGet as jest.Mock
    ).mockResolvedValueOnce({
      data: [{ name: 'Testeditor', port: 200, path_prefix: "test_prefix", url: '/test/url' }]
    })

    render(
      <EditorConfigTab instanceId={instanceId} onChange={jest.fn()} />
    )

    await waitFor(() =>
      expect(
        api.instances.instancesInstanceIdConfigEditorsGet
      ).toHaveBeenCalledWith({
        instanceId
      })
    )

    await waitFor(() =>
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
    )

    // Simulate a change
    const entry = screen.getByDisplayValue('test_prefix')
    fireEvent.change(entry, { target: { value: 'new_test_prefix' } })

    expect(screen.getByText(/\/api\/new_test_prefix$/)).toBeInTheDocument()
  })

  it('no path prefix disables delete', async () => {
    ;(
      api.instances.instancesInstanceIdConfigEditorsGet as jest.Mock
    ).mockResolvedValueOnce({
      data: [{ name: 'Testeditor', port: 200, url: '/test/url' }]
    })

    render(
      <EditorConfigTab instanceId={instanceId} onChange={jest.fn()} />
    )

    await waitFor(() =>
      expect(
        api.instances.instancesInstanceIdConfigEditorsGet
      ).toHaveBeenCalledWith({
        instanceId
      })
    )
    await waitFor(() =>
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
    )
    const deleteButton = screen.getByLabelText('delete-editor-prefix-button');
    expect(deleteButton).toBeDisabled()
  })

  it('path prefix enables delete', async () => {
    ;(
      api.instances.instancesInstanceIdConfigEditorsGet as jest.Mock
    ).mockResolvedValueOnce({
      data: [{ name: 'Testeditor', port: 200, path_prefix: "test_prefix", url: '/test/url' }]
    })

    render(
      <EditorConfigTab instanceId={instanceId} onChange={jest.fn()} />
    )

    await waitFor(() =>
      expect(
        api.instances.instancesInstanceIdConfigEditorsGet
      ).toHaveBeenCalledWith({
        instanceId
      })
    )
    await waitFor(() =>
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
    )
    const deleteButton = screen.getByLabelText('delete-editor-prefix-button');
    expect(deleteButton).not.toBeDisabled()
  })

  it('delete path prefix', async () => {
    ;(
      api.instances.instancesInstanceIdConfigEditorsGet as jest.Mock
    ).mockResolvedValueOnce({
      data: [{ name: 'Testeditor', port: 200, path_prefix: "test_prefix", url: '/test/url' }]
    })
    ;(
      api.instances.instancesInstanceIdConfigEditorsPortPathPrefixDelete as jest.Mock
    ).mockResolvedValueOnce({})

    render(
      <EditorConfigTab instanceId={instanceId} onChange={jest.fn()} />
    )

    await waitFor(() =>
      expect(
        api.instances.instancesInstanceIdConfigEditorsGet
      ).toHaveBeenCalledWith({
        instanceId
      })
    )
    await waitFor(() =>
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
    )
    const deleteButton = screen.getByLabelText('delete-editor-prefix-button');
    fireEvent.click(deleteButton)

    expect(
      api.instances.instancesInstanceIdConfigEditorsPortPathPrefixDelete
    ).toHaveBeenCalledWith({
      instanceId, port: 200
    })

    const pathPrefix = screen.getByLabelText('Path Prefix');
    await waitFor(() =>
      expect(pathPrefix).not.toHaveValue()
    )
  })

  it('changing path prefix enables save', async () => {
    ;(
      api.instances.instancesInstanceIdConfigEditorsGet as jest.Mock
    ).mockResolvedValueOnce({
      data: [{ name: 'Testeditor', port: 200, path_prefix: "test_prefix", url: '/test/url' }]
    })

    render(
      <EditorConfigTab instanceId={instanceId} onChange={jest.fn()} />
    )

    await waitFor(() =>
      expect(
        api.instances.instancesInstanceIdConfigEditorsGet
      ).toHaveBeenCalledWith({
        instanceId
      })
    )
    await waitFor(() =>
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
    )
    const saveButton = screen.getByLabelText('put-editor-prefix-button');
    expect(saveButton).toBeDisabled()
    // Simulate a change
    const entry = screen.getByLabelText('Path Prefix')
    fireEvent.change(entry, { target: { value: 'new_test_prefix' } })
    expect(saveButton).not.toBeDisabled()
  })

  it('save path prefix', async () => {
    ;(
      api.instances.instancesInstanceIdConfigEditorsGet as jest.Mock
    ).mockResolvedValueOnce({
      data: [{ name: 'Testeditor', port: 200, path_prefix: "test_prefix", url: '/test/url' }]
    })
    ;(
      api.instances.instancesInstanceIdConfigEditorsPortPathPrefixPut as jest.Mock
    ).mockResolvedValueOnce({})

    render(
      <EditorConfigTab instanceId={instanceId} onChange={jest.fn()} />
    )

    await waitFor(() =>
      expect(
        api.instances.instancesInstanceIdConfigEditorsGet
      ).toHaveBeenCalledWith({
        instanceId
      })
    )
    await waitFor(() =>
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
    )
    const saveButton = screen.getByLabelText('put-editor-prefix-button');
    // Simulate a change
    const entry = screen.getByLabelText('Path Prefix')
    fireEvent.change(entry, { target: { value: 'new_test_prefix' } })
    fireEvent.click(saveButton)
    expect(
      api.instances.instancesInstanceIdConfigEditorsPortPathPrefixPut
    ).toHaveBeenCalledWith({
      instanceId, port: 200, instancesInstanceIdConfigEditorsPortPathPrefixPutRequest: {path_prefix: 'new_test_prefix'}
    })
    await waitFor(() =>
      expect(saveButton).toBeDisabled()
    )
  })
})
