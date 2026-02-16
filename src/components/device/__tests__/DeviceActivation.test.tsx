/*
 * Copyright (c) 2022 FLECS Technologies GmbH
 *
 * Created on Wed Jan 31 2024
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
import { render, act, screen } from '@testing-library/react';
import DeviceActivation from '../DeviceActivation';
import { DeviceActivationContext } from '@contexts/device/DeviceActivationContext';
import {
  MarketplaceUserProvider,
  MarketplaceUserContext,
} from '@contexts/marketplace/MarketplaceUserProvider';

import { vi } from 'vitest';

// Mock the API calls directly to avoid provider complexity
vi.mock('@contexts/api/ApiProvider', () => ({
  useProtectedApi: () => ({
    console: {
      consoleAuthenticationPut: vi.fn().mockResolvedValue({ data: {} }),
    },
  }),
}));

jest.mock('../../../api/device/license/status');

describe('DeviceActivation Component', () => {
  afterAll(() => {
    jest.clearAllMocks();
  });

  // Create a mock MarketplaceUserProvider that provides a mock user
  const MockMarketplaceUserProvider = ({ children }: { children: React.ReactNode }) => {
    const mockContextValue = {
      user: {
        ID: 1,
        user_login: 'testuser',
        display_name: 'Test User',
        user_email: 'test@example.com',
      },
      setUser: jest.fn(),
      userChanged: false,
      authHeaderUseBearer: jest.fn(() => ({})),
      authorizationHeaderUseBearer: jest.fn(() => ({})),
      authHeaderUseXAccess: jest.fn(() => ({})),
      jwt: jest.fn(() => ''),
    };

    return (
      <MarketplaceUserContext.Provider value={mockContextValue}>
        {children}
      </MarketplaceUserContext.Provider>
    );
  };

  const renderWithProviders = (ui: React.ReactElement, contextValue: any, hasUser = true) => {
    const UserProvider = hasUser
      ? MockMarketplaceUserProvider
      : ({ children }: { children: React.ReactNode }) => (
          <MarketplaceUserContext.Provider
            value={{
              user: null,
              setUser: jest.fn(),
              userChanged: false,
              authHeaderUseBearer: jest.fn(() => ({})),
              authorizationHeaderUseBearer: jest.fn(() => ({})),
              authHeaderUseXAccess: jest.fn(() => ({})),
              jwt: jest.fn(() => ''),
            }}
          >
            {children}
          </MarketplaceUserContext.Provider>
        );

    return render(
      <UserProvider>
        <DeviceActivationContext.Provider value={contextValue}>
          {ui}
        </DeviceActivationContext.Provider>
      </UserProvider>,
    );
  };

  it('Device is activated', () => {
    act(() => {
      renderWithProviders(<DeviceActivation />, {
        activated: true,
        activating: false,
        activate: async () => {},
        validating: false,
        validate: async () => {},
        error: false,
        statusText: 'Device is activated!',
      });
    });

    const infoText = screen.getByText('Device is activated!');
    expect(infoText).toBeInTheDocument();
    const activateButton = screen.getByText('Activate Device');
    expect(activateButton).toBeVisible();
    expect(activateButton).not.toBeEnabled();
  });

  it('Device is not activated', () => {
    act(() => {
      renderWithProviders(<DeviceActivation />, {
        activated: false,
        activating: false,
        activate: async () => {},
        validating: false,
        validate: async () => {},
        error: false,
        statusText: 'Device is not activated!',
      });
    });

    const infoText = screen.getByText('Device is not activated!');
    expect(infoText).toBeInTheDocument();
    const activateButton = screen.getByText('Activate Device');
    expect(activateButton).toBeVisible();
    expect(activateButton).toBeEnabled();
  });

  it('Activating device...', () => {
    act(() => {
      renderWithProviders(<DeviceActivation />, {
        activated: false,
        activating: true,
        activate: async () => {},
        validating: false,
        validate: async () => {},
        error: false,
        statusText: 'Activating the device...',
      });
    });

    const infoText = screen.getByText('Activating the device...');
    expect(infoText).toBeInTheDocument();
    const activateButton = screen.getByText('Activate Device');
    expect(activateButton).toBeVisible();
    expect(activateButton).not.toBeEnabled();
  });

  it('Checking the device activation status...', () => {
    act(() => {
      renderWithProviders(<DeviceActivation />, {
        activated: false,
        activating: false,
        activate: async () => {},
        validating: true,
        validate: async () => {},
        error: false,
        statusText: 'Checking the device activation status...',
      });
    });

    const infoText = screen.getByText('Checking the device activation status...');
    expect(infoText).toBeInTheDocument();
    const activateButton = screen.getByText('Activate Device');
    expect(activateButton).toBeVisible();
    expect(activateButton).not.toBeEnabled();
  });

  it('Line-Variant: Device is activated', () => {
    act(() => {
      renderWithProviders(<DeviceActivation variant="line" />, {
        activated: true,
        activating: false,
        activate: async () => {},
        validating: false,
        validate: async () => {},
        error: false,
        statusText: 'Device is activated!',
      });
    });

    const infoText = screen.getByText('Device is activated!');
    expect(infoText).toBeInTheDocument();
    const activateButton = screen.getByText('Activate Device');
    expect(activateButton).toBeVisible();
    expect(activateButton).not.toBeEnabled();
  });

  it('Error on checking the device activation status shows marketplace login', () => {
    act(() => {
      renderWithProviders(
        <DeviceActivation />,
        {
          activated: false,
          activating: false,
          activate: async () => {},
          validating: false,
          validate: async () => {},
          error: true,
          statusText:
            'Failed to check activation status! Please login with your account and try again.',
        },
        true,
      );
    });

    // Should show the info box
    const infoBoxTitle = screen.getByText('Device Activation Required');
    expect(infoBoxTitle).toBeInTheDocument();
    const infoBoxMessage = screen.getByText(
      /To activate this device, you need to login with your marketplace account/,
    );
    expect(infoBoxMessage).toBeInTheDocument();

    // Should show the marketplace login form
    const usernameField = screen.getByLabelText(/username/i);
    expect(usernameField).toBeInTheDocument();
    const passwordField = screen.getByLabelText(/password/i);
    expect(passwordField).toBeInTheDocument();
    const loginButton = screen.getByText('Login');
    expect(loginButton).toBeInTheDocument();
  });

  it('Shows info box and marketplace login when no user is logged in and device is not activated', () => {
    act(() => {
      renderWithProviders(
        <DeviceActivation />,
        {
          activated: false, // Device is NOT activated
          activating: false,
          activate: async () => {},
          validating: false,
          validate: async () => {},
          error: false,
          statusText: 'Device is not activated!',
        },
        false, // Pass false to indicate no user
      );
    });

    // Should show the info box
    const infoBoxTitle = screen.getByText('Device Activation Required');
    expect(infoBoxTitle).toBeInTheDocument();
    const infoBoxMessage = screen.getByText(
      /To activate this device, you need to login with your marketplace account/,
    );
    expect(infoBoxMessage).toBeInTheDocument();

    // Should show the marketplace login form
    const usernameField = screen.getByLabelText(/username/i);
    expect(usernameField).toBeInTheDocument();
    const passwordField = screen.getByLabelText(/password/i);
    expect(passwordField).toBeInTheDocument();
    const loginButton = screen.getByText('Login');
    expect(loginButton).toBeInTheDocument();
  });

  it('Shows device activation UI when no user is logged in but device is already activated', () => {
    act(() => {
      renderWithProviders(
        <DeviceActivation />,
        {
          activated: true, // Device IS activated
          activating: false,
          activate: async () => {},
          validating: false,
          validate: async () => {},
          error: false,
          statusText: 'Device is activated!',
        },
        false,
      ); // Pass false to indicate no user
    });

    // Should show the device activation UI, not the marketplace login
    const infoText = screen.getByText('Device is activated!');
    expect(infoText).toBeInTheDocument();
    const activateButton = screen.getByText('Activate Device');
    expect(activateButton).toBeVisible();
    expect(activateButton).not.toBeEnabled();

    // Should NOT show the marketplace login form
    expect(screen.queryByText('Marketplace Login')).not.toBeInTheDocument();
  });

  it('Auto-activates device when marketplace user is present and device is not activated', () => {
    const mockActivate = jest.fn();

    act(() => {
      renderWithProviders(
        <DeviceActivation />,
        {
          activated: false,
          activating: false,
          activate: mockActivate,
          validating: false,
          validate: async () => {},
          error: false,
          statusText: 'Device is not activated!',
        },
        true,
      ); // Pass true to indicate user is present
    });

    // Should call activate when user is present and device is not activated
    expect(mockActivate).toHaveBeenCalled();
  });

  it('Does not auto-activate if device is already activated', () => {
    const mockActivate = jest.fn();

    act(() => {
      renderWithProviders(
        <DeviceActivation />,
        {
          activated: true, // Device is already activated
          activating: false,
          activate: mockActivate,
          validating: false,
          validate: async () => {},
          error: false,
          statusText: 'Device is activated!',
        },
        true,
      );
    });

    // Should NOT call activate when device is already activated
    expect(mockActivate).not.toHaveBeenCalled();
  });

  it('Does not auto-activate if device is currently activating', () => {
    const mockActivate = jest.fn();

    act(() => {
      renderWithProviders(
        <DeviceActivation />,
        {
          activated: false,
          activating: true, // Device is currently activating
          activate: mockActivate,
          validating: false,
          validate: async () => {},
          error: false,
          statusText: 'Activating the device...',
        },
        true,
      );
    });

    // Should NOT call activate when device is already in the process of activating
    expect(mockActivate).not.toHaveBeenCalled();
  });

  it('Shows marketplace login and info box when there is an error in the DeviceActivationProvider', () => {
    const mockActivate = jest.fn();

    act(() => {
      renderWithProviders(
        <DeviceActivation />,
        {
          activated: false,
          activating: false,
          activate: mockActivate,
          validating: false,
          validate: async () => {},
          error: true, // There is an error
          statusText:
            'Failed to check activation status! Please login with your account and try again.',
        },
        true, // Has user
      );
    });

    // Should NOT call activate when there is an error
    expect(mockActivate).not.toHaveBeenCalled();

    // Should show the info box
    const infoBoxTitle = screen.getByText('Device Activation Required');
    expect(infoBoxTitle).toBeInTheDocument();
    const infoBoxMessage = screen.getByText(
      /To activate this device, you need to login with your marketplace account/,
    );
    expect(infoBoxMessage).toBeInTheDocument();

    // Should show the marketplace login form
    const usernameField = screen.getByLabelText(/username/i);
    expect(usernameField).toBeInTheDocument();
    const passwordField = screen.getByLabelText(/password/i);
    expect(passwordField).toBeInTheDocument();
    const loginButton = screen.getByText('Login');
    expect(loginButton).toBeInTheDocument();
  });
});
