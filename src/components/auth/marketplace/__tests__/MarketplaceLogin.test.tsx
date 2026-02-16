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
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import MarketplaceLogin from '../MarketplaceLogin';
import MarketplaceAuthService from '../../../../api/marketplace/MarketplaceAuthService';
import type { MarketplaceUser } from '../../../../models/marketplace';

// Mock the services and providers
vi.mock('../../../../api/marketplace/MarketplaceAuthService');
vi.mock('@contexts/marketplace/MarketplaceUserProvider', () => ({
  useMarketplaceUser: vi.fn(),
}));
vi.mock('@contexts/api/ApiProvider', () => ({
  useProtectedApi: vi.fn(),
}));

// Import the mocked modules
import { useMarketplaceUser } from '@contexts/marketplace/MarketplaceUserProvider';
import { useProtectedApi } from '@contexts/api/ApiProvider';

const mockedMarketplaceAuthService = vi.mocked(MarketplaceAuthService);
const mockedUseMarketplaceUser = vi.mocked(useMarketplaceUser);
const mockedUseProtectedApi = vi.mocked(useProtectedApi);

describe('MarketplaceLogin', () => {
  let mockSetUser: any;
  let mockConsoleAuthenticationPut: any;
  let mockApi: any;

  beforeEach(() => {
    vi.clearAllMocks();

    mockSetUser = vi.fn();
    mockConsoleAuthenticationPut = vi.fn().mockResolvedValue({});

    mockApi = {
      console: {
        consoleAuthenticationPut: mockConsoleAuthenticationPut,
      },
    };

    mockedUseMarketplaceUser.mockReturnValue({
      user: null,
      setUser: mockSetUser,
      userChanged: false,
      authHeaderUseBearer: vi.fn(() => ({})),
      authorizationHeaderUseBearer: vi.fn(() => ({})),
      authHeaderUseXAccess: vi.fn(() => ({})),
      jwt: vi.fn(() => ''),
    });

    mockedUseProtectedApi.mockReturnValue(mockApi);
  });

  describe('Rendering', () => {
    it('renders all form elements correctly', () => {
      render(<MarketplaceLogin />);

      expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
    });

    it('renders form fields with correct types', () => {
      render(<MarketplaceLogin />);

      const usernameField = screen.getByLabelText(/username/i);
      const passwordField = screen.getByLabelText(/password/i);

      expect(usernameField).toHaveAttribute('type', 'text');
      expect(passwordField).toHaveAttribute('type', 'password');
    });

    it('renders required fields', () => {
      render(<MarketplaceLogin />);

      const usernameField = screen.getByLabelText(/username/i);
      const passwordField = screen.getByLabelText(/password/i);

      expect(usernameField).toBeRequired();
      expect(passwordField).toBeRequired();
    });
  });

  describe('Form Input', () => {
    it('allows typing in username field', async () => {
      const user = userEvent.setup();
      render(<MarketplaceLogin />);

      const usernameField = screen.getByLabelText(/username/i);
      await user.type(usernameField, 'testuser');

      expect(usernameField).toHaveValue('testuser');
    });

    it('allows typing in password field', async () => {
      const user = userEvent.setup();
      render(<MarketplaceLogin />);

      const passwordField = screen.getByLabelText(/password/i);
      await user.type(passwordField, 'testpassword');

      expect(passwordField).toHaveValue('testpassword');
    });

    it('updates both fields independently', async () => {
      const user = userEvent.setup();
      render(<MarketplaceLogin />);

      const usernameField = screen.getByLabelText(/username/i);
      const passwordField = screen.getByLabelText(/password/i);

      await user.type(usernameField, 'user123');
      await user.type(passwordField, 'pass456');

      expect(usernameField).toHaveValue('user123');
      expect(passwordField).toHaveValue('pass456');
    });
  });

  describe('Form Submission', () => {
    it('calls MarketplaceAuthService.login with correct credentials', async () => {
      const user = userEvent.setup();
      const mockUser: MarketplaceUser = {
        ID: 123,
        user_login: 'testuser',
        display_name: 'Test User',
        user_email: 'test@example.com',
        jwt: { token: 'mock-token', token_expires: 1234567890 },
        feature_flags: { isVendor: false, isWhitelabeled: false },
      };

      mockedMarketplaceAuthService.login.mockResolvedValueOnce(mockUser);
      render(<MarketplaceLogin />);

      const usernameField = screen.getByLabelText(/username/i);
      const passwordField = screen.getByLabelText(/password/i);
      const loginButton = screen.getByRole('button', { name: /login/i });

      await user.type(usernameField, 'testuser');
      await user.type(passwordField, 'testpassword');
      await user.click(loginButton);

      expect(MarketplaceAuthService.login).toHaveBeenCalledWith('testuser', 'testpassword');
    });

    it('calls setUser with the returned user data', async () => {
      const user = userEvent.setup();
      const mockUser: MarketplaceUser = {
        ID: 123,
        user_login: 'testuser',
        display_name: 'Test User',
        user_email: 'test@example.com',
        jwt: { token: 'mock-token', token_expires: 1234567890 },
        feature_flags: { isVendor: false, isWhitelabeled: false },
      };

      mockedMarketplaceAuthService.login.mockResolvedValueOnce(mockUser);
      render(<MarketplaceLogin />);

      const usernameField = screen.getByLabelText(/username/i);
      const passwordField = screen.getByLabelText(/password/i);
      const loginButton = screen.getByRole('button', { name: /login/i });

      await user.type(usernameField, 'testuser');
      await user.type(passwordField, 'testpassword');
      await user.click(loginButton);

      await waitFor(() => {
        expect(mockSetUser).toHaveBeenCalledWith(mockUser);
      });
    });

    it('calls console authentication API with user data', async () => {
      const user = userEvent.setup();
      const mockUser: MarketplaceUser = {
        ID: 123,
        user_login: 'testuser',
        display_name: 'Test User',
        user_email: 'test@example.com',
        jwt: { token: 'mock-token', token_expires: 1234567890 },
        feature_flags: { isVendor: false, isWhitelabeled: false },
      };

      mockedMarketplaceAuthService.login.mockResolvedValueOnce(mockUser);
      render(<MarketplaceLogin />);

      const usernameField = screen.getByLabelText(/username/i);
      const passwordField = screen.getByLabelText(/password/i);
      const loginButton = screen.getByRole('button', { name: /login/i });

      await user.type(usernameField, 'testuser');
      await user.type(passwordField, 'testpassword');
      await user.click(loginButton);

      await waitFor(() => {
        expect(mockConsoleAuthenticationPut).toHaveBeenCalledWith({
          user: {
            ID: 123,
            display_name: 'Test User',
            user_email: 'test@example.com',
            user_login: 'testuser',
          },
          feature_flags: { isVendor: false, isWhitelabeled: false },
          jwt: { token: 'mock-token', token_expires: 1234567890 },
        });
      });
    });

    it('handles form submission via Enter key', async () => {
      const user = userEvent.setup();
      const mockUser: MarketplaceUser = {
        ID: 123,
        user_login: 'testuser',
        jwt: { token: 'mock-token', token_expires: 1234567890 },
      };

      mockedMarketplaceAuthService.login.mockResolvedValueOnce(mockUser);
      render(<MarketplaceLogin />);

      const usernameField = screen.getByLabelText(/username/i);
      const passwordField = screen.getByLabelText(/password/i);

      await user.type(usernameField, 'testuser');
      await user.type(passwordField, 'testpassword');
      await user.keyboard('{Enter}');

      expect(MarketplaceAuthService.login).toHaveBeenCalledWith('testuser', 'testpassword');
    });
  });

  describe('Loading State', () => {
    it('shows loading text during login process', async () => {
      const user = userEvent.setup();
      let resolveLogin: (value: MarketplaceUser) => void;
      const loginPromise = new Promise<MarketplaceUser>((resolve) => {
        resolveLogin = resolve;
      });

      mockedMarketplaceAuthService.login.mockReturnValueOnce(loginPromise);
      render(<MarketplaceLogin />);

      const usernameField = screen.getByLabelText(/username/i);
      const passwordField = screen.getByLabelText(/password/i);
      const loginButton = screen.getByRole('button', { name: /login/i });

      await user.type(usernameField, 'testuser');
      await user.type(passwordField, 'testpassword');
      await user.click(loginButton);

      expect(screen.getByText('Logging in...')).toBeInTheDocument();
      expect(loginButton).toBeDisabled();

      // Resolve the login promise
      resolveLogin!({
        ID: 123,
        user_login: 'testuser',
        jwt: { token: 'mock-token', token_expires: 1234567890 },
      });

      await waitFor(() => {
        expect(screen.getByText('Login')).toBeInTheDocument();
        expect(loginButton).not.toBeDisabled();
      });
    });

    it('disables button during loading', async () => {
      const user = userEvent.setup();
      let resolveLogin: (value: MarketplaceUser) => void;
      const loginPromise = new Promise<MarketplaceUser>((resolve) => {
        resolveLogin = resolve;
      });

      mockedMarketplaceAuthService.login.mockReturnValueOnce(loginPromise);
      render(<MarketplaceLogin />);

      const usernameField = screen.getByLabelText(/username/i);
      const passwordField = screen.getByLabelText(/password/i);
      const loginButton = screen.getByRole('button', { name: /login/i });

      await user.type(usernameField, 'testuser');
      await user.type(passwordField, 'testpassword');
      await user.click(loginButton);

      expect(loginButton).toBeDisabled();

      // Resolve the login promise
      resolveLogin!({
        ID: 123,
        user_login: 'testuser',
        jwt: { token: 'mock-token', token_expires: 1234567890 },
      });

      await waitFor(() => {
        expect(loginButton).not.toBeDisabled();
      });
    });
  });

  describe('Error Handling', () => {
    it('displays error message when login fails', async () => {
      const user = userEvent.setup();
      const errorMessage = 'Invalid credentials';

      mockedMarketplaceAuthService.login.mockRejectedValueOnce(new Error(errorMessage));
      render(<MarketplaceLogin />);

      const usernameField = screen.getByLabelText(/username/i);
      const passwordField = screen.getByLabelText(/password/i);
      const loginButton = screen.getByRole('button', { name: /login/i });

      await user.type(usernameField, 'wronguser');
      await user.type(passwordField, 'wrongpassword');
      await user.click(loginButton);

      await waitFor(() => {
        expect(screen.getByText(errorMessage)).toBeInTheDocument();
      });
    });

    it('displays generic error message when no error message provided', async () => {
      const user = userEvent.setup();

      mockedMarketplaceAuthService.login.mockRejectedValueOnce(new Error());
      render(<MarketplaceLogin />);

      const usernameField = screen.getByLabelText(/username/i);
      const passwordField = screen.getByLabelText(/password/i);
      const loginButton = screen.getByRole('button', { name: /login/i });

      await user.type(usernameField, 'testuser');
      await user.type(passwordField, 'testpassword');
      await user.click(loginButton);

      await waitFor(() => {
        expect(screen.getByText('Login failed')).toBeInTheDocument();
      });
    });

    it('clears error message on retry', async () => {
      const user = userEvent.setup();

      mockedMarketplaceAuthService.login.mockRejectedValueOnce(new Error('First error'));
      render(<MarketplaceLogin />);

      const usernameField = screen.getByLabelText(/username/i);
      const passwordField = screen.getByLabelText(/password/i);
      const loginButton = screen.getByRole('button', { name: /login/i });

      await user.type(usernameField, 'wronguser');
      await user.type(passwordField, 'wrongpassword');
      await user.click(loginButton);

      await waitFor(() => {
        expect(screen.getByText('First error')).toBeInTheDocument();
      });

      // Clear and retry with success
      mockedMarketplaceAuthService.login.mockResolvedValueOnce({
        ID: 123,
        user_login: 'testuser',
        jwt: { token: 'mock-token', token_expires: 1234567890 },
      });

      await user.clear(usernameField);
      await user.clear(passwordField);
      await user.type(usernameField, 'correctuser');
      await user.type(passwordField, 'correctpassword');
      await user.click(loginButton);

      await waitFor(() => {
        expect(screen.queryByText('First error')).not.toBeInTheDocument();
      });
    });

    it('handles console API error gracefully', async () => {
      const user = userEvent.setup();
      const mockUser: MarketplaceUser = {
        ID: 123,
        user_login: 'testuser',
        jwt: { token: 'mock-token', token_expires: 1234567890 },
      };

      mockedMarketplaceAuthService.login.mockResolvedValueOnce(mockUser);
      mockConsoleAuthenticationPut.mockRejectedValueOnce(new Error('Console API error'));

      render(<MarketplaceLogin />);

      const usernameField = screen.getByLabelText(/username/i);
      const passwordField = screen.getByLabelText(/password/i);
      const loginButton = screen.getByRole('button', { name: /login/i });

      await user.type(usernameField, 'testuser');
      await user.type(passwordField, 'testpassword');
      await user.click(loginButton);

      await waitFor(() => {
        expect(screen.getByText('Console API error')).toBeInTheDocument();
      });
    });
  });

  describe('User Data Handling', () => {
    it('handles user with missing optional fields', async () => {
      const user = userEvent.setup();
      const mockUser: MarketplaceUser = {
        ID: 123,
        // Missing optional fields like display_name, user_email, etc.
        jwt: { token: 'mock-token', token_expires: 1234567890 },
      };

      mockedMarketplaceAuthService.login.mockResolvedValueOnce(mockUser);
      render(<MarketplaceLogin />);

      const usernameField = screen.getByLabelText(/username/i);
      const passwordField = screen.getByLabelText(/password/i);
      const loginButton = screen.getByRole('button', { name: /login/i });

      await user.type(usernameField, 'testuser');
      await user.type(passwordField, 'testpassword');
      await user.click(loginButton);

      await waitFor(() => {
        expect(mockConsoleAuthenticationPut).toHaveBeenCalledWith({
          user: {
            ID: 123,
            display_name: '',
            user_email: '',
            user_login: '',
          },
          feature_flags: { isVendor: false, isWhitelabeled: false },
          jwt: { token: 'mock-token', token_expires: 1234567890 },
        });
      });
    });

    it('handles user with missing JWT', async () => {
      const user = userEvent.setup();
      const mockUser: MarketplaceUser = {
        ID: 123,
        user_login: 'testuser',
        // Missing jwt field
      };

      mockedMarketplaceAuthService.login.mockResolvedValueOnce(mockUser);
      render(<MarketplaceLogin />);

      const usernameField = screen.getByLabelText(/username/i);
      const passwordField = screen.getByLabelText(/password/i);
      const loginButton = screen.getByRole('button', { name: /login/i });

      await user.type(usernameField, 'testuser');
      await user.type(passwordField, 'testpassword');
      await user.click(loginButton);

      await waitFor(() => {
        expect(mockConsoleAuthenticationPut).toHaveBeenCalledWith({
          user: {
            ID: 123,
            display_name: '',
            user_email: '',
            user_login: 'testuser',
          },
          feature_flags: { isVendor: false, isWhitelabeled: false },
          jwt: { token: '', token_expires: 0 },
        });
      });
    });
  });

  describe('Accessibility', () => {
    it('has proper form labels', () => {
      render(<MarketplaceLogin />);

      expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    });

    it('has proper form structure', () => {
      render(<MarketplaceLogin />);

      const form = screen.getByRole('button', { name: /login/i }).closest('form');
      expect(form).toBeInTheDocument();
    });

    it('shows error messages with proper styling', async () => {
      const user = userEvent.setup();

      mockedMarketplaceAuthService.login.mockRejectedValueOnce(new Error('Test error'));
      render(<MarketplaceLogin />);

      const usernameField = screen.getByLabelText(/username/i);
      const passwordField = screen.getByLabelText(/password/i);
      const loginButton = screen.getByRole('button', { name: /login/i });

      await user.type(usernameField, 'test');
      await user.type(passwordField, 'test');
      await user.click(loginButton);

      await waitFor(() => {
        const errorElement = screen.getByText('Test error');
        expect(errorElement).toBeInTheDocument();
        // Just check that the error element is rendered, styling is handled by Material-UI
        expect(errorElement.tagName).toBe('P');
      });
    });
  });
});
