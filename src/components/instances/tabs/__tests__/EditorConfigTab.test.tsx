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
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import EditorConfigTab from '../EditorConfigTab';
import { createMockApi } from '../../../../__mocks__/core-client-ts';

// Mock the API provider
const mockUseProtectedApi = vi.fn();
const mockHost = vi.fn(() => 'http://localhost:8080');

vi.mock('@contexts/api/ApiProvider', () => ({
  useProtectedApi: () => mockUseProtectedApi(),
  host: () => mockHost(),
}));

describe('EditorConfigTab', () => {
  const instanceId = 'test-instance-id';
  const mockOnChange = vi.fn();
  let mockApi: any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockApi = createMockApi();
    mockUseProtectedApi.mockReturnValue(mockApi);
  });

  it('renders loading spinner while fetching editors', async () => {
    mockApi.instances.instancesInstanceIdConfigEditorsGet.mockResolvedValueOnce({
      data: [],
    });

    render(<EditorConfigTab instanceId={instanceId} onChange={mockOnChange} />);

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    await waitFor(() =>
      expect(mockApi.instances.instancesInstanceIdConfigEditorsGet).toHaveBeenCalledWith(
        instanceId,
      ),
    );
  });

  it('renders editors when data is fetched', async () => {
    mockApi.instances.instancesInstanceIdConfigEditorsGet.mockResolvedValueOnce({
      data: [{ name: 'Testeditor', port: 200, path_prefix: 'test_prefix', url: '/test/url' }],
    });

    render(<EditorConfigTab instanceId={instanceId} onChange={mockOnChange} />);

    await waitFor(() => {
      expect(screen.getByText('Testeditor')).toBeInTheDocument();
      expect(screen.getByText('200')).toBeInTheDocument();
      expect(screen.getByDisplayValue('test_prefix')).toBeInTheDocument();
      expect(screen.getByText(/\/test\/url$/)).toBeInTheDocument();
    });
  });

  it('changing path prefix updates url', async () => {
    mockApi.instances.instancesInstanceIdConfigEditorsGet.mockResolvedValueOnce({
      data: [{ name: 'Testeditor', port: 200, path_prefix: 'test_prefix', url: '/test/url' }],
    });

    render(<EditorConfigTab instanceId={instanceId} onChange={mockOnChange} />);

    await waitFor(() =>
      expect(mockApi.instances.instancesInstanceIdConfigEditorsGet).toHaveBeenCalledWith(
        instanceId,
      ),
    );

    await waitFor(() => expect(screen.queryByRole('progressbar')).not.toBeInTheDocument());

    // Simulate a change
    const entry = screen.getByDisplayValue('test_prefix');
    fireEvent.change(entry, { target: { value: 'new_test_prefix' } });

    expect(screen.getByText(/\/new_test_prefix$/)).toBeInTheDocument();
  });

  it('no path prefix disables delete', async () => {
    mockApi.instances.instancesInstanceIdConfigEditorsGet.mockResolvedValueOnce({
      data: [{ name: 'Testeditor', port: 200, url: '/test/url' }],
    });

    render(<EditorConfigTab instanceId={instanceId} onChange={mockOnChange} />);

    await waitFor(() =>
      expect(mockApi.instances.instancesInstanceIdConfigEditorsGet).toHaveBeenCalledWith(
        instanceId,
      ),
    );
    await waitFor(() => expect(screen.queryByRole('progressbar')).not.toBeInTheDocument());
    const deleteButton = screen.getByLabelText('delete-editor-prefix-button');
    expect(deleteButton).toBeDisabled();
  });

  it('path prefix enables delete', async () => {
    mockApi.instances.instancesInstanceIdConfigEditorsGet.mockResolvedValueOnce({
      data: [{ name: 'Testeditor', port: 200, path_prefix: 'test_prefix', url: '/test/url' }],
    });

    render(<EditorConfigTab instanceId={instanceId} onChange={mockOnChange} />);

    await waitFor(() =>
      expect(mockApi.instances.instancesInstanceIdConfigEditorsGet).toHaveBeenCalledWith(
        instanceId,
      ),
    );
    await waitFor(() => expect(screen.queryByRole('progressbar')).not.toBeInTheDocument());
    const deleteButton = screen.getByLabelText('delete-editor-prefix-button');
    expect(deleteButton).not.toBeDisabled();
  });

  it('delete path prefix', async () => {
    mockApi.instances.instancesInstanceIdConfigEditorsGet.mockResolvedValueOnce({
      data: [{ name: 'Testeditor', port: 200, path_prefix: 'test_prefix', url: '/test/url' }],
    });
    mockApi.instances.instancesInstanceIdConfigEditorsPortPathPrefixDelete.mockResolvedValueOnce(
      {},
    );

    render(<EditorConfigTab instanceId={instanceId} onChange={mockOnChange} />);

    await waitFor(() =>
      expect(mockApi.instances.instancesInstanceIdConfigEditorsGet).toHaveBeenCalledWith(
        instanceId,
      ),
    );
    await waitFor(() => expect(screen.queryByRole('progressbar')).not.toBeInTheDocument());
    const deleteButton = screen.getByLabelText('delete-editor-prefix-button');
    fireEvent.click(deleteButton);

    expect(
      mockApi.instances.instancesInstanceIdConfigEditorsPortPathPrefixDelete,
    ).toHaveBeenCalledWith(instanceId, 200);

    const pathPrefix = screen.getByLabelText('Path Prefix');
    await waitFor(() => expect(pathPrefix).not.toHaveValue());
  });

  it('changing path prefix enables save', async () => {
    mockApi.instances.instancesInstanceIdConfigEditorsGet.mockResolvedValueOnce({
      data: [{ name: 'Testeditor', port: 200, path_prefix: 'test_prefix', url: '/test/url' }],
    });

    render(<EditorConfigTab instanceId={instanceId} onChange={mockOnChange} />);

    await waitFor(() =>
      expect(mockApi.instances.instancesInstanceIdConfigEditorsGet).toHaveBeenCalledWith(
        instanceId,
      ),
    );
    await waitFor(() => expect(screen.queryByRole('progressbar')).not.toBeInTheDocument());
    const saveButton = screen.getByLabelText('put-editor-prefix-button');
    expect(saveButton).toBeDisabled();
    // Simulate a change
    const entry = screen.getByLabelText('Path Prefix');
    fireEvent.change(entry, { target: { value: 'new_test_prefix' } });
    expect(saveButton).not.toBeDisabled();
  });

  it('save path prefix', async () => {
    mockApi.instances.instancesInstanceIdConfigEditorsGet.mockResolvedValueOnce({
      data: [{ name: 'Testeditor', port: 200, path_prefix: 'test_prefix', url: '/test/url' }],
    });
    mockApi.instances.instancesInstanceIdConfigEditorsPortPathPrefixPut.mockResolvedValueOnce({});

    render(<EditorConfigTab instanceId={instanceId} onChange={mockOnChange} />);

    await waitFor(() =>
      expect(mockApi.instances.instancesInstanceIdConfigEditorsGet).toHaveBeenCalledWith(
        instanceId,
      ),
    );
    await waitFor(() => expect(screen.queryByRole('progressbar')).not.toBeInTheDocument());
    const saveButton = screen.getByLabelText('put-editor-prefix-button');
    // Simulate a change
    const entry = screen.getByLabelText('Path Prefix');
    fireEvent.change(entry, { target: { value: 'new_test_prefix' } });
    fireEvent.click(saveButton);
    expect(
      mockApi.instances.instancesInstanceIdConfigEditorsPortPathPrefixPut,
    ).toHaveBeenCalledWith(instanceId, 200, { path_prefix: 'new_test_prefix' });
    await waitFor(() => expect(saveButton).toBeDisabled());
  });
});
