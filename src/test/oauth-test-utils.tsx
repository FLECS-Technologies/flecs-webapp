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

/**
 * OAuth4WebApi Test Utilities
 *
 * This file provides utility functions and examples for testing components
 * that use OAuth4WebApiAuthProvider.
 */

import React from 'react';
import { render, RenderOptions } from '@testing-library/react';
import {
  OAuth4WebApiAuthProvider,
  mockOAuth4WebApiAuth,
  mockScenarios,
} from '@contexts/auth/__mocks__/OAuth4WebApiAuthProvider';

/**
 * Custom render function that wraps components with OAuth4WebApiAuthProvider
 * This is useful for testing components that need the OAuth context
 */
export const renderWithOAuthProvider = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) => {
  const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <OAuth4WebApiAuthProvider>{children}</OAuth4WebApiAuthProvider>
  );

  return render(ui, { wrapper: Wrapper, ...options });
};

/**
 * Test helper to configure OAuth state before rendering
 */
export const renderWithOAuthState = (
  ui: React.ReactElement,
  scenario: keyof typeof mockScenarios | 'custom',
  customConfig?: () => void,
  options?: Omit<RenderOptions, 'wrapper'>,
) => {
  // Apply the scenario or custom configuration
  if (scenario === 'custom' && customConfig) {
    customConfig();
  } else if (scenario in mockScenarios) {
    mockScenarios[scenario as keyof typeof mockScenarios]();
  }

  return renderWithOAuthProvider(ui, options);
};

/**
 * Example test scenarios and how to use them
 */
export const testExamples = {
  /**
   * Example 1: Testing with authenticated user
   */
  authenticatedUserTest: () => `
    import { renderWithOAuthState, mockOAuth4WebApiAuth } from '../test/oauth-test-utils';
    import YourComponent from '../YourComponent';

    test('renders correctly for authenticated user', () => {
      const { getByText } = renderWithOAuthState(
        <YourComponent />,
        'authenticatedUser'
      );
      
      expect(getByText('Welcome, testuser!')).toBeInTheDocument();
    });
  `,

  /**
   * Example 2: Testing with unauthenticated user
   */
  unauthenticatedUserTest: () => `
    test('shows login prompt for unauthenticated user', () => {
      const { getByText } = renderWithOAuthState(
        <YourComponent />,
        'unauthenticatedUser'
      );
      
      expect(getByText('Please log in')).toBeInTheDocument();
    });
  `,

  /**
   * Example 3: Testing loading state
   */
  loadingStateTest: () => `
    test('shows loading spinner during authentication', () => {
      const { getByTestId } = renderWithOAuthState(
        <YourComponent />,
        'loading'
      );
      
      expect(getByTestId('loading-spinner')).toBeInTheDocument();
    });
  `,

  /**
   * Example 4: Testing error state
   */
  errorStateTest: () => `
    test('displays error message when authentication fails', () => {
      const { getByText } = renderWithOAuthState(
        <YourComponent />,
        'error'
      );
      
      expect(getByText('Authentication error')).toBeInTheDocument();
    });
  `,

  /**
   * Example 5: Testing sign out functionality
   */
  signOutTest: () => `
    test('calls signOut when logout button is clicked', async () => {
      const { getByText } = renderWithOAuthState(
        <YourComponent />,
        'authenticatedUser'
      );
      
      const signOutButton = getByText('Sign Out');
      fireEvent.click(signOutButton);
      
      expect(mockOAuth4WebApiAuth.getCurrentValue().signOut).toHaveBeenCalled();
    });
  `,

  /**
   * Example 6: Testing with custom configuration
   */
  customConfigTest: () => `
    test('handles custom user configuration', () => {
      const customUser = {
        sub: 'custom-123',
        preferred_username: 'customuser',
        email: 'custom@example.com',
      };

      const { getByText } = renderWithOAuthState(
        <YourComponent />,
        'custom',
        () => mockOAuth4WebApiAuth.setAuthenticated(true, customUser)
      );
      
      expect(getByText('Welcome, customuser!')).toBeInTheDocument();
    });
  `,

  /**
   * Example 7: Testing role-based functionality
   */
  roleBasedTest: () => `
    test('shows admin features for admin users', () => {
      const { getByText } = renderWithOAuthState(
        <YourComponent />,
        'adminUser'
      );
      
      expect(getByText('Admin Panel')).toBeInTheDocument();
    });

    test('hides admin features for regular users', () => {
      const { queryByText } = renderWithOAuthState(
        <YourComponent />,
        'limitedUser'
      );
      
      expect(queryByText('Admin Panel')).not.toBeInTheDocument();
    });
  `,

  /**
   * Example 8: Testing async operations
   */
  asyncOperationTest: () => `
    test('handles sign in process', async () => {
      mockOAuth4WebApiAuth.mockSignIn(async () => {
        // Simulate sign in process
        mockOAuth4WebApiAuth.setLoading(true);
        await new Promise(resolve => setTimeout(resolve, 100));
        mockOAuth4WebApiAuth.setAuthenticated(true);
      });

      const { getByText } = renderWithOAuthState(
        <YourComponent />,
        'unauthenticatedUser'
      );
      
      const signInButton = getByText('Sign In');
      fireEvent.click(signInButton);
      
      await waitFor(() => {
        expect(mockOAuth4WebApiAuth.getCurrentValue().signIn).toHaveBeenCalled();
      });
    });
  `,
};

/**
 * Common test setup for OAuth-related tests
 */
export const setupOAuthTests = () => {
  beforeEach(() => {
    mockOAuth4WebApiAuth.reset();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
};

// Export all utilities
export {
  mockOAuth4WebApiAuth,
  mockScenarios,
} from '@contexts/auth/__mocks__/OAuth4WebApiAuthProvider';
