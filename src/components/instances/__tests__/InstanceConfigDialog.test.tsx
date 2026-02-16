import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import InstanceConfigDialog from '../InstanceConfigDialog';
import { createMockApi } from '../../../__mocks__/core-client-ts';

// Mock the API provider
const mockUseProtectedApi = vi.fn();

vi.mock('@contexts/api/ApiProvider', () => ({
  useProtectedApi: () => mockUseProtectedApi(),
}));

describe('InstanceConfigDialog', () => {
  const mockOnClose = vi.fn();
  const mockSetActiveTab = vi.fn();
  const mockInstanceId = 'test-instance-id';
  const mockInstanceName = 'Test Instance';

  beforeEach(() => {
    vi.clearAllMocks();
    const mockApi = createMockApi();
    mockUseProtectedApi.mockReturnValue(mockApi);
  });

  it('renders the dialog with the correct title', async () => {
    render(
      <InstanceConfigDialog
        open={true}
        onClose={mockOnClose}
        instanceId={mockInstanceId}
        instanceName={mockInstanceName}
        activeTab={0}
        setActiveTab={mockSetActiveTab}
      />,
    );

    await waitFor(() => {
      expect(screen.getByText(`Configure ${mockInstanceName}`)).toBeInTheDocument();
    });
  });

  it('switches between tabs', async () => {
    render(
      <InstanceConfigDialog
        open={true}
        onClose={mockOnClose}
        instanceId={mockInstanceId}
        instanceName={mockInstanceName}
        activeTab={0}
        setActiveTab={mockSetActiveTab}
      />,
    );

    // Check initial tab
    await waitFor(() => {
      expect(screen.getByText('USB Devices')).toBeInTheDocument();
    });

    // Switch to "Network Interfaces" tab
    const networkTab = screen.getByRole('tab', { name: 'Network Interfaces' });
    fireEvent.click(networkTab);
    await waitFor(() => {
      expect(screen.getByText('Network Interfaces')).toBeInTheDocument();
    });

    // Switch to "Ports" tab
    const portsTab = screen.getByRole('tab', { name: 'Ports' });
    fireEvent.click(portsTab);
    await waitFor(() => {
      expect(screen.getByText('Ports')).toBeInTheDocument();
    });
  });

  it('calls onClose when the dialog is closed without changes', async () => {
    render(
      <InstanceConfigDialog
        open={true}
        onClose={mockOnClose}
        instanceId={mockInstanceId}
        instanceName={mockInstanceName}
        activeTab={0}
        setActiveTab={mockSetActiveTab}
      />,
    );

    const closeButton = screen.getByText('Close');
    fireEvent.click(closeButton);

    await waitFor(() => {
      expect(mockOnClose).toHaveBeenCalled();
    });
  });
});
