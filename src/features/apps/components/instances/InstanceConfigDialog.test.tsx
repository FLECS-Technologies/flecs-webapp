import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import InstanceConfigDialog from '../InstanceConfigDialog';
import { createMockApi } from '../../../../../__mocks__/core-client-ts';

// Mock the API provider
const mockUseProtectedApi = vi.fn();

vi.mock('@shared/api/ApiProvider', () => ({
  useProtectedApi: () => mockUseProtectedApi(),
}));

describe('InstanceConfigDialog', () => {
  const mockOnClose = vi.fn();
  const mockInstanceId = 'test-instance-id';
  const mockInstanceName = 'Test Instance';

  beforeEach(() => {
    vi.clearAllMocks();
    const mockApi = createMockApi();
    mockUseProtectedApi.mockReturnValue(mockApi);
  });

  it('renders the dialog with the instance name', async () => {
    render(
      <InstanceConfigDialog
        open={true}
        onClose={mockOnClose}
        instanceId={mockInstanceId}
        instanceName={mockInstanceName}
      />,
    );

    await waitFor(() => {
      expect(screen.getByText(mockInstanceName)).toBeInTheDocument();
    });
  });

  it('renders all section labels in the sidebar', async () => {
    render(
      <InstanceConfigDialog
        open={true}
        onClose={mockOnClose}
        instanceId={mockInstanceId}
        instanceName={mockInstanceName}
      />,
    );

    await waitFor(() => {
      expect(screen.getAllByText('USB Devices').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Network').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Ports').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Environment').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Editors').length).toBeGreaterThan(0);
    });
  });

  it('switches between sections', async () => {
    render(
      <InstanceConfigDialog
        open={true}
        onClose={mockOnClose}
        instanceId={mockInstanceId}
        instanceName={mockInstanceName}
      />,
    );

    // Click "Network" in sidebar
    const networkItem = screen.getByText('Network');
    fireEvent.click(networkItem);
    await waitFor(() => {
      expect(screen.getByText('Configure network interfaces.')).toBeInTheDocument();
    });

    // Click "Ports" in sidebar
    const portsItem = screen.getByText('Ports');
    fireEvent.click(portsItem);
    await waitFor(() => {
      expect(screen.getByText('Configure port mappings.')).toBeInTheDocument();
    });
  });

  it('calls onClose when the Close button is clicked', async () => {
    render(
      <InstanceConfigDialog
        open={true}
        onClose={mockOnClose}
        instanceId={mockInstanceId}
        instanceName={mockInstanceName}
      />,
    );

    const closeButton = screen.getByText('Close');
    fireEvent.click(closeButton);

    await waitFor(() => {
      expect(mockOnClose).toHaveBeenCalled();
    });
  });
});
