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
import React from 'react';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { BrowserRouter as Router } from 'react-router-dom';
import AppBar from '../AppBar';
import { DarkModeState } from '../../styles/ThemeHandler';
import { QuestContextProvider } from '../quests/QuestContext';
import { createMockApi } from '../../__mocks__/core-client-ts';

// Mock the API provider
const mockUseProtectedApi = vi.fn();

vi.mock('../providers/ApiProvider', () => ({
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

// Mock AuthProvider to avoid dependency issues
vi.mock('../providers/AuthProvider', () => ({
  useAuth: vi.fn(() => null),
  useAuthActions: vi.fn(() => ({
    signOut: vi.fn(),
  })),
  useAuthConfig: vi.fn(() => ({})),
}));

// Mock react-oidc-context
vi.mock('react-oidc-context', () => ({
  useAuth: vi.fn(() => ({
    user: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
  })),
  AuthProvider: ({ children }) => children,
}));

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
      expect(mockedUsedNavigate).toHaveBeenCalledWith('/splash-screen');
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
});
