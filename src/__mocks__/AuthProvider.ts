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
import { vi } from 'vitest';
import React from 'react';

// Mock user object structure
export const createMockUser = (overrides: any = {}) => ({
  profile: {
    sub: 'test-user-id',
    name: 'Test User',
    email: 'test@example.com',
    preferred_username: 'testuser',
    given_name: 'Test',
    family_name: 'User',
    ...(overrides.profile || {}),
  },
  access_token: 'mock-access-token',
  id_token: 'mock-id-token',
  token_type: 'Bearer',
  expires_at: Math.floor(Date.now() / 1000) + 3600, // 1 hour from now
  scope: 'openid profile email',
  ...overrides,
});

// Mock OIDC config structure
export const createMockOidcConfig = (overrides: any = {}) => ({
  authority: 'http://localhost:8080/auth',
  client_id: 'test-client-id',
  redirect_uri: 'http://localhost:3000/callback',
  response_type: 'code',
  scope: 'openid profile email',
  automaticSilentRenew: true,
  accessTokenExpiringNotificationTimeInSeconds: 60,
  post_logout_redirect_uri: 'http://localhost:3000',
  silentRequestTimeoutInSeconds: 10,
  checkSessionIntervalInSeconds: 2,
  staleStateAgeInSeconds: 300,
  userStore: {} as any,
  ...overrides,
});

// Create comprehensive auth context mocks
export const createMockAuthContext = (customMocks: any = {}) => {
  const defaultMocks = {
    // useAuth hook from react-oidc-context
    useAuth: vi.fn(() => ({
      user: createMockUser(),
      isAuthenticated: true,
      isLoading: false,
      error: null,
      activeNavigator: undefined,
      signinRedirect: vi.fn(() => Promise.resolve()),
      signoutRedirect: vi.fn(() => Promise.resolve()),
      signoutSilent: vi.fn(() => Promise.resolve()),
      signinSilent: vi.fn(() => Promise.resolve()),
      removeUser: vi.fn(() => Promise.resolve()),
      clearStaleState: vi.fn(() => Promise.resolve()),
      querySessionStatus: vi.fn(() => Promise.resolve(null)),
      revokeTokens: vi.fn(() => Promise.resolve()),
      startSilentRenew: vi.fn(),
      stopSilentRenew: vi.fn(),
      events: {
        addAccessTokenExpiring: vi.fn(),
        addAccessTokenExpired: vi.fn(),
        addSilentRenewError: vi.fn(),
        addUserLoaded: vi.fn(),
        addUserUnloaded: vi.fn(),
        addUserSignedOut: vi.fn(),
        addUserSessionChanged: vi.fn(),
        removeAccessTokenExpiring: vi.fn(),
        removeAccessTokenExpired: vi.fn(),
        removeSilentRenewError: vi.fn(),
        removeUserLoaded: vi.fn(),
        removeUserUnloaded: vi.fn(),
        removeUserSignedOut: vi.fn(),
        removeUserSessionChanged: vi.fn(),
      },
    })),

    // useAuthConfig hook from AuthProvider
    useAuthConfig: vi.fn(() => ({
      oidcConfig: createMockOidcConfig(),
      updateAuthority: vi.fn(),
      updateClientId: vi.fn(),
      updateConfig: vi.fn(),
      isConfigLoading: false,
    })),

    // useAuthActions hook from AuthProvider
    useAuthActions: vi.fn(() => ({
      signOut: vi.fn(() => Promise.resolve()),
      switchUser: vi.fn(),
    })),

    // AuthProvider component mock
    AuthProvider: ({ children }: { children: React.ReactNode }) =>
      React.createElement('div', { 'data-testid': 'auth-provider-mock' }, children),
  };

  // Deep merge custom mocks with defaults
  const mergeDeep = (target: any, source: any): any => {
    for (const key in source) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        target[key] = target[key] || {};
        mergeDeep(target[key], source[key]);
      } else {
        target[key] = source[key];
      }
    }
    return target;
  };

  return mergeDeep(defaultMocks, customMocks);
};

