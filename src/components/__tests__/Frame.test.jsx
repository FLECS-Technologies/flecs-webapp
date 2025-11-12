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
import { describe, test, expect, beforeEach, vi } from 'vitest';
import { BrowserRouter as Router } from 'react-router-dom';
import Frame from '../Frame';
import { DarkModeState } from '../../styles/ThemeHandler';
import { QuestContextProvider } from '../quests/QuestContext';
import { createMockApi } from '../../__mocks__/core-client-ts';
import { mockOAuth4WebApiAuth, mockScenarios } from '../../test/oauth-test-utils';

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

// Mock OAuth4WebApiAuthProvider
vi.mock('../providers/OAuth4WebApiAuthProvider');

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

describe('Frame', () => {
  let mockApi;

  beforeEach(() => {
    vi.clearAllMocks();
    mockApi = createMockApi();
    mockUseProtectedApi.mockReturnValue(mockApi);

    // Reset OAuth mock to default authenticated state
    mockOAuth4WebApiAuth.reset();
    mockScenarios.authenticatedUser();
  });

  test('renders Frame component', async () => {
    const { getByLabelText } = render(
      <Router>
        <DarkModeState>
          <QuestContextProvider>
            <Frame />
          </QuestContextProvider>
        </DarkModeState>
      </Router>,
    );

    await waitFor(() => {
      const headerPlaceholder = getByLabelText('Header-Placeholder');
      expect(headerPlaceholder).toBeVisible();
    });
  });

  test('renders Frame component with children', async () => {
    const TestChild = () => <div data-testid="test-child">Test Content</div>;

    const { getByTestId, getByLabelText } = render(
      <Router>
        <DarkModeState>
          <QuestContextProvider>
            <Frame>
              <TestChild />
            </Frame>
          </QuestContextProvider>
        </DarkModeState>
      </Router>,
    );

    await waitFor(() => {
      expect(getByLabelText('Header-Placeholder')).toBeVisible();
      expect(getByTestId('test-child')).toBeVisible();
      expect(getByTestId('test-child')).toHaveTextContent('Test Content');
    });
  });

  // OAuth-specific tests demonstrating the mock functionality
  describe('OAuth Integration', () => {
    test('renders with authenticated user', async () => {
      mockScenarios.authenticatedUser();

      const { getByLabelText, getByLabelText: getByAriaLabel } = render(
        <Router>
          <DarkModeState>
            <QuestContextProvider>
              <Frame />
            </QuestContextProvider>
          </DarkModeState>
        </Router>,
      );

      await waitFor(() => {
        expect(getByLabelText('Header-Placeholder')).toBeVisible();
        // AppBar should show user menu button for authenticated users
        expect(getByAriaLabel('user-menu-button')).toBeVisible();
      });
    });

    test('renders with unauthenticated user', async () => {
      mockScenarios.unauthenticatedUser();

      const { getByLabelText, getByLabelText: getByAriaLabel } = render(
        <Router>
          <DarkModeState>
            <QuestContextProvider>
              <Frame />
            </QuestContextProvider>
          </DarkModeState>
        </Router>,
      );

      await waitFor(() => {
        expect(getByLabelText('Header-Placeholder')).toBeVisible();
        // AppBar should show login button for unauthenticated users
        expect(getByAriaLabel('login-button')).toBeVisible();
      });
    });

    test('renders with OAuth loading state', async () => {
      mockScenarios.loading();

      const { getByLabelText } = render(
        <Router>
          <DarkModeState>
            <QuestContextProvider>
              <Frame />
            </QuestContextProvider>
          </DarkModeState>
        </Router>,
      );

      await waitFor(() => {
        expect(getByLabelText('Header-Placeholder')).toBeVisible();
        // Frame should still render during OAuth loading
      });
    });

    test('renders with OAuth error state', async () => {
      mockScenarios.error('Authentication failed');

      const { getByLabelText } = render(
        <Router>
          <DarkModeState>
            <QuestContextProvider>
              <Frame />
            </QuestContextProvider>
          </DarkModeState>
        </Router>,
      );

      await waitFor(() => {
        expect(getByLabelText('Header-Placeholder')).toBeVisible();
        // Frame should still render with OAuth errors
      });
    });

    test('renders with admin user', async () => {
      mockScenarios.adminUser();

      const { getByLabelText, getByLabelText: getByAriaLabel } = render(
        <Router>
          <DarkModeState>
            <QuestContextProvider>
              <Frame />
            </QuestContextProvider>
          </DarkModeState>
        </Router>,
      );

      await waitFor(() => {
        expect(getByLabelText('Header-Placeholder')).toBeVisible();
        expect(getByAriaLabel('user-menu-button')).toBeVisible();
      });
    });

    test('handles custom user configuration', async () => {
      const customUser = {
        sub: 'frame-test-user-456',
        preferred_username: 'frameuser',
        email: 'frame@test.com',
        realm_access: { roles: ['frame-user'] },
      };

      mockOAuth4WebApiAuth.setAuthenticated(true, customUser);

      const { getByLabelText, getByLabelText: getByAriaLabel } = render(
        <Router>
          <DarkModeState>
            <QuestContextProvider>
              <Frame />
            </QuestContextProvider>
          </DarkModeState>
        </Router>,
      );

      await waitFor(() => {
        expect(getByLabelText('Header-Placeholder')).toBeVisible();
        expect(getByAriaLabel('user-menu-button')).toBeVisible();
      });
    });

    test('handles OAuth config not ready state', async () => {
      mockScenarios.configNotReady();

      const { getByLabelText } = render(
        <Router>
          <DarkModeState>
            <QuestContextProvider>
              <Frame />
            </QuestContextProvider>
          </DarkModeState>
        </Router>,
      );

      await waitFor(() => {
        expect(getByLabelText('Header-Placeholder')).toBeVisible();
        // Frame should render even when OAuth config is not ready
      });
    });
  });

  describe('OAuth State Transitions', () => {
    test('handles authentication state changes', async () => {
      // Start with unauthenticated
      mockScenarios.unauthenticatedUser();

      const { getByLabelText, rerender } = render(
        <Router>
          <DarkModeState>
            <QuestContextProvider>
              <Frame />
            </QuestContextProvider>
          </DarkModeState>
        </Router>,
      );

      await waitFor(() => {
        expect(getByLabelText('Header-Placeholder')).toBeVisible();
        expect(getByLabelText('login-button')).toBeVisible();
      });

      // Change to authenticated
      mockScenarios.authenticatedUser();

      rerender(
        <Router>
          <DarkModeState>
            <QuestContextProvider>
              <Frame />
            </QuestContextProvider>
          </DarkModeState>
        </Router>,
      );

      await waitFor(() => {
        expect(getByLabelText('Header-Placeholder')).toBeVisible();
        expect(getByLabelText('user-menu-button')).toBeVisible();
      });
    });
  });
});
