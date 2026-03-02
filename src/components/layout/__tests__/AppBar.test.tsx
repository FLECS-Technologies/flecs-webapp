/*
 * Copyright (c) 2021 FLECS Technologies GmbH
 *
 * Created on Tue Nov 30 2021
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
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { BrowserRouter as Router } from 'react-router-dom';
import AppBar from '../AppBar';
import { DarkModeState } from '../../../styles/ThemeHandler';
import { QuestContextProvider } from '@contexts/quests/QuestContext';
import { createMockApi } from '../../../__mocks__/core-client-ts';
import { mockOAuth4WebApiAuth, mockScenarios } from '../../../test/oauth-test-utils';

// Mock the API provider
const mockUseProtectedApi = vi.fn();

vi.mock('@contexts/api/ApiProvider', () => ({
  useProtectedApi: () => mockUseProtectedApi(),
}));

// Mock react-router-dom navigate
const mockedUsedNavigate = vi.fn();

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useNavigate: () => mockedUsedNavigate,
  };
});

// Mock OAuth4WebApiAuthProvider
vi.mock('@contexts/auth/OAuth4WebApiAuthProvider');

// Mock window.matchMedia for theme handler
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

describe('AppBar', () => {
  let mockApi;

  beforeEach(() => {
    vi.clearAllMocks();
    mockApi = createMockApi();
    mockUseProtectedApi.mockReturnValue(mockApi);
    // Reset OAuth mock to default authenticated state
    mockOAuth4WebApiAuth.reset();
    mockScenarios.authenticatedUser();
  });

  it('renders AppBar component', async () => {
    const { getByLabelText, getByText } = render(
      <DarkModeState>
        <Router>
          <QuestContextProvider>
            <AppBar />
          </QuestContextProvider>
        </Router>
      </DarkModeState>,
    );

    await waitFor(() => {
      expect(getByLabelText('logo')).toBeVisible();
      expect(getByText('FLECS')).toBeVisible();
    });
  });

  it('Click on login', async () => {
    const user = userEvent.setup();
    // Set unauthenticated state to show login button
    mockScenarios.unauthenticatedUser();

    const { getByLabelText } = render(
      <DarkModeState>
        <Router>
          <QuestContextProvider>
            <AppBar />
          </QuestContextProvider>
        </Router>
      </DarkModeState>,
    );

    const loginButton = getByLabelText('login-button');
    await user.click(loginButton);

    await waitFor(() => {
      expect(mockedUsedNavigate).toHaveBeenCalledWith('/device-login');
    });
  });

  it('Change theme', async () => {
    const user = userEvent.setup();

    const { getByLabelText } = render(
      <DarkModeState>
        <Router>
          <QuestContextProvider>
            <AppBar />
          </QuestContextProvider>
        </Router>
      </DarkModeState>,
    );

    const changeThemeButton = getByLabelText('change-theme-button');

    // First theme change
    await user.click(changeThemeButton);

    await waitFor(() => {
      expect(changeThemeButton).toBeVisible();
    });

    // Second theme change
    await user.click(changeThemeButton);

    await waitFor(() => {
      expect(changeThemeButton).toBeVisible();
    });
  });

  // New OAuth-related tests demonstrating the mock functionality
  it('Shows user avatar when authenticated', async () => {
    // Use authenticated user scenario
    mockScenarios.authenticatedUser();

    const { getByLabelText } = render(
      <DarkModeState>
        <Router>
          <QuestContextProvider>
            <AppBar />
          </QuestContextProvider>
        </Router>
      </DarkModeState>,
    );

    await waitFor(() => {
      expect(getByLabelText('user-menu-button')).toBeVisible();
    });
  });

  it('Shows login button when unauthenticated', async () => {
    // Use unauthenticated user scenario
    mockScenarios.unauthenticatedUser();

    const { getByLabelText } = render(
      <DarkModeState>
        <Router>
          <QuestContextProvider>
            <AppBar />
          </QuestContextProvider>
        </Router>
      </DarkModeState>,
    );

    await waitFor(() => {
      expect(getByLabelText('login-button')).toBeVisible();
    });
  });

  it('Opens user menu when clicking on avatar (authenticated user)', async () => {
    const user = userEvent.setup();
    mockScenarios.authenticatedUser();

    const { getByLabelText, getByText } = render(
      <DarkModeState>
        <Router>
          <QuestContextProvider>
            <AppBar />
          </QuestContextProvider>
        </Router>
      </DarkModeState>,
    );

    const avatarButton = getByLabelText('user-menu-button');
    await user.click(avatarButton);

    await waitFor(() => {
      expect(getByText('testuser')).toBeVisible();
      expect(getByText('Profile')).toBeVisible();
      expect(getByText('Sign out')).toBeVisible();
    });
  });

  it('Handles sign out action', async () => {
    const user = userEvent.setup();
    mockScenarios.authenticatedUser();

    // Mock the signOut function to track calls
    const mockSignOut = vi.fn().mockResolvedValue(undefined);
    mockOAuth4WebApiAuth.mockSignOut(mockSignOut);

    const { getByLabelText, getByText } = render(
      <DarkModeState>
        <Router>
          <QuestContextProvider>
            <AppBar />
          </QuestContextProvider>
        </Router>
      </DarkModeState>,
    );

    // Open user menu
    const avatarButton = getByLabelText('user-menu-button');
    await user.click(avatarButton);

    // Click sign out
    const signOutButton = getByText('Sign out');
    await user.click(signOutButton);

    await waitFor(() => {
      expect(mockSignOut).toHaveBeenCalled();
    });
  });

  it('Navigates to profile when clicking Profile menu item', async () => {
    const user = userEvent.setup();
    mockScenarios.authenticatedUser();

    const { getByLabelText, getByText } = render(
      <DarkModeState>
        <Router>
          <QuestContextProvider>
            <AppBar />
          </QuestContextProvider>
        </Router>
      </DarkModeState>,
    );

    // Open user menu
    const avatarButton = getByLabelText('user-menu-button');
    await user.click(avatarButton);

    // Click profile
    const profileButton = getByText('Profile');
    await user.click(profileButton);

    await waitFor(() => {
      expect(mockedUsedNavigate).toHaveBeenCalledWith('/profile');
    });
  });

  it('Shows different user information for admin users', async () => {
    const user = userEvent.setup();
    mockScenarios.adminUser();

    const { getByLabelText, getByText } = render(
      <DarkModeState>
        <Router>
          <QuestContextProvider>
            <AppBar />
          </QuestContextProvider>
        </Router>
      </DarkModeState>,
    );

    // Open user menu
    const avatarButton = getByLabelText('user-menu-button');
    await user.click(avatarButton);

    await waitFor(() => {
      expect(getByText('adminuser')).toBeVisible();
    });
  });

  it('Handles custom user configuration', async () => {
    const user = userEvent.setup();

    // Set up custom user
    mockOAuth4WebApiAuth.setAuthenticated(true, {
      sub: 'custom-user-123',
      preferred_username: 'customtestuser',
      email: 'custom@test.com',
      realm_access: { roles: ['user'] },
    });

    const { getByLabelText, getByText } = render(
      <DarkModeState>
        <Router>
          <QuestContextProvider>
            <AppBar />
          </QuestContextProvider>
        </Router>
      </DarkModeState>,
    );

    // Open user menu
    const avatarButton = getByLabelText('user-menu-button');
    await user.click(avatarButton);

    await waitFor(() => {
      expect(getByText('customtestuser')).toBeVisible();
    });
  });
});