// Helper functions for common test scenarios
export const createUnauthenticatedAuthContext = () =>
  createMockAuthContext({
    useAuth: vi.fn(() => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      activeNavigator: undefined,
      signinRedirect: vi.fn(() => Promise.resolve()),
      signoutRedirect: vi.fn(() => Promise.resolve()),
      signoutSilent: vi.fn(() => Promise.resolve()),
      signinSilent: vi.fn(() => Promise.resolve()),
      removeUser: vi.fn(() => Promise.resolve()),
      clearStaleState: vi.fn(() => Promise.resolve()),
      querySessionStatus: vi.fn(() => Promise.resolve(null)),
      revokeTokens: vi.fn(() => Promise.resolve()),
      startSilentRenew: vi.fn(),
      stopSilentRenew: vi.fn(),
      events: {
        addAccessTokenExpiring: vi.fn(),
        addAccessTokenExpired: vi.fn(),
        addSilentRenewError: vi.fn(),
        addUserLoaded: vi.fn(),
        addUserUnloaded: vi.fn(),
        addUserSignedOut: vi.fn(),
        addUserSessionChanged: vi.fn(),
        removeAccessTokenExpiring: vi.fn(),
        removeAccessTokenExpired: vi.fn(),
        removeSilentRenewError: vi.fn(),
        removeUserLoaded: vi.fn(),
        removeUserUnloaded: vi.fn(),
        removeUserSignedOut: vi.fn(),
        removeUserSessionChanged: vi.fn(),
      },
    })),
  });

export const createLoadingAuthContext = () =>
  createMockAuthContext({
    useAuth: vi.fn(() => ({
      user: null,
      isAuthenticated: false,
      isLoading: true,
      error: null,
      activeNavigator: undefined,
      signinRedirect: vi.fn(() => Promise.resolve()),
      signoutRedirect: vi.fn(() => Promise.resolve()),
      signoutSilent: vi.fn(() => Promise.resolve()),
      signinSilent: vi.fn(() => Promise.resolve()),
      removeUser: vi.fn(() => Promise.resolve()),
      clearStaleState: vi.fn(() => Promise.resolve()),
      querySessionStatus: vi.fn(() => Promise.resolve(null)),
      revokeTokens: vi.fn(() => Promise.resolve()),
      startSilentRenew: vi.fn(),
      stopSilentRenew: vi.fn(),
      events: {
        addAccessTokenExpiring: vi.fn(),
        addAccessTokenExpired: vi.fn(),
        addSilentRenewError: vi.fn(),
        addUserLoaded: vi.fn(),
        addUserUnloaded: vi.fn(),
        addUserSignedOut: vi.fn(),
        addUserSessionChanged: vi.fn(),
        removeAccessTokenExpiring: vi.fn(),
        removeAccessTokenExpired: vi.fn(),
        removeSilentRenewError: vi.fn(),
        removeUserLoaded: vi.fn(),
        removeUserUnloaded: vi.fn(),
        removeUserSignedOut: vi.fn(),
        removeUserSessionChanged: vi.fn(),
      },
    })),
  });

export const createErrorAuthContext = (error = 'Authentication error') =>
  createMockAuthContext({
    useAuth: vi.fn(() => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: new Error(error),
      activeNavigator: undefined,
      signinRedirect: vi.fn(() => Promise.resolve()),
      signoutRedirect: vi.fn(() => Promise.resolve()),
      signoutSilent: vi.fn(() => Promise.resolve()),
      signinSilent: vi.fn(() => Promise.resolve()),
      removeUser: vi.fn(() => Promise.resolve()),
      clearStaleState: vi.fn(() => Promise.resolve()),
      querySessionStatus: vi.fn(() => Promise.resolve(null)),
      revokeTokens: vi.fn(() => Promise.resolve()),
      startSilentRenew: vi.fn(),
      stopSilentRenew: vi.fn(),
      events: {
        addAccessTokenExpiring: vi.fn(),
        addAccessTokenExpired: vi.fn(),
        addSilentRenewError: vi.fn(),
        addUserLoaded: vi.fn(),
        addUserUnloaded: vi.fn(),
        addUserSignedOut: vi.fn(),
        addUserSessionChanged: vi.fn(),
        removeAccessTokenExpiring: vi.fn(),
        removeAccessTokenExpired: vi.fn(),
        removeSilentRenewError: vi.fn(),
        removeUserLoaded: vi.fn(),
        removeUserUnloaded: vi.fn(),
        removeUserSignedOut: vi.fn(),
        removeUserSessionChanged: vi.fn(),
      },
    })),
  });

// Helper to reset all auth mocks
export const resetAllAuthMocks = (authMocks: any) => {
  Object.values(authMocks).forEach((mockFn) => {
    if (vi.isMockFunction(mockFn)) {
      vi.clearAllMocks();
    }
  });
};

export default createMockAuthContext;
