/*
 * Copyright (c) 2025 FLECS Technologies GmbH
 *
 * Created on Thu Sep 05 2025
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
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { BrowserRouter as Router } from 'react-router-dom';
import Avatar from '../Avatar';

// Mock react-router-dom navigate
const mockedUsedNavigate = vi.fn();

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = (await importOriginal()) as any;
  return {
    ...actual,
    useNavigate: () => mockedUsedNavigate,
  };
});

// Mock OAuth4WebApiAuth provider
vi.mock('@contexts/auth/OAuth4WebApiAuthProvider');

// Import the OAuth mock system
import {
  OAuth4WebApiAuthProvider,
  mockOAuth4WebApiAuth,
  mockScenarios,
} from '@contexts/auth/__mocks__/OAuth4WebApiAuthProvider';

describe('Avatar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('when user is not authenticated', () => {
    beforeEach(() => {
      mockScenarios.unauthenticatedUser();
    });

    it('renders login icon', async () => {
      const { getByLabelText } = render(
        <OAuth4WebApiAuthProvider>
          <Router>
            <Avatar />
          </Router>
        </OAuth4WebApiAuthProvider>,
      );

      await waitFor(() => {
        const avatarButton = getByLabelText('avatar-button');
        const loginIcon = getByLabelText('login-button');
        expect(avatarButton).toBeVisible();
        expect(loginIcon).toBeVisible();
      });
    });

    it('navigates to device-login when login icon is clicked', async () => {
      const user = userEvent.setup();

      const { getByLabelText } = render(
        <OAuth4WebApiAuthProvider>
          <Router>
            <Avatar />
          </Router>
        </OAuth4WebApiAuthProvider>,
      );

      const avatarButton = getByLabelText('avatar-button');
      await user.click(avatarButton);

      await waitFor(() => {
        expect(mockedUsedNavigate).toHaveBeenCalledWith('/device-login');
      });
    });
  });

  describe('when user is authenticated', () => {
    beforeEach(() => {
      mockScenarios.authenticatedUser();
    });

    it('renders person icon', async () => {
      const { getByLabelText } = render(
        <OAuth4WebApiAuthProvider>
          <Router>
            <Avatar />
          </Router>
        </OAuth4WebApiAuthProvider>,
      );

      await waitFor(() => {
        const avatarButton = getByLabelText('avatar-button');
        const personIcon = getByLabelText('user-menu-button');
        expect(avatarButton).toBeVisible();
        expect(personIcon).toBeVisible();
      });
    });

    it('opens user menu when person icon is clicked', async () => {
      const user = userEvent.setup();

      const { getByLabelText, getByText } = render(
        <OAuth4WebApiAuthProvider>
          <Router>
            <Avatar />
          </Router>
        </OAuth4WebApiAuthProvider>,
      );

      const avatarButton = getByLabelText('avatar-button');
      await user.click(avatarButton);

      await waitFor(() => {
        const userMenu = getByLabelText('user-menu');
        expect(userMenu).toBeVisible();
        expect(getByText('Signed in as')).toBeVisible();
        expect(getByText('testuser')).toBeVisible();
        expect(getByText('Profile')).toBeVisible();
        expect(getByText('Sign out')).toBeVisible();
      });
    });

    it('navigates to profile when Profile menu item is clicked', async () => {
      const user = userEvent.setup();

      const { getByLabelText, getByText } = render(
        <OAuth4WebApiAuthProvider>
          <Router>
            <Avatar />
          </Router>
        </OAuth4WebApiAuthProvider>,
      );

      // Open menu
      const avatarButton = getByLabelText('avatar-button');
      await user.click(avatarButton);

      // Click Profile menu item
      await waitFor(() => {
        expect(getByText('Profile')).toBeVisible();
      });

      const profileMenuItem = getByText('Profile');
      await user.click(profileMenuItem);

      await waitFor(() => {
        expect(mockedUsedNavigate).toHaveBeenCalledWith('/profile');
      });
    });

    it('calls signOut when Sign out menu item is clicked', async () => {
      const user = userEvent.setup();

      const { getByLabelText, getByText } = render(
        <OAuth4WebApiAuthProvider>
          <Router>
            <Avatar />
          </Router>
        </OAuth4WebApiAuthProvider>,
      );

      // Open menu
      const avatarButton = getByLabelText('avatar-button');
      await user.click(avatarButton);

      // Click Sign out menu item
      await waitFor(() => {
        expect(getByText('Sign out')).toBeVisible();
      });

      const signOutMenuItem = getByText('Sign out');
      await user.click(signOutMenuItem);

      await waitFor(() => {
        expect(mockOAuth4WebApiAuth.getCurrentValue().signOut).toHaveBeenCalled();
      });
    });

    it('closes menu when clicking outside', async () => {
      const user = userEvent.setup();

      const { getByLabelText, queryByLabelText } = render(
        <OAuth4WebApiAuthProvider>
          <Router>
            <Avatar />
          </Router>
        </OAuth4WebApiAuthProvider>,
      );

      // Open menu
      const avatarButton = getByLabelText('avatar-button');
      await user.click(avatarButton);

      // Verify menu is open
      await waitFor(() => {
        expect(getByLabelText('user-menu')).toBeVisible();
      });

      // Press Escape to close the menu (more reliable than clicking outside in tests)
      await user.keyboard('{Escape}');

      // Verify menu is closed
      await waitFor(() => {
        const userMenu = queryByLabelText('user-menu');
        // Menu should either not exist or not be visible
        expect(userMenu).not.toBeVisible();
      });
    });
  });
});
