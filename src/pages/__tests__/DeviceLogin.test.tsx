/*
 * Copyright (c) 2025 FLECS Technologies GmbH
 *
 * Created on Thu Sep 12 2025
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
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import DeviceLogin from '../DeviceLogin';

// Mock the external dependencies
const mockSigninRedirect = vi.fn();
const mockSystemPingGet = vi.fn();
const mockUpdateClientId = vi.fn();

vi.mock('react-oidc-context', () => ({
  useAuth: vi.fn(),
}));

vi.mock('../../components/providers/ApiProvider', () => ({
  usePublicApi: vi.fn(),
}));

vi.mock('../../components/providers/AuthProvider', () => ({
  useAuthConfig: vi.fn(),
}));

vi.mock('../../whitelabeling/WhiteLabelLogo', () => ({
  __esModule: true,
  default: () => <div data-testid="white-label-logo">Logo</div>,
}));

// Import the mocked modules
import { useAuth } from 'react-oidc-context';
import { usePublicApi } from '../../components/providers/ApiProvider';
import { useAuthConfig } from '../../components/providers/AuthProvider';

const mockedUseAuth = vi.mocked(useAuth);
const mockedUsePublicApi = vi.mocked(usePublicApi);
const mockedUseAuthConfig = vi.mocked(useAuthConfig);

describe('DeviceLogin', () => {
  let mockApi: any;
  let mockAuth: any;
  let mockAuthConfig: any;

  beforeEach(() => {
    vi.clearAllMocks();

    mockApi = {
      system: {
        systemPingGet: mockSystemPingGet,
      },
    };

    mockAuth = {
      signinRedirect: mockSigninRedirect,
    };

    mockAuthConfig = {
      oidcConfig: { client_id: 'test-client-id' },
      updateClientId: mockUpdateClientId,
    };

    mockedUsePublicApi.mockReturnValue(mockApi);
    mockedUseAuth.mockReturnValue(mockAuth);
    mockedUseAuthConfig.mockReturnValue(mockAuthConfig);

    // Default successful ping response - use resolved promise to avoid async issues
    mockSystemPingGet.mockImplementation(() => Promise.resolve({}));
  });

  describe('Rendering', () => {
    it('renders the login page with all elements', async () => {
      render(<DeviceLogin />);

      expect(screen.getByTestId('white-label-logo')).toBeInTheDocument();
      expect(screen.getByText('Welcome')).toBeInTheDocument();
      expect(screen.getByText('Please authenticate to continue')).toBeInTheDocument();

      await waitFor(() => {
        expect(screen.getByLabelText(/client id/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
      });
    });

    it('shows loading state initially', async () => {
      // Make ping promise never resolve to keep loading state
      mockSystemPingGet.mockImplementation(() => new Promise(() => {}));

      render(<DeviceLogin />);

      expect(screen.getByRole('progressbar')).toBeInTheDocument();
      expect(screen.getByText('Checking system availability...')).toBeInTheDocument();
    });

    it('initializes client ID from config', async () => {
      render(<DeviceLogin />);

      await waitFor(() => {
        const clientIdField = screen.getByLabelText(/client id/i);
        expect(clientIdField).toHaveValue('test-client-id');
      });
    });
  });

  describe('System Availability Check', () => {
    it('shows login form when backend is available', async () => {
      mockSystemPingGet.mockResolvedValue({});

      render(<DeviceLogin />);

      await waitFor(() => {
        expect(screen.getByLabelText(/client id/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
      });

      expect(mockSystemPingGet).toHaveBeenCalled();
    });

    it('shows error when backend is not available', async () => {
      mockSystemPingGet.mockRejectedValue(new Error('Backend unavailable'));

      render(<DeviceLogin />);

      await waitFor(() => {
        expect(
          screen.getByText('Backend is not available. Please try again later.'),
        ).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
      });

      expect(mockSystemPingGet).toHaveBeenCalled();
    });

    it('handles retry functionality', async () => {
      mockSystemPingGet.mockRejectedValueOnce(new Error('Backend unavailable'));

      render(<DeviceLogin />);

      await waitFor(() => {
        expect(
          screen.getByText('Backend is not available. Please try again later.'),
        ).toBeInTheDocument();
      });

      // Reset mock to succeed on retry
      mockSystemPingGet.mockResolvedValue({});

      const retryButton = screen.getByRole('button', { name: /retry/i });
      fireEvent.click(retryButton);

      await waitFor(() => {
        expect(screen.getByLabelText(/client id/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
      });

      expect(mockSystemPingGet).toHaveBeenCalledTimes(2);
    });
  });

  describe('Client ID Management', () => {
    it('allows editing client ID', async () => {
      const user = userEvent.setup();
      render(<DeviceLogin />);

      await waitFor(() => {
        expect(screen.getByLabelText(/client id/i)).toBeInTheDocument();
      });

      const clientIdField = screen.getByLabelText(/client id/i);
      await user.clear(clientIdField);
      await user.type(clientIdField, 'new-client-id');

      expect(clientIdField).toHaveValue('new-client-id');
    });

    it('enables apply button when client ID changes', async () => {
      const user = userEvent.setup();
      render(<DeviceLogin />);

      await waitFor(() => {
        expect(screen.getByLabelText(/client id/i)).toBeInTheDocument();
      });

      const clientIdField = screen.getByLabelText(/client id/i);
      const applyButton = screen.getByTitle('Apply Client ID');

      // Initially disabled
      expect(applyButton).toBeDisabled();

      // Enable after changing value
      await user.clear(clientIdField);
      await user.type(clientIdField, 'new-client-id');

      expect(applyButton).not.toBeDisabled();
    });

    it('applies client ID when apply button is clicked', async () => {
      const user = userEvent.setup();
      render(<DeviceLogin />);

      await waitFor(() => {
        expect(screen.getByLabelText(/client id/i)).toBeInTheDocument();
      });

      const clientIdField = screen.getByLabelText(/client id/i);
      const applyButton = screen.getByTitle('Apply Client ID');

      await user.clear(clientIdField);
      await user.type(clientIdField, 'new-client-id');
      await user.click(applyButton);

      expect(mockUpdateClientId).toHaveBeenCalledWith('new-client-id');
    });

    it('disables apply button when client ID matches config', async () => {
      const user = userEvent.setup();
      render(<DeviceLogin />);

      await waitFor(() => {
        expect(screen.getByLabelText(/client id/i)).toBeInTheDocument();
      });

      const clientIdField = screen.getByLabelText(/client id/i);
      const applyButton = screen.getByTitle('Apply Client ID');

      // Change and then revert to original value
      await user.clear(clientIdField);
      await user.type(clientIdField, 'new-client-id');
      expect(applyButton).not.toBeDisabled();

      await user.clear(clientIdField);
      await user.type(clientIdField, 'test-client-id');
      expect(applyButton).toBeDisabled();
    });
  });

  describe('Login Functionality', () => {
    it('calls signinRedirect when login button is clicked and no error', async () => {
      mockSystemPingGet.mockResolvedValue({});

      render(<DeviceLogin />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
      });

      const loginButton = screen.getByRole('button', { name: /login/i });
      fireEvent.click(loginButton);

      expect(mockSigninRedirect).toHaveBeenCalled();
    });

    it('does not call signinRedirect when there is an error', async () => {
      mockSystemPingGet.mockRejectedValue(new Error('Backend unavailable'));

      render(<DeviceLogin />);

      await waitFor(() => {
        expect(
          screen.getByText('Backend is not available. Please try again later.'),
        ).toBeInTheDocument();
      });

      // Login button should not be visible when there's an error
      expect(screen.queryByRole('button', { name: /login/i })).not.toBeInTheDocument();
      expect(mockSigninRedirect).not.toHaveBeenCalled();
    });
  });

  describe('Loading States', () => {
    it('shows loading during initial backend check', () => {
      // Make ping promise never resolve to keep loading state
      mockSystemPingGet.mockImplementation(() => new Promise(() => {}));

      render(<DeviceLogin />);

      expect(screen.getByRole('progressbar')).toBeInTheDocument();
      expect(screen.getByText('Checking system availability...')).toBeInTheDocument();
      expect(screen.queryByLabelText(/client id/i)).not.toBeInTheDocument();
    });

    it('shows loading during retry', async () => {
      mockSystemPingGet.mockRejectedValueOnce(new Error('Backend unavailable'));

      render(<DeviceLogin />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
      });

      // Make retry hang to see loading state
      mockSystemPingGet.mockReturnValue(new Promise(() => {}));

      const retryButton = screen.getByRole('button', { name: /retry/i });

      act(() => {
        fireEvent.click(retryButton);
      });

      expect(screen.getByRole('progressbar')).toBeInTheDocument();
      expect(screen.getByText('Checking system availability...')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('displays error alert with correct styling', async () => {
      mockSystemPingGet.mockRejectedValue(new Error('Backend unavailable'));

      render(<DeviceLogin />);

      await waitFor(() => {
        const errorAlert = screen.getByText('Backend is not available. Please try again later.');
        expect(errorAlert).toBeInTheDocument();
        expect(errorAlert.closest('[role="alert"]')).toBeInTheDocument();
      });
    });

    it('clears error on successful retry', async () => {
      mockSystemPingGet.mockRejectedValueOnce(new Error('Backend unavailable'));

      render(<DeviceLogin />);

      await waitFor(() => {
        expect(
          screen.getByText('Backend is not available. Please try again later.'),
        ).toBeInTheDocument();
      });

      // Success on retry
      mockSystemPingGet.mockResolvedValue({});

      const retryButton = screen.getByRole('button', { name: /retry/i });
      fireEvent.click(retryButton);

      await waitFor(() => {
        expect(
          screen.queryByText('Backend is not available. Please try again later.'),
        ).not.toBeInTheDocument();
        expect(screen.getByLabelText(/client id/i)).toBeInTheDocument();
      });
    });
  });

  describe('Component Integration', () => {
    it('updates client ID field when config changes', async () => {
      const { rerender } = render(<DeviceLogin />);

      await waitFor(() => {
        expect(screen.getByLabelText(/client id/i)).toHaveValue('test-client-id');
      });

      // Update mock to return different client ID
      mockAuthConfig.oidcConfig.client_id = 'updated-client-id';
      mockedUseAuthConfig.mockReturnValue(mockAuthConfig);

      act(() => {
        rerender(<DeviceLogin />);
      });

      await waitFor(() => {
        expect(screen.getByLabelText(/client id/i)).toHaveValue('updated-client-id');
      });
    });

    it('renders WhiteLabelLogo component', async () => {
      // Make ping promise never resolve to avoid state updates
      mockSystemPingGet.mockImplementation(() => new Promise(() => {}));

      render(<DeviceLogin />);

      expect(screen.getByTestId('white-label-logo')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper form labels and structure', async () => {
      render(<DeviceLogin />);

      await waitFor(() => {
        expect(screen.getByLabelText(/client id/i)).toBeInTheDocument();
      });

      const clientIdField = screen.getByLabelText(/client id/i);
      const loginButton = screen.getByRole('button', { name: /login/i });
      const applyButton = screen.getByTitle('Apply Client ID');

      expect(clientIdField).toBeInTheDocument();
      expect(loginButton).toBeInTheDocument();
      expect(applyButton).toBeInTheDocument();
    });

    it('has proper heading structure', async () => {
      // Make ping promise never resolve to avoid state updates
      mockSystemPingGet.mockImplementation(() => new Promise(() => {}));

      render(<DeviceLogin />);

      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toHaveTextContent('Welcome');
    });

    it('provides appropriate button titles and labels', async () => {
      render(<DeviceLogin />);

      await waitFor(() => {
        expect(screen.getByTitle('Apply Client ID')).toBeInTheDocument();
      });

      expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles empty client ID input', async () => {
      const user = userEvent.setup();
      render(<DeviceLogin />);

      await waitFor(() => {
        expect(screen.getByLabelText(/client id/i)).toBeInTheDocument();
      });

      const clientIdField = screen.getByLabelText(/client id/i);
      const applyButton = screen.getByTitle('Apply Client ID');

      await user.clear(clientIdField);

      expect(clientIdField).toHaveValue('');
      expect(applyButton).not.toBeDisabled(); // Should be enabled since it's different from config

      await user.click(applyButton);
      expect(mockUpdateClientId).toHaveBeenCalledWith('');
    });

    it('handles undefined client_id in config', async () => {
      mockAuthConfig.oidcConfig.client_id = undefined;
      mockedUseAuthConfig.mockReturnValue(mockAuthConfig);

      render(<DeviceLogin />);

      await waitFor(() => {
        const clientIdField = screen.getByLabelText(/client id/i);
        expect(clientIdField).toHaveValue('');
      });
    });

    it('handles multiple rapid clicks on retry button', async () => {
      mockSystemPingGet.mockRejectedValue(new Error('Backend unavailable'));

      render(<DeviceLogin />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
      });

      const retryButton = screen.getByRole('button', { name: /retry/i });

      // Click multiple times rapidly
      fireEvent.click(retryButton);
      fireEvent.click(retryButton);
      fireEvent.click(retryButton);

      // Should only make one additional call (initial + 1 from first click)
      // The subsequent clicks should be ignored while loading
      await waitFor(() => {
        expect(mockSystemPingGet).toHaveBeenCalledTimes(2);
      });
    });
  });
});
