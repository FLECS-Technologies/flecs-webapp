import React from 'react'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import '@testing-library/jest-dom'
import InstanceConfigDialog from '../InstanceConfigDialog'
import { api } from '../../../api/flecs-core/api-client'

// Mock the API client
jest.mock('../../../api/flecs-core/api-client', () => ({
  api: {
    system: {
      systemDevicesUsbGet: jest.fn()
    },
    instances: {
      instancesInstanceIdStopPost: jest.fn(),
      instancesInstanceIdStartPost: jest.fn(),
      instancesInstanceIdConfigDevicesUsbGet: jest.fn(),
      instancesInstanceIdConfigDevicesUsbPortPut: jest.fn(),
      instancesInstanceIdConfigDevicesUsbPortDelete: jest.fn(),
      instancesInstanceIdConfigPortsGet: jest.fn(),
      instancesInstanceIdConfigPortsTransportProtocolPut: jest.fn(),
      instancesInstanceIdConfigEnvironmentGet: jest.fn(),
      instancesInstanceIdConfigEnvironmentPut: jest.fn()
    }
  }
}))

describe('InstanceConfigDialog', () => {
  const mockOnClose = jest.fn()
  const mockInstanceId = 'test-instance-id'
  const mockInstanceName = 'Test Instance'

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders the dialog with the correct title', async () => {
    render(
      <InstanceConfigDialog
        open={true}
        onClose={mockOnClose}
        instanceId={mockInstanceId}
        instanceName={mockInstanceName}
      />
    )

    await waitFor(() => {
      expect(
        screen.getByText(`Configure ${mockInstanceName}`)
      ).toBeInTheDocument()
    })
  })

  it('switches between tabs', async () => {
    render(
      <InstanceConfigDialog
        open={true}
        onClose={mockOnClose}
        instanceId={mockInstanceId}
        instanceName={mockInstanceName}
      />
    )

    // Check initial tab
    await waitFor(() => {
      expect(screen.getByText('USB Devices')).toBeInTheDocument()
    })

    // Switch to "Network Interfaces" tab
    const networkTab = screen.getByRole('tab', { name: 'Network Interfaces' })
    fireEvent.click(networkTab)
    await waitFor(() => {
      expect(screen.getByText('Network Interfaces')).toBeInTheDocument()
    })

    // Switch to "Ports" tab
    const portsTab = screen.getByRole('tab', { name: 'Ports' })
    fireEvent.click(portsTab)
    await waitFor(() => {
      expect(screen.getByText('Ports')).toBeInTheDocument()
    })
  })

  it('calls onClose when the dialog is closed without changes', async () => {
    render(
      <InstanceConfigDialog
        open={true}
        onClose={mockOnClose}
        instanceId={mockInstanceId}
        instanceName={mockInstanceName}
      />
    )

    const closeButton = screen.getByText('Close')
    fireEvent.click(closeButton)

    await waitFor(() => {
      expect(mockOnClose).toHaveBeenCalled()
    })
  })
})
