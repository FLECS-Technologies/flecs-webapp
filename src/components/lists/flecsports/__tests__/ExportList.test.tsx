import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ExportList from '../ExportList';
import { createMockApi } from '../../../../__mocks__/core-client-ts';

// Mock the API provider
const mockUseProtectedApi = vi.fn();

vi.mock('@contexts/api/ApiProvider', () => ({
  useProtectedApi: () => mockUseProtectedApi(),
}));

// Polyfill for JSDOM
if (!('createObjectURL' in URL)) {
  // @ts-ignore
  URL.createObjectURL = vi.fn(() => 'blob:url');
}
if (!('revokeObjectURL' in URL)) {
  // @ts-ignore
  URL.revokeObjectURL = vi.fn();
}

describe('<ExportList />', () => {
  let mockApi: ReturnType<typeof createMockApi>;

  beforeEach(() => {
    vi.resetAllMocks();
    mockApi = createMockApi();
    mockUseProtectedApi.mockReturnValue(mockApi);
  });

  it('renders loading spinner initially', () => {
    mockApi.export.exportsGet.mockReturnValue(new Promise(() => {}));
    render(<ExportList />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('renders error message when fetch fails', async () => {
    mockApi.export.exportsGet.mockRejectedValue(new Error('Network error'));
    render(<ExportList />);
    await waitFor(() => expect(screen.getByText(/Failed to load exports/i)).toBeInTheDocument());
  });

  it('renders empty state when no exports', async () => {
    mockApi.export.exportsGet.mockResolvedValue({ data: [] });
    render(<ExportList />);
    await waitFor(() => expect(screen.getByText(/No exports found/i)).toBeInTheDocument());
  });

  it('renders exports table when data is available', async () => {
    mockApi.export.exportsGet.mockResolvedValue({ data: ['export1', 'export2'] });
    render(<ExportList />);
    expect(await screen.findByText(/Exports/)).toBeInTheDocument();
    expect(screen.getByText('export1')).toBeInTheDocument();
    expect(screen.getByText('export2')).toBeInTheDocument();
  });

  it('handles download action', async () => {
    mockApi.export.exportsGet.mockResolvedValue({ data: ['export1'] });
    mockApi.export.exportsExportIdGet.mockResolvedValue({
      data: new Blob(['test content']),
    });

    // Mock URL.createObjectURL
    const createObjectURLMock = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:url');
    const revokeObjectURLMock = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});

    render(<ExportList />);

    const downloadButton = await screen.findByLabelText('download');
    fireEvent.click(downloadButton);

    await waitFor(() => {
      expect(mockApi.export.exportsExportIdGet).toHaveBeenCalledWith('export1', {
        responseType: 'blob',
      });
      expect(createObjectURLMock).toHaveBeenCalled();
      expect(revokeObjectURLMock).toHaveBeenCalled();
    });

    createObjectURLMock.mockRestore();
    revokeObjectURLMock.mockRestore();
  });

  it('handles delete action', async () => {
    mockApi.export.exportsGet.mockResolvedValue({ data: ['export1'] });
    mockApi.export.exportsExportIdDelete.mockResolvedValue({});

    render(<ExportList />);

    const deleteButton = await screen.findByLabelText('delete');
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(mockApi.export.exportsExportIdDelete).toHaveBeenCalledWith('export1');
      expect(screen.getByText(/No exports found/i)).toBeInTheDocument();
    });
  });
});
