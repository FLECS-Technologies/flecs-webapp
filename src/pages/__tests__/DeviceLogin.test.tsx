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

import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import DeviceLogin from '../DeviceLogin';
import { mockOAuth4WebApiAuth, mockScenarios } from '../../test/oauth-test-utils';

// Mock the external dependencies
const mockSystemPingGet = vi.fn();

// Mock OAuth4WebApiAuthProvider
vi.mock('@contexts/auth/OAuth4WebApiAuthProvider');

vi.mock('@contexts/api/ApiProvider', () => ({
  usePublicApi: vi.fn(),
}));

vi.mock('../../whitelabeling/WhiteLabelLogo', () => ({
  __esModule: true,
  default: () => <div data-testid="white-label-logo">Logo</div>,
}));

// Import the mocked modules
import { usePublicApi } from '@contexts/api/ApiProvider';

const mockedUsePublicApi = vi.mocked(usePublicApi);

describe('DeviceLogin', () => {
  let mockApi: any;

  beforeEach(() => {
    vi.clearAllMocks();

    mockApi = {
      system: {
        systemPingGet: mockSystemPingGet,
      },
    };

    mockedUsePublicApi.mockReturnValue(mockApi);

    // Reset OAuth mock to default unauthenticated state (appropriate for login page)
    mockOAuth4WebApiAuth.reset();
    mockScenarios.unauthenticatedUser();

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

    it('shows login button when system is available', async () => {
      render(<DeviceLogin />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
      });
    });
  });

  describe('System Availability Check', () => {
    it('shows login form when backend is available', async () => {
      mockSystemPingGet.mockResolvedValue({});

      render(<DeviceLogin />);

      await waitFor(() => {
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
        expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
      });

      expect(mockSystemPingGet).toHaveBeenCalledTimes(2);
    });
  });

  describe('OAuth Authentication', () => {
    it('uses OAuth4WebApiAuth provider for authentication', async () => {
      // Mock the signIn function to track calls
      const mockSignIn = vi.fn().mockResolvedValue(undefined);
      mockOAuth4WebApiAuth.mockSignIn(mockSignIn);

      render(<DeviceLogin />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
      });

      const loginButton = screen.getByRole('button', { name: /login/i });
      fireEvent.click(loginButton);

      expect(mockSignIn).toHaveBeenCalled();
    });

    it('handles OAuth authentication errors gracefully', async () => {
      // Mock OAuth error state
      mockScenarios.error('OAuth authentication failed');

      render(<DeviceLogin />);

      // Should still show login form even with OAuth error
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
      });
    });

    it('works with different OAuth states', async () => {
      // Test with loading state
      mockScenarios.loading();

      render(<DeviceLogin />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
      });

      // Change to authenticated state
      mockScenarios.authenticatedUser();

      // Component should still render (DeviceLogin is accessible regardless of auth state)
      expect(screen.getByText('Welcome')).toBeInTheDocument();
    });
  });

  describe('Login Functionality', () => {
    it('calls OAuth signIn when login button is clicked and no error', async () => {
      const mockSignIn = vi.fn().mockResolvedValue(undefined);
      mockOAuth4WebApiAuth.mockSignIn(mockSignIn);
      mockSystemPingGet.mockResolvedValue({});

      render(<DeviceLogin />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
      });

      const loginButton = screen.getByRole('button', { name: /login/i });
      fireEvent.click(loginButton);

      expect(mockSignIn).toHaveBeenCalled();
    });

    it('does not show login button when there is a backend error', async () => {
      mockSystemPingGet.mockRejectedValue(new Error('Backend unavailable'));

      render(<DeviceLogin />);

      await waitFor(() => {
        expect(
          screen.getByText('Backend is not available. Please try again later.'),
        ).toBeInTheDocument();
      });

      // Login button should not be visible when there's an error
      expect(screen.queryByRole('button', { name: /login/i })).not.toBeInTheDocument();
    });

    it('handles OAuth signIn errors', async () => {
      const mockSignIn = vi.fn().mockRejectedValue(new Error('OAuth sign in failed'));
      mockOAuth4WebApiAuth.mockSignIn(mockSignIn);

      render(<DeviceLogin />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
      });

      const loginButton = screen.getByRole('button', { name: /login/i });
      fireEvent.click(loginButton);

      expect(mockSignIn).toHaveBeenCalled();
      // Component should handle OAuth errors gracefully
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
        expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
      });
    });
  });

  describe('Component Integration', () => {
    it('renders WhiteLabelLogo component', async () => {
      // Make ping promise never resolve to avoid state updates
      mockSystemPingGet.mockImplementation(() => new Promise(() => {}));

      render(<DeviceLogin />);

      expect(screen.getByTestId('white-label-logo')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper form structure and buttons', async () => {
      render(<DeviceLogin />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
      });

      const loginButton = screen.getByRole('button', { name: /login/i });
      expect(loginButton).toBeInTheDocument();
      expect(loginButton).toBeEnabled();
    });

    it('has proper heading structure', async () => {
      // Make ping promise never resolve to avoid state updates
      mockSystemPingGet.mockImplementation(() => new Promise(() => {}));

      render(<DeviceLogin />);

      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toHaveTextContent('Welcome');
    });

    it('provides appropriate button labels', async () => {
      render(<DeviceLogin />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
      });

      // Check retry button when there's an error
      mockSystemPingGet.mockRejectedValue(new Error('Backend unavailable'));

      const { rerender } = render(<DeviceLogin />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
      });
    });
  });

  describe('Edge Cases', () => {
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

  // New OAuth-specific tests demonstrating the mock system
  describe('OAuth Mock Integration', () => {
    it('works with unauthenticated user state', async () => {
      mockScenarios.unauthenticatedUser();

      render(<DeviceLogin />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
      });

      // Should show login interface for unauthenticated users
      expect(screen.getByText('Please authenticate to continue')).toBeInTheDocument();
    });

    it('works with authenticated user state', async () => {
      mockScenarios.authenticatedUser();

      render(<DeviceLogin />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
      });

      // DeviceLogin page should still be accessible even when authenticated
      expect(screen.getByText('Welcome')).toBeInTheDocument();
    });

    it('handles OAuth loading state', async () => {
      mockScenarios.loading();

      render(<DeviceLogin />);

      // Should still render the component
      expect(screen.getByText('Welcome')).toBeInTheDocument();

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
      });
    });

    it('handles OAuth error state', async () => {
      mockScenarios.error('OAuth configuration error');

      render(<DeviceLogin />);

      // Should still show the login page
      expect(screen.getByText('Welcome')).toBeInTheDocument();

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
      });
    });

    it('tracks OAuth signIn function calls', async () => {
      const mockSignIn = vi.fn().mockResolvedValue(undefined);
      mockOAuth4WebApiAuth.mockSignIn(mockSignIn);

      render(<DeviceLogin />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
      });

      const loginButton = screen.getByRole('button', { name: /login/i });

      // Click multiple times to test call tracking
      fireEvent.click(loginButton);
      fireEvent.click(loginButton);

      expect(mockSignIn).toHaveBeenCalledTimes(2);
    });

    it('works with custom OAuth configuration', async () => {
      // Test with config not ready
      mockScenarios.configNotReady();

      render(<DeviceLogin />);

      // Should still render
      expect(screen.getByText('Welcome')).toBeInTheDocument();

      // Now make config ready
      mockOAuth4WebApiAuth.setConfigReady(true);
      mockOAuth4WebApiAuth.setAuthenticated(false);

      // Should still work
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
      });
    });
  });
});
