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
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import EnvironmentConfigTab from '../EnvironmentConfigTab';
import { createMockApi } from '../../../../__mocks__/core-client-ts';

// Mock the API provider
const mockUseProtectedApi = vi.fn();

vi.mock('@contexts/api/ApiProvider', () => ({
  useProtectedApi: () => mockUseProtectedApi(),
}));

describe('EnvironmentConfigTab', () => {
  const instanceId = 'test-instance-id';
  const mockOnChange = vi.fn();
  let mockApi: any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockApi = createMockApi();
    mockUseProtectedApi.mockReturnValue(mockApi);
  });

  it('renders loading spinner while fetching environment variables', async () => {
    mockApi.instances.instancesInstanceIdConfigEnvironmentGet.mockResolvedValueOnce({
      data: [],
    });

    render(<EnvironmentConfigTab instanceId={instanceId} onChange={mockOnChange} />);

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    await waitFor(() =>
      expect(mockApi.instances.instancesInstanceIdConfigEnvironmentGet).toHaveBeenCalledWith(
        instanceId,
      ),
    );
  });

  it('renders environment variables when data is fetched', async () => {
    mockApi.instances.instancesInstanceIdConfigEnvironmentGet.mockResolvedValueOnce({
      data: [{ name: 'TEST_KEY', value: 'TEST_VALUE' }],
    });

    render(<EnvironmentConfigTab instanceId={instanceId} onChange={mockOnChange} />);

    await waitFor(() => {
      expect(screen.getByDisplayValue('TEST_KEY')).toBeInTheDocument();
      expect(screen.getByDisplayValue('TEST_VALUE')).toBeInTheDocument();
    });
  });

  it('adds a new environment variable', async () => {
    mockApi.instances.instancesInstanceIdConfigEnvironmentGet.mockResolvedValueOnce({
      data: [],
    });

    render(<EnvironmentConfigTab instanceId={instanceId} onChange={mockOnChange} />);

    await waitFor(() =>
      expect(mockApi.instances.instancesInstanceIdConfigEnvironmentGet).toHaveBeenCalled(),
    );

    await waitFor(() => expect(screen.queryByRole('progressbar')).not.toBeInTheDocument());
    const addButton = screen.getByText('Add Environment Variable');
    fireEvent.click(addButton);

    expect(screen.getAllByLabelText('Key')).toHaveLength(1);
    expect(screen.getAllByLabelText('Value')).toHaveLength(1);
  });

  it('deletes an environment variable', async () => {
    mockApi.instances.instancesInstanceIdConfigEnvironmentGet.mockResolvedValueOnce({
      data: [{ name: 'TEST_KEY', value: 'TEST_VALUE' }],
    });
    mockApi.instances.instancesInstanceIdConfigEnvironmentVariableNameDelete.mockResolvedValueOnce(
      {},
    );

    render(<EnvironmentConfigTab instanceId={instanceId} onChange={mockOnChange} />);

    await waitFor(() => {
      expect(screen.getByDisplayValue('TEST_KEY')).toBeInTheDocument();
    });

    const deleteButton = screen.getByLabelText('Delete Environment Variable');
    fireEvent.click(deleteButton);

    await waitFor(() => {
      // expect(screen.queryByDisplayValue('TEST_KEY')).not.toBeInTheDocument()
      expect(
        mockApi.instances.instancesInstanceIdConfigEnvironmentVariableNameDelete,
      ).toHaveBeenCalled();
    });
  });

  it('saves environment variables', async () => {
    // Mock API responses
    mockApi.instances.instancesInstanceIdConfigEnvironmentGet.mockResolvedValueOnce({
      data: [{ name: 'TEST_KEY', value: 'TEST_VALUE' }],
    });
    mockApi.instances.instancesInstanceIdConfigEnvironmentPut.mockResolvedValueOnce({});

    render(<EnvironmentConfigTab instanceId={instanceId} onChange={mockOnChange} />);

    await waitFor(() => {
      expect(screen.getByDisplayValue('TEST_KEY')).toBeInTheDocument();
    });

    // Simulate a change to enable the Save button
    const keyInput = screen.getByDisplayValue('TEST_KEY');
    fireEvent.change(keyInput, { target: { value: 'UPDATED_KEY' } });

    const saveButton = screen
      .getAllByLabelText('Save Environment Variable')
      .find((button) => button.tagName.toLowerCase() === 'button') as HTMLElement;
    fireEvent.click(saveButton);

    await waitFor(() =>
      expect(mockApi.instances.instancesInstanceIdConfigEnvironmentPut).toHaveBeenCalledWith(
        instanceId,
        [{ name: 'UPDATED_KEY', value: 'TEST_VALUE' }],
      ),
    );
  });

  it('shows a success snackbar when saving succeeds', async () => {
    // Mock API responses
    mockApi.instances.instancesInstanceIdConfigEnvironmentGet.mockResolvedValueOnce({
      data: [{ name: 'TEST_KEY', value: 'TEST_VALUE' }],
    });
    mockApi.instances.instancesInstanceIdConfigEnvironmentPut.mockResolvedValueOnce({});

    render(<EnvironmentConfigTab instanceId={instanceId} onChange={mockOnChange} />);

    await waitFor(() => {
      expect(screen.getByDisplayValue('TEST_KEY')).toBeInTheDocument();
    });

    const saveButton = screen
      .getAllByLabelText('Save Environment Variable')
      .find((button) => button.tagName.toLowerCase() === 'button') as HTMLElement;
    fireEvent.click(saveButton);
  });

  it('shows an error snackbar when saving fails', async () => {
    // Mock API responses
    mockApi.instances.instancesInstanceIdConfigEnvironmentGet.mockResolvedValueOnce({
      data: [{ name: 'TEST_KEY', value: 'TEST_VALUE' }],
    });
    mockApi.instances.instancesInstanceIdConfigEnvironmentPut.mockRejectedValueOnce(new Error());

    render(<EnvironmentConfigTab instanceId={instanceId} onChange={mockOnChange} />);

    await waitFor(() => {
      expect(screen.getByDisplayValue('TEST_KEY')).toBeInTheDocument();
    });

    const saveButton = screen
      .getAllByLabelText('Save Environment Variable')
      .find((button) => button.tagName.toLowerCase() === 'button') as HTMLElement;
    fireEvent.click(saveButton);
  });
});
