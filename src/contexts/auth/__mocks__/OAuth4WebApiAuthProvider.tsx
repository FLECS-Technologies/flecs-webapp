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
import { AuthContextValue, User } from '../oauth/types';

// Mock user data for testing
export const mockUser: User = {
  sub: 'test-user-123',
  email: 'test@example.com',
  name: 'Test User',
  preferred_username: 'testuser',
  exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour from now
  realm_access: {
    roles: ['user', 'admin'],
  },
  resource_access: {
    'test-client': {
      roles: ['manage-account', 'view-profile'],
    },
  },
  access_token: 'mock-access-token',
};

// Default mock context value
export const mockAuthContextValue: AuthContextValue = {
  isAuthenticated: true,
  isLoading: false,
  user: mockUser,
  error: null,
  signIn: jest.fn().mockResolvedValue(undefined),
  signOut: jest.fn().mockResolvedValue(undefined),
  clearError: jest.fn(),
  handleOAuthCallback: jest.fn().mockResolvedValue(undefined),
  refreshAuthState: jest.fn().mockResolvedValue(undefined),
  isConfigReady: true,
};

// Configurable mock context for different test scenarios
let mockContextValue = { ...mockAuthContextValue };

// Helper functions to configure mock state for tests
export const mockOAuth4WebApiAuth = {
  // Set authenticated state
  setAuthenticated: (isAuthenticated: boolean, user?: User | null) => {
    mockContextValue.isAuthenticated = isAuthenticated;
    mockContextValue.user = isAuthenticated ? user || mockUser : null;
    mockContextValue.isLoading = false;
    mockContextValue.error = null;
  },

  // Set loading state
  setLoading: (isLoading: boolean) => {
    mockContextValue.isLoading = isLoading;
    if (isLoading) {
      mockContextValue.isAuthenticated = false;
      mockContextValue.user = null;
      mockContextValue.error = null;
    }
  },

  // Set error state
  setError: (error: Error) => {
    mockContextValue.error = error;
    mockContextValue.isAuthenticated = false;
    mockContextValue.user = null;
    mockContextValue.isLoading = false;
  },

  // Set config ready state
  setConfigReady: (isReady: boolean) => {
    mockContextValue.isConfigReady = isReady;
  },

  // Reset to default state
  reset: () => {
    mockContextValue = { ...mockAuthContextValue };
    // Reset all mock functions
    jest.clearAllMocks();
  },

  // Get current mock context value
  getCurrentValue: () => mockContextValue,

  // Configure specific mock functions
  mockSignIn: (implementation?: () => Promise<void>) => {
    mockContextValue.signIn = jest.fn(implementation || jest.fn().mockResolvedValue(undefined));
  },

  mockSignOut: (implementation?: () => Promise<void>) => {
    mockContextValue.signOut = jest.fn(implementation || jest.fn().mockResolvedValue(undefined));
  },

  mockHandleCallback: (implementation?: () => Promise<void>) => {
    mockContextValue.handleOAuthCallback = jest.fn(
      implementation || jest.fn().mockResolvedValue(undefined),
    );
  },

  mockRefreshAuthState: (implementation?: () => Promise<void>) => {
    mockContextValue.refreshAuthState = jest.fn(
      implementation || jest.fn().mockResolvedValue(undefined),
    );
  },
};

// Mock hook
export const useOAuth4WebApiAuth = jest.fn(() => mockContextValue);

// Mock provider component that renders children without context restrictions
export const OAuth4WebApiAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <>{children}</>;
};

// Test scenarios helpers
export const mockScenarios = {
  // Authenticated user scenario
  authenticatedUser: () => {
    mockOAuth4WebApiAuth.setAuthenticated(true, mockUser);
  },

  // Unauthenticated user scenario
  unauthenticatedUser: () => {
    mockOAuth4WebApiAuth.setAuthenticated(false);
  },

  // Loading scenario
  loading: () => {
    mockOAuth4WebApiAuth.setLoading(true);
  },

  // Error scenario
  error: (errorMessage = 'Authentication error') => {
    mockOAuth4WebApiAuth.setError(new Error(errorMessage));
  },

  // Config not ready scenario
  configNotReady: () => {
    mockOAuth4WebApiAuth.setConfigReady(false);
    mockOAuth4WebApiAuth.setLoading(true);
  },

  // User with minimal permissions
  limitedUser: () => {
    const limitedUser: User = {
      sub: 'limited-user-456',
      email: 'limited@example.com',
      preferred_username: 'limiteduser',
      exp: Math.floor(Date.now() / 1000) + 3600,
      realm_access: {
        roles: ['user'],
      },
      resource_access: {},
    };
    mockOAuth4WebApiAuth.setAuthenticated(true, limitedUser);
  },

  // Admin user scenario
  adminUser: () => {
    const adminUser: User = {
      sub: 'admin-user-789',
      email: 'admin@example.com',
      preferred_username: 'adminuser',
      exp: Math.floor(Date.now() / 1000) + 3600,
      realm_access: {
        roles: ['user', 'admin', 'super-admin'],
      },
      resource_access: {
        'admin-client': {
          roles: ['manage-users', 'manage-system', 'view-all'],
        },
      },
    };
    mockOAuth4WebApiAuth.setAuthenticated(true, adminUser);
  },

  // Expired token scenario
  expiredToken: () => {
    const expiredUser: User = {
      ...mockUser,
      exp: Math.floor(Date.now() / 1000) - 3600, // 1 hour ago
    };
    mockOAuth4WebApiAuth.setAuthenticated(true, expiredUser);
  },

  // Sign out in progress
  signingOut: () => {
    mockOAuth4WebApiAuth.mockSignOut(
      () => new Promise((resolve) => setTimeout(resolve, 1000)), // Simulate delay
    );
  },
};

// Export default for easier importing
export default {
  useOAuth4WebApiAuth,
  OAuth4WebApiAuthProvider,
  mockOAuth4WebApiAuth,
  mockScenarios,
  mockUser,
  mockAuthContextValue,
};
