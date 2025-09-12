/*
 * Copyright (c) 2022 FLECS Technologies GmbH
 *
 * Created on Tue Jan 30 2024
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
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import DeviceActivationStep from '../DeviceActivationStep';
import { DeviceActivationContext } from '../../../providers/DeviceActivationContext';
import { MarketplaceUserProvider } from '../../../providers/MarketplaceUserProvider';
import { createMockApi } from '../../../../__mocks__/core-client-ts';

// Mock the API provider
const mockUseProtectedApi = vi.fn();

vi.mock('../../../../components/providers/ApiProvider', () => ({
  useProtectedApi: () => mockUseProtectedApi(),
}));

describe('DeviceActivationStep Component', () => {
  let mockHandleNext: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockHandleNext = vi.fn();
    mockUseProtectedApi.mockReturnValue(createMockApi());
  });

  const renderWithProviders = (deviceActivationValue: any, component: React.ReactElement) => {
    return render(
      <MarketplaceUserProvider>
        <DeviceActivationContext.Provider value={deviceActivationValue}>
          {component}
        </DeviceActivationContext.Provider>
      </MarketplaceUserProvider>,
    );
  };

  it('renders the DeviceActivationStep component when device is activated', () => {
    renderWithProviders(
      {
        activated: true,
        activating: false,
        activate: vi.fn(),
        validating: false,
        validate: vi.fn(),
        error: false,
        statusText: '',
      },
      <DeviceActivationStep handleNext={mockHandleNext} />,
    );

    expect(screen.getByTestId('device-activation-step')).toBeInTheDocument();
    expect(mockHandleNext).toHaveBeenCalled();
  });

  it('renders the DeviceActivationStep component when device is not activated', () => {
    renderWithProviders(
      {
        activated: false,
        activating: false,
        activate: vi.fn(),
        validating: false,
        validate: vi.fn(),
        error: false,
        statusText: '',
      },
      <DeviceActivationStep handleNext={mockHandleNext} />,
    );

    expect(screen.getByTestId('device-activation-step')).toBeInTheDocument();
    expect(mockHandleNext).not.toHaveBeenCalled();
  });

  it('calls handleNext when device becomes activated', async () => {
    const mockActivate = vi.fn();

    const { rerender } = render(
      <MarketplaceUserProvider>
        <DeviceActivationContext.Provider
          value={{
            activated: false,
            activating: false,
            activate: mockActivate,
            validating: false,
            validate: vi.fn(),
            error: false,
            statusText: '',
          }}
        >
          <DeviceActivationStep handleNext={mockHandleNext} />
        </DeviceActivationContext.Provider>
      </MarketplaceUserProvider>,
    );

    expect(mockHandleNext).not.toHaveBeenCalled();

    // Simulate device becoming activated
    rerender(
      <MarketplaceUserProvider>
        <DeviceActivationContext.Provider
          value={{
            activated: true,
            activating: false,
            activate: mockActivate,
            validating: false,
            validate: vi.fn(),
            error: false,
            statusText: '',
          }}
        >
          <DeviceActivationStep handleNext={mockHandleNext} />
        </DeviceActivationContext.Provider>
      </MarketplaceUserProvider>,
    );

    await waitFor(() => {
      expect(mockHandleNext).toHaveBeenCalled();
    });
  });

  it('handles case when handleNext is not provided', () => {
    renderWithProviders(
      {
        activated: true,
        activating: false,
        activate: vi.fn(),
        validating: false,
        validate: vi.fn(),
        error: false,
        statusText: '',
      },
      <DeviceActivationStep />,
    );

    expect(screen.getByTestId('device-activation-step')).toBeInTheDocument();
    // Should not throw an error even when handleNext is not provided
  });
});
