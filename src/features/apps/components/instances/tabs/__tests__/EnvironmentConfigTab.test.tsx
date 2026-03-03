/*
 * Copyright (c) 2022 FLECS Technologies GmbH
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 */
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import EnvironmentConfigTab from '../EnvironmentConfigTab';
import { createMockApi } from '../../../../../../__mocks__/core-client-ts';

// Mock the API provider
const mockUseProtectedApi = vi.fn();

vi.mock('@shared/api/ApiProvider', () => ({
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
      expect(
        mockApi.instances.instancesInstanceIdConfigEnvironmentVariableNameDelete,
      ).toHaveBeenCalled();
    });
  });

  it('saves environment variables via Save All', async () => {
    mockApi.instances.instancesInstanceIdConfigEnvironmentGet.mockResolvedValueOnce({
      data: [{ name: 'TEST_KEY', value: 'TEST_VALUE' }],
    });
    mockApi.instances.instancesInstanceIdConfigEnvironmentPut.mockResolvedValueOnce({});

    render(<EnvironmentConfigTab instanceId={instanceId} onChange={mockOnChange} />);

    await waitFor(() => {
      expect(screen.getByDisplayValue('TEST_KEY')).toBeInTheDocument();
    });

    // Simulate a change to enable the Save All button
    const keyInput = screen.getByDisplayValue('TEST_KEY');
    fireEvent.change(keyInput, { target: { value: 'UPDATED_KEY' } });

    const saveButton = screen.getByLabelText('Save Environment Variable');
    expect(saveButton).not.toBeDisabled();
    fireEvent.click(saveButton);

    await waitFor(() =>
      expect(mockApi.instances.instancesInstanceIdConfigEnvironmentPut).toHaveBeenCalledWith(
        instanceId,
        [{ name: 'UPDATED_KEY', value: 'TEST_VALUE' }],
      ),
    );
  });

  it('shows a success snackbar when saving succeeds', async () => {
    mockApi.instances.instancesInstanceIdConfigEnvironmentGet.mockResolvedValueOnce({
      data: [{ name: 'TEST_KEY', value: 'TEST_VALUE' }],
    });
    mockApi.instances.instancesInstanceIdConfigEnvironmentPut.mockResolvedValueOnce({});

    render(<EnvironmentConfigTab instanceId={instanceId} onChange={mockOnChange} />);

    await waitFor(() => {
      expect(screen.getByDisplayValue('TEST_KEY')).toBeInTheDocument();
    });

    // Modify to enable Save All
    const keyInput = screen.getByDisplayValue('TEST_KEY');
    fireEvent.change(keyInput, { target: { value: 'CHANGED' } });

    const saveButton = screen.getByLabelText('Save Environment Variable');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText(/Saved/)).toBeInTheDocument();
    });
  });

  it('shows an error snackbar when saving fails', async () => {
    mockApi.instances.instancesInstanceIdConfigEnvironmentGet.mockResolvedValueOnce({
      data: [{ name: 'TEST_KEY', value: 'TEST_VALUE' }],
    });
    mockApi.instances.instancesInstanceIdConfigEnvironmentPut.mockRejectedValueOnce(new Error());

    render(<EnvironmentConfigTab instanceId={instanceId} onChange={mockOnChange} />);

    await waitFor(() => {
      expect(screen.getByDisplayValue('TEST_KEY')).toBeInTheDocument();
    });

    // Modify to enable Save All
    const keyInput = screen.getByDisplayValue('TEST_KEY');
    fireEvent.change(keyInput, { target: { value: 'CHANGED' } });

    const saveButton = screen.getByLabelText('Save Environment Variable');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText(/Failed to save/)).toBeInTheDocument();
    });
  });

  it('shows unsaved changes indicator when variables are modified', async () => {
    mockApi.instances.instancesInstanceIdConfigEnvironmentGet.mockResolvedValueOnce({
      data: [{ name: 'TEST_KEY', value: 'TEST_VALUE' }],
    });

    render(<EnvironmentConfigTab instanceId={instanceId} onChange={mockOnChange} />);

    await waitFor(() => {
      expect(screen.getByDisplayValue('TEST_KEY')).toBeInTheDocument();
    });

    const keyInput = screen.getByDisplayValue('TEST_KEY');
    fireEvent.change(keyInput, { target: { value: 'CHANGED' } });

    expect(screen.getByText(/unsaved change/)).toBeInTheDocument();
  });

  it('shows "New" chip on newly added variables', async () => {
    mockApi.instances.instancesInstanceIdConfigEnvironmentGet.mockResolvedValueOnce({
      data: [{ name: 'EXISTING', value: 'val' }],
    });

    render(<EnvironmentConfigTab instanceId={instanceId} onChange={mockOnChange} />);

    await waitFor(() => {
      expect(screen.getByDisplayValue('EXISTING')).toBeInTheDocument();
    });

    const addButton = screen.getByText('Add Environment Variable');
    fireEvent.click(addButton);

    expect(screen.getByText('New')).toBeInTheDocument();
  });
});
