import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import ExportList from '../ExportList';
import { api } from '../../../../api/flecs-core/api-client';
import { vi } from 'vitest';

// Mock the api
vi.mock('../../../../api/flecs-core/api-client', () => ({
  api: {
    export: {
      exportsGet: vi.fn(),
      exportsExportIdGet: vi.fn(),
      exportsExportIdDelete: vi.fn(),
    },
  },
}));

// Polyfill for JSDOM
if (!('createObjectURL' in URL)) {
  // @ts-ignore
  URL.createObjectURL = vi.fn(() => 'blob:url')
}
if (!('revokeObjectURL' in URL)) {
  // @ts-ignore
  URL.revokeObjectURL = vi.fn()
}

describe('<ExportList />', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('renders loading spinner initially', () => {
    (api.export.exportsGet as any).mockReturnValue(new Promise(() => {}));
    render(<ExportList />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('renders error message when fetch fails', async () => {
    (api.export.exportsGet as any).mockRejectedValue(new Error('Network error'));
    render(<ExportList />);
    await waitFor(() =>
      expect(screen.getByText(/Failed to load exports/i)).toBeInTheDocument()
    );
  });

  it('renders empty state when no exports', async () => {
    (api.export.exportsGet as any).mockResolvedValue({ data: [] });
    render(<ExportList />);
    await waitFor(() =>
      expect(screen.getByText(/No exports found/i)).toBeInTheDocument()
    );
  });

  it('renders exports table when data is available', async () => {
    (api.export.exportsGet as any).mockResolvedValue({ data: ['export1', 'export2'] });
    render(<ExportList />);
    expect(await screen.findByText(/Exports/)).toBeInTheDocument();
    expect(screen.getByText('export1')).toBeInTheDocument();
    expect(screen.getByText('export2')).toBeInTheDocument();
  });

  it('handles download action', async () => {
    (api.export.exportsGet as any).mockResolvedValue({ data: ['export1'] });
    (api.export.exportsExportIdGet as any).mockResolvedValue({
      data: new Blob(['test content']),
    });

    // Mock URL.createObjectURL
    const createObjectURLMock = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:url');
    const revokeObjectURLMock = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});

    render(<ExportList />);

    const downloadButton = await screen.findByLabelText('download');
    fireEvent.click(downloadButton);

    await waitFor(() => {
      expect(api.export.exportsExportIdGet).toHaveBeenCalledWith('export1', {
        responseType: 'blob',
      });
      expect(createObjectURLMock).toHaveBeenCalled();
      expect(revokeObjectURLMock).toHaveBeenCalled();
    });

    createObjectURLMock.mockRestore();
    revokeObjectURLMock.mockRestore();
  });

  it('handles delete action', async () => {
    (api.export.exportsGet as any).mockResolvedValue({ data: ['export1'] });
    (api.export.exportsExportIdDelete as any).mockResolvedValue({});

    render(<ExportList />);

    const deleteButton = await screen.findByLabelText('delete');
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(api.export.exportsExportIdDelete).toHaveBeenCalledWith('export1');
      expect(screen.getByText(/No exports found/i)).toBeInTheDocument();
    });
  });
});
