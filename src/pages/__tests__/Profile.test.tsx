/*
 * Copyright (c) 2025 FLECS Technologies GmbH
 *
 * Created on Nov 11 2025
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
import Profile from '../Profile';
import { mockOAuth4WebApiAuth, mockScenarios } from '../../test/oauth-test-utils';
import { User } from '../../components/providers/oauth/types';

// Mock OAuth4WebApiAuthProvider
vi.mock('../../components/providers/OAuth4WebApiAuthProvider');

// Mock whitelabeling colors
vi.mock('../../whitelabeling/custom-tokens', () => ({
  colors: {
    secondary: '#667eea',
    background: '#764ba2',
    accent: '#f093fb',
  },
}));

// Mock console.error to avoid noise during error tests
const mockConsoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

describe('Profile', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockOAuth4WebApiAuth.reset();
    mockConsoleError.mockClear();
  });

  describe('User Information Display', () => {
    it('displays authenticated user information', () => {
      mockScenarios.authenticatedUser();

      render(<Profile />);

      // Username appears twice - once in header, once in user info section
      const usernames = screen.getAllByText('testuser');
      expect(usernames).toHaveLength(2);
      expect(screen.getByText('User Information')).toBeInTheDocument();
      // Both email and user ID are shown as "-" because of the commented out display
      const dashElements = screen.getAllByText('-');
      expect(dashElements).toHaveLength(2); // One for email, one for user ID
    });

    it('displays user initials in avatar when preferred_username is available', () => {
      mockScenarios.authenticatedUser();

      render(<Profile />);

      const avatar = screen.getByText('T'); // testuser -> T (single word, first char)
      expect(avatar).toBeInTheDocument();
    });

    it('displays default avatar icon when preferred_username is not available', () => {
      const userWithoutUsername: User = {
        sub: 'test-user-456',
        exp: Math.floor(Date.now() / 1000) + 3600,
      };
      mockOAuth4WebApiAuth.setAuthenticated(true, userWithoutUsername);

      render(<Profile />);

      expect(screen.getByText('Anonymous')).toBeInTheDocument();
      // Person icon should be rendered in avatar (first one in avatar, second in section header)
      const personIcons = screen.getAllByTestId('PersonIcon');
      expect(personIcons).toHaveLength(2);
    });

    it('handles user with single name correctly for initials', () => {
      const singleNameUser: User = {
        sub: 'single-name-user',
        preferred_username: 'admin',
        exp: Math.floor(Date.now() / 1000) + 3600,
      };
      mockOAuth4WebApiAuth.setAuthenticated(true, singleNameUser);

      render(<Profile />);

      expect(screen.getByText('A')).toBeInTheDocument(); // admin -> A (single word, first char)
    });

    it('handles user with multiple names correctly for initials', () => {
      const multiNameUser: User = {
        sub: 'multi-name-user',
        preferred_username: 'john doe smith',
        exp: Math.floor(Date.now() / 1000) + 3600,
      };
      mockOAuth4WebApiAuth.setAuthenticated(true, multiNameUser);

      render(<Profile />);

      expect(screen.getByText('JD')).toBeInTheDocument(); // john doe smith -> JD (first 2 initials)
    });
  });

  describe('Roles and Permissions', () => {
    it('displays user roles from realm_access', () => {
      mockScenarios.authenticatedUser();

      render(<Profile />);

      expect(screen.getByText('Roles & Permissions')).toBeInTheDocument();
      expect(screen.getByText('user')).toBeInTheDocument();
      expect(screen.getByText('admin')).toBeInTheDocument();
    });

    it('displays user roles from resource_access', () => {
      mockScenarios.authenticatedUser();

      render(<Profile />);

      expect(screen.getByText('manage-account')).toBeInTheDocument();
      expect(screen.getByText('view-profile')).toBeInTheDocument();
    });

    it('combines and deduplicates roles from realm and resource access', () => {
      const userWithDuplicateRoles: User = {
        sub: 'test-user-789',
        preferred_username: 'testuser',
        exp: Math.floor(Date.now() / 1000) + 3600,
        realm_access: {
          roles: ['user', 'admin'],
        },
        resource_access: {
          'test-client': {
            roles: ['user', 'manage-data'], // 'user' is duplicate
          },
          'other-client': {
            roles: ['view-reports'],
          },
        },
      };
      mockOAuth4WebApiAuth.setAuthenticated(true, userWithDuplicateRoles);

      render(<Profile />);

      const userChips = screen.getAllByText('user');
      expect(userChips).toHaveLength(1); // Should not be duplicated
      expect(screen.getByText('admin')).toBeInTheDocument();
      expect(screen.getByText('manage-data')).toBeInTheDocument();
      expect(screen.getByText('view-reports')).toBeInTheDocument();
    });

    it('does not display roles section when user has no roles', () => {
      const userWithoutRoles: User = {
        sub: 'no-roles-user',
        preferred_username: 'noroles',
        exp: Math.floor(Date.now() / 1000) + 3600,
      };
      mockOAuth4WebApiAuth.setAuthenticated(true, userWithoutRoles);

      render(<Profile />);

      expect(screen.queryByText('Roles & Permissions')).not.toBeInTheDocument();
    });

    it('handles empty roles arrays correctly', () => {
      const userWithEmptyRoles: User = {
        sub: 'empty-roles-user',
        preferred_username: 'emptyroles',
        exp: Math.floor(Date.now() / 1000) + 3600,
        realm_access: {
          roles: [],
        },
        resource_access: {
          'test-client': {
            roles: [],
          },
        },
      };
      mockOAuth4WebApiAuth.setAuthenticated(true, userWithEmptyRoles);

      render(<Profile />);

      expect(screen.queryByText('Roles & Permissions')).not.toBeInTheDocument();
    });
  });

  describe('Session Information', () => {
    it('displays token expiration time', () => {
      mockScenarios.authenticatedUser();

      render(<Profile />);

      expect(screen.getByText('Login Information')).toBeInTheDocument();
      expect(screen.getByText('Login Expires:')).toBeInTheDocument();
      // The exact formatted date will depend on locale, so we just check it's not "Unknown"
      expect(screen.queryByText('Unknown')).not.toBeInTheDocument();
    });

    it('displays "Unknown" when token expiration is not available', () => {
      const userWithoutExp: User = {
        sub: 'no-exp-user',
        preferred_username: 'noexp',
      };
      mockOAuth4WebApiAuth.setAuthenticated(true, userWithoutExp);

      render(<Profile />);

      expect(screen.getByText('Unknown')).toBeInTheDocument();
    });

    it('displays authentication status as authenticated', () => {
      mockScenarios.authenticatedUser();

      render(<Profile />);

      expect(screen.getByText('Authentication Status:')).toBeInTheDocument();
      expect(screen.getByText('Authenticated')).toBeInTheDocument();
    });

    it('displays authentication status as not authenticated', () => {
      mockScenarios.unauthenticatedUser();

      render(<Profile />);

      expect(screen.getByText('Not Authenticated')).toBeInTheDocument();
    });
  });

  describe('Sign Out Functionality', () => {
    it('displays sign out button', () => {
      mockScenarios.authenticatedUser();

      render(<Profile />);

      const signOutButton = screen.getByRole('button', { name: /sign out/i });
      expect(signOutButton).toBeInTheDocument();
      expect(signOutButton).not.toBeDisabled();
    });

    it('calls signOut when sign out button is clicked', async () => {
      const user = userEvent.setup();
      mockScenarios.authenticatedUser();

      render(<Profile />);

      const signOutButton = screen.getByRole('button', { name: /sign out/i });
      await user.click(signOutButton);

      expect(mockOAuth4WebApiAuth.getCurrentValue().signOut).toHaveBeenCalled();
    });

    it('disables button and shows loading state during sign out', async () => {
      const user = userEvent.setup();
      mockScenarios.authenticatedUser();

      // Mock signOut to take some time
      mockOAuth4WebApiAuth.mockSignOut(() => new Promise((resolve) => setTimeout(resolve, 100)));

      render(<Profile />);

      const signOutButton = screen.getByRole('button', { name: /sign out/i });

      // Click the button
      await user.click(signOutButton);

      // Button should be disabled and show loading text
      expect(signOutButton).toBeDisabled();
      expect(screen.getByText('Signing Out...')).toBeInTheDocument();

      // Wait for sign out to complete
      await waitFor(
        () => {
          expect(signOutButton).not.toBeDisabled();
        },
        { timeout: 200 },
      );
    });

    it('handles sign out errors gracefully', async () => {
      const user = userEvent.setup();
      mockScenarios.authenticatedUser();

      // Mock signOut to throw an error
      const signOutError = new Error('Sign out failed');
      mockOAuth4WebApiAuth.mockSignOut(() => Promise.reject(signOutError));

      render(<Profile />);

      const signOutButton = screen.getByRole('button', { name: /sign out/i });
      await user.click(signOutButton);

      // Wait for error to be handled
      await waitFor(() => {
        expect(mockConsoleError).toHaveBeenCalledWith('Sign out error:', signOutError);
      });

      // Button should be re-enabled after error
      expect(signOutButton).not.toBeDisabled();
      expect(screen.getByText('Sign Out')).toBeInTheDocument();
    });

    it('resets loading state after successful sign out', async () => {
      const user = userEvent.setup();
      mockScenarios.authenticatedUser();

      render(<Profile />);

      const signOutButton = screen.getByRole('button', { name: /sign out/i });
      await user.click(signOutButton);

      await waitFor(() => {
        expect(mockOAuth4WebApiAuth.getCurrentValue().signOut).toHaveBeenCalled();
      });

      // Button should be back to normal state
      expect(signOutButton).not.toBeDisabled();
      expect(screen.getByText('Sign Out')).toBeInTheDocument();
    });
  });

  describe('Admin User Scenarios', () => {
    it('displays admin user with enhanced roles', () => {
      mockScenarios.adminUser();

      render(<Profile />);

      // Username appears twice - once in header, once in user info section
      const usernames = screen.getAllByText('adminuser');
      expect(usernames).toHaveLength(2);
      expect(screen.getByText('super-admin')).toBeInTheDocument();
      expect(screen.getByText('manage-users')).toBeInTheDocument();
      expect(screen.getByText('manage-system')).toBeInTheDocument();
      expect(screen.getByText('view-all')).toBeInTheDocument();
    });
  });

  describe('Limited User Scenarios', () => {
    it('displays limited user with minimal roles', () => {
      mockScenarios.limitedUser();

      render(<Profile />);

      // Username appears twice - once in header, once in user info section
      const usernames = screen.getAllByText('limiteduser');
      expect(usernames).toHaveLength(2);
      expect(screen.getByText('user')).toBeInTheDocument();
      // Should not have resource access roles
      expect(screen.queryByText('manage-account')).not.toBeInTheDocument();
    });
  });

  describe('Token Expiration Scenarios', () => {
    it('displays expired token information', () => {
      mockScenarios.expiredToken();

      render(<Profile />);

      expect(screen.getByText('Login Expires:')).toBeInTheDocument();
      // Should show a past date - we can't test the exact format due to locale differences
      // but we can verify it's not "Unknown"
      expect(screen.queryByText('Unknown')).not.toBeInTheDocument();
    });
  });

  describe('Accessibility and UI', () => {
    it('has proper heading structure', () => {
      mockScenarios.authenticatedUser();

      render(<Profile />);

      const mainHeading = screen.getByRole('heading', { level: 1 });
      expect(mainHeading).toHaveTextContent('testuser');

      const sectionHeadings = screen.getAllByRole('heading', { level: 6 });
      // There's an empty subtitle heading plus the 3 section headings
      expect(sectionHeadings).toHaveLength(4); // Empty subtitle, User Information, Roles & Permissions, Login Information
    });

    it('uses proper semantic elements', () => {
      mockScenarios.authenticatedUser();

      render(<Profile />);

      // The Profile component doesn't have a main element, but has proper structure
      // Check for button
      expect(screen.getByRole('button', { name: /sign out/i })).toBeInTheDocument();

      // Check for proper heading structure
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    });

    it('displays role chips with proper styling', () => {
      mockScenarios.authenticatedUser();

      render(<Profile />);

      // Get role chips specifically (excluding other instances of these words)
      const userRoleChip = screen.getByText('user').closest('.MuiChip-root');
      const adminRoleChip = screen.getByText('admin').closest('.MuiChip-root');

      expect(userRoleChip).toBeInTheDocument();
      expect(adminRoleChip).toBeInTheDocument();

      // Check for resource access roles
      expect(screen.getByText('manage-account').closest('.MuiChip-root')).toBeInTheDocument();
      expect(screen.getByText('view-profile').closest('.MuiChip-root')).toBeInTheDocument();
    });
  });

  describe('Loading and Error States', () => {
    it('renders correctly when authentication is loading', () => {
      mockScenarios.loading();

      render(<Profile />);

      // Should render the component but with loading states
      expect(screen.getByText('Anonymous')).toBeInTheDocument();
      expect(screen.getByText('Not Authenticated')).toBeInTheDocument();
    });

    it('renders correctly when there is an authentication error', () => {
      mockScenarios.error('Authentication failed');

      render(<Profile />);

      expect(screen.getByText('Anonymous')).toBeInTheDocument();
      expect(screen.getByText('Not Authenticated')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles null user gracefully', () => {
      mockOAuth4WebApiAuth.setAuthenticated(false);

      render(<Profile />);

      expect(screen.getByText('Anonymous')).toBeInTheDocument();
      expect(screen.getByText('Not available')).toBeInTheDocument(); // Username
      expect(screen.getByText('Unknown')).toBeInTheDocument(); // Token expiration
    });

    it('handles user with only sub field', () => {
      const minimalUser: User = {
        sub: 'minimal-user-123',
      };
      mockOAuth4WebApiAuth.setAuthenticated(true, minimalUser);

      render(<Profile />);

      expect(screen.getByText('Anonymous')).toBeInTheDocument(); // No preferred_username
      // User ID is shown as "-" because of the commented out display
      expect(screen.getByText('-')).toBeInTheDocument();
      expect(screen.getByText('Unknown')).toBeInTheDocument(); // No expiration
    });

    it('handles very long usernames in initials', () => {
      const longNameUser: User = {
        sub: 'long-name-user',
        preferred_username: 'this is a very long username with many words',
        exp: Math.floor(Date.now() / 1000) + 3600,
      };
      mockOAuth4WebApiAuth.setAuthenticated(true, longNameUser);

      render(<Profile />);

      // Should only show first 2 initials
      expect(screen.getByText('TI')).toBeInTheDocument();
    });

    it('handles username with special characters', () => {
      const specialCharUser: User = {
        sub: 'special-char-user',
        preferred_username: 'user@domain.com',
        exp: Math.floor(Date.now() / 1000) + 3600,
      };
      mockOAuth4WebApiAuth.setAuthenticated(true, specialCharUser);

      render(<Profile />);

      // Username appears twice - once in header, once in user info section
      const usernames = screen.getAllByText('user@domain.com');
      expect(usernames).toHaveLength(2);
      expect(screen.getByText('U')).toBeInTheDocument(); // user@domain.com -> U (single word, first char)
    });
  });
});
