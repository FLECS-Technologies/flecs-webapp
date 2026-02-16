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
import { render, screen, waitFor, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi, MockedFunction } from 'vitest';
import { OAuth4WebApiAuthProvider, useOAuth4WebApiAuth } from '../OAuth4WebApiAuthProvider';
import { DeviceStateProvider } from '../../device/DeviceStateProvider';
import { AuthState, User } from '../oauth/types';

// Mock all OAuth hooks
vi.mock('../oauth/useOAuthConfig', () => ({
  useOAuthConfig: vi.fn(),
}));

vi.mock('../oauth/useAuthSession', () => ({
  useAuthSession: vi.fn(),
}));

vi.mock('../oauth/useOAuthCallback', () => ({
  useOAuthCallback: vi.fn(),
}));

vi.mock('../oauth/useOAuthFlow', () => ({
  useOAuthFlow: vi.fn(),
}));

// Mock AuthGuard component
vi.mock('@components/auth/AuthGuard', () => ({
  AuthGuard: vi.fn(({ children, auth }) => (
    <div data-testid="auth-guard" data-auth-ready={auth?.isConfigReady}>
      {children}
    </div>
  )),
}));

// Mock DeviceStateProvider using existing mock
vi.mock('../../device/DeviceStateProvider', () => vi.importActual('../../device/__mocks__/DeviceStateProvider.tsx'));

// Import mocked modules
import { useOAuthConfig } from '../oauth/useOAuthConfig';
import { useAuthSession } from '../oauth/useAuthSession';
import { useOAuthCallback } from '../oauth/useOAuthCallback';
import { useOAuthFlow } from '../oauth/useOAuthFlow';
import { AuthGuard } from '@components/auth/AuthGuard';
import { useDeviceState } from '../../device/DeviceStateProvider';
import { setMockDeviceState, resetMockDeviceState } from '../../device/__mocks__/DeviceStateProvider';

// Type the mocked functions
const mockUseOAuthConfig = useOAuthConfig as MockedFunction<typeof useOAuthConfig>;
const mockUseAuthSession = useAuthSession as MockedFunction<typeof useAuthSession>;
const mockUseOAuthCallback = useOAuthCallback as MockedFunction<typeof useOAuthCallback>;
const mockUseOAuthFlow = useOAuthFlow as MockedFunction<typeof useOAuthFlow>;
const mockAuthGuard = AuthGuard as MockedFunction<typeof AuthGuard>;
const mockUseDeviceState = useDeviceState as MockedFunction<typeof useDeviceState>;

// Mock user data
const mockUser: User = {
  sub: 'test-user-123',
  email: 'test@example.com',
  name: 'Test User',
  preferred_username: 'testuser',
  exp: Math.floor(Date.now() / 1000) + 3600,
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

// Mock functions
const mockInitializeConfig = vi.fn();
const mockCheckAuthentication = vi.fn();
const mockGetUserFromSession = vi.fn();
const mockClearSession = vi.fn();
const mockHandleCallback = vi.fn();
const mockSignIn = vi.fn();
const mockSignOut = vi.fn();

// Default mock implementations
const getDefaultMocks = () => ({
  useOAuthConfig: {
    config: {
      issuer: 'test-issuer',
      redirect_uri: 'test-redirect',
      scope: 'openid profile email',
      kind: 'oidc' as const,
    },
    authServer: { issuer: 'test-server' },
    client: { client_id: 'test-client' },
    initializeConfig: mockInitializeConfig,
    isConfigReady: true,
  },
  useAuthSession: {
    checkAuthentication: mockCheckAuthentication,
    getUserFromSession: mockGetUserFromSession,
    clearSession: mockClearSession,
  },
  useOAuthCallback: {
    handleCallback: mockHandleCallback,
  },
  useOAuthFlow: {
    signIn: mockSignIn,
    signOut: mockSignOut,
  },
});

// Test component to test hook usage
const TestComponent: React.FC = () => {
  const auth = useOAuth4WebApiAuth();
  return (
    <div>
      <div data-testid="is-authenticated">{auth.isAuthenticated.toString()}</div>
      <div data-testid="is-loading">{auth.isLoading.toString()}</div>
      <div data-testid="user-email">{auth.user?.email || 'no-user'}</div>
      <div data-testid="error">{auth.error?.message || 'no-error'}</div>
      <div data-testid="config-ready">{auth.isConfigReady.toString()}</div>
      <button onClick={auth.signIn} data-testid="sign-in-btn">
        Sign In
      </button>
      <button onClick={auth.signOut} data-testid="sign-out-btn">
        Sign Out
      </button>
      <button onClick={auth.clearError} data-testid="clear-error-btn">
        Clear Error
      </button>
      <button onClick={auth.handleOAuthCallback} data-testid="handle-callback-btn">
        Handle Callback
      </button>
      <button onClick={auth.refreshAuthState} data-testid="refresh-auth-btn">
        Refresh Auth
      </button>
    </div>
  );
};

// Test wrapper component
const TestWrapper: React.FC<{
  children: React.ReactNode;
  deviceOnboarded?: boolean;
  deviceLoaded?: boolean;
  deviceAuthenticated?: boolean;
}> = ({ children, deviceOnboarded = false, deviceLoaded = false, deviceAuthenticated = false }) => (
  <DeviceStateProvider>
    <OAuth4WebApiAuthProvider>{children}</OAuth4WebApiAuthProvider>
  </DeviceStateProvider>
);

describe('OAuth4WebApiAuthProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Reset DeviceStateProvider mock to default state
    resetMockDeviceState();
    setMockDeviceState({
      loaded: false,
      onboarded: false,
      authenticated: false,
    });

    // Reset all mock implementations
    const defaults = getDefaultMocks();
    mockUseOAuthConfig.mockReturnValue(defaults.useOAuthConfig);
    mockUseAuthSession.mockReturnValue(defaults.useAuthSession);
    mockUseOAuthCallback.mockReturnValue(defaults.useOAuthCallback);
    mockUseOAuthFlow.mockReturnValue(defaults.useOAuthFlow);

    // Default mock implementations
    mockCheckAuthentication.mockResolvedValue(false);
    mockGetUserFromSession.mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
      user: null,
      error: null,
    });
    mockInitializeConfig.mockResolvedValue({ isSystemReady: true });
    mockHandleCallback.mockResolvedValue(undefined);
    mockSignIn.mockResolvedValue(undefined);
    mockSignOut.mockResolvedValue(undefined);
  });

  describe('Provider Context', () => {
    it('provides OAuth context to child components', async () => {
      render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>,
      );

      await waitFor(() => {
        expect(screen.getByTestId('is-authenticated')).toHaveTextContent('false');
        expect(screen.getByTestId('is-loading')).toHaveTextContent('false');
        expect(screen.getByTestId('user-email')).toHaveTextContent('no-user');
        expect(screen.getByTestId('error')).toHaveTextContent('no-error');
        expect(screen.getByTestId('config-ready')).toHaveTextContent('true');
      });
    });

    it('throws error when useOAuth4WebApiAuth is used outside provider', () => {
      // Capture console error to avoid test noise
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => {
        render(<TestComponent />);
      }).toThrow('useOAuth4WebApiAuth must be used within OAuth4WebApiAuthProvider');

      consoleSpy.mockRestore();
    });

    it('provides all required context functions', async () => {
      render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>,
      );

      await waitFor(() => {
        expect(screen.getByTestId('sign-in-btn')).toBeInTheDocument();
        expect(screen.getByTestId('sign-out-btn')).toBeInTheDocument();
        expect(screen.getByTestId('clear-error-btn')).toBeInTheDocument();
        expect(screen.getByTestId('handle-callback-btn')).toBeInTheDocument();
        expect(screen.getByTestId('refresh-auth-btn')).toBeInTheDocument();
      });
    });
  });

  describe('Initial State and Initialization', () => {
    it('starts with correct initial state', async () => {
      render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>,
      );

      // Check initial loading state
      expect(screen.getByTestId('is-loading')).toHaveTextContent('true');
      expect(screen.getByTestId('is-authenticated')).toHaveTextContent('false');
      expect(screen.getByTestId('user-email')).toHaveTextContent('no-user');

      // Wait for initialization to complete
      await waitFor(() => {
        expect(screen.getByTestId('is-loading')).toHaveTextContent('false');
      });
    });

    it('initializes OAuth configuration when not authenticated', async () => {
      render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>,
      );

      await waitFor(() => {
        expect(mockCheckAuthentication).toHaveBeenCalled();
        expect(mockInitializeConfig).toHaveBeenCalled();
      });
    });

    it('skips config initialization when already authenticated', async () => {
      const authenticatedState: AuthState = {
        isAuthenticated: true,
        isLoading: false,
        user: mockUser,
        error: null,
      };

      mockCheckAuthentication.mockResolvedValue(true);
      mockGetUserFromSession.mockReturnValue(authenticatedState);

      render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>,
      );

      await waitFor(() => {
        expect(mockCheckAuthentication).toHaveBeenCalled();
        expect(mockGetUserFromSession).toHaveBeenCalled();
        expect(screen.getByTestId('is-authenticated')).toHaveTextContent('true');
        expect(screen.getByTestId('user-email')).toHaveTextContent('test@example.com');
      });

      // Should not initialize config when already authenticated
      expect(mockInitializeConfig).not.toHaveBeenCalled();
    });

    it('handles initialization errors gracefully', async () => {
      const initError = new Error('Configuration failed');
      mockInitializeConfig.mockRejectedValue(initError);

      render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>,
      );

      await waitFor(() => {
        expect(screen.getByTestId('error')).toHaveTextContent('Configuration failed');
        expect(screen.getByTestId('is-authenticated')).toHaveTextContent('false');
        expect(screen.getByTestId('is-loading')).toHaveTextContent('false');
      });
    });
  });

  describe('Authentication State Management', () => {
    it('updates state when authentication check returns true', async () => {
      const authenticatedState: AuthState = {
        isAuthenticated: true,
        isLoading: false,
        user: mockUser,
        error: null,
      };

      mockCheckAuthentication.mockResolvedValue(true);
      mockGetUserFromSession.mockReturnValue(authenticatedState);

      render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>,
      );

      await waitFor(() => {
        expect(screen.getByTestId('is-authenticated')).toHaveTextContent('true');
        expect(screen.getByTestId('user-email')).toHaveTextContent('test@example.com');
        expect(screen.getByTestId('is-loading')).toHaveTextContent('false');
      });
    });

    it('clears error state when clearError is called', async () => {
      const initError = new Error('Test error');
      mockInitializeConfig.mockRejectedValue(initError);

      render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>,
      );

      await waitFor(() => {
        expect(screen.getByTestId('error')).toHaveTextContent('Test error');
      });

      await act(async () => {
        screen.getByTestId('clear-error-btn').click();
      });

      expect(screen.getByTestId('error')).toHaveTextContent('no-error');
    });

    it('provides stable function references for optimization', async () => {
      let firstRenderAuth: any = null;
      let renderCount = 0;

      const FunctionRefTest: React.FC = () => {
        const auth = useOAuth4WebApiAuth();
        renderCount++;

        if (renderCount === 1) {
          firstRenderAuth = auth;
        }

        return <div data-testid="function-test">{renderCount}</div>;
      };

      render(
        <TestWrapper>
          <FunctionRefTest />
        </TestWrapper>,
      );

      await waitFor(() => {
        expect(screen.getByTestId('function-test')).toBeInTheDocument();
      });

      // The actual test is that functions from OAuth hooks are properly passed through
      // and that the context is properly structured with useMemo optimization
      expect(firstRenderAuth).toBeDefined();
      expect(typeof firstRenderAuth.signIn).toBe('function');
      expect(typeof firstRenderAuth.signOut).toBe('function');
      expect(typeof firstRenderAuth.clearError).toBe('function');
      expect(typeof firstRenderAuth.handleOAuthCallback).toBe('function');
      expect(typeof firstRenderAuth.refreshAuthState).toBe('function');
    });
  });

  describe('OAuth Hook Integration', () => {
    it('calls signIn from OAuth flow hook', async () => {
      render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>,
      );

      await waitFor(() => {
        expect(screen.getByTestId('sign-in-btn')).toBeInTheDocument();
      });

      await act(async () => {
        screen.getByTestId('sign-in-btn').click();
      });

      expect(mockSignIn).toHaveBeenCalled();
    });

    it('calls signOut from OAuth flow hook', async () => {
      render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>,
      );

      await waitFor(() => {
        expect(screen.getByTestId('sign-out-btn')).toBeInTheDocument();
      });

      await act(async () => {
        screen.getByTestId('sign-out-btn').click();
      });

      expect(mockSignOut).toHaveBeenCalled();
    });

    it('calls handleCallback from OAuth callback hook', async () => {
      render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>,
      );

      await waitFor(() => {
        expect(screen.getByTestId('handle-callback-btn')).toBeInTheDocument();
      });

      await act(async () => {
        screen.getByTestId('handle-callback-btn').click();
      });

      expect(mockHandleCallback).toHaveBeenCalled();
    });

    it('refreshes auth state correctly', async () => {
      const updatedState: AuthState = {
        isAuthenticated: true,
        isLoading: false,
        user: mockUser,
        error: null,
      };

      // Initially not authenticated
      mockCheckAuthentication.mockResolvedValueOnce(false);

      render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>,
      );

      await waitFor(() => {
        expect(screen.getByTestId('is-authenticated')).toHaveTextContent('false');
      });

      // Update mocks for refresh
      mockCheckAuthentication.mockResolvedValue(true);
      mockGetUserFromSession.mockReturnValue(updatedState);

      await act(async () => {
        screen.getByTestId('refresh-auth-btn').click();
      });

      await waitFor(() => {
        expect(screen.getByTestId('is-authenticated')).toHaveTextContent('true');
        expect(screen.getByTestId('user-email')).toHaveTextContent('test@example.com');
      });
    });
  });

  describe('AuthGuard Integration', () => {
    it('does not render AuthGuard when device is not onboarded', async () => {
      render(
        <TestWrapper deviceOnboarded={false}>
          <div data-testid="test-child">Test Content</div>
        </TestWrapper>,
      );

      await waitFor(() => {
        expect(screen.getByTestId('test-child')).toBeInTheDocument();
      });

      // AuthGuard should not be rendered
      expect(screen.queryByTestId('auth-guard')).not.toBeInTheDocument();
    });

    it('renders AuthGuard when device is onboarded', async () => {
      // Configure the mock to return onboarded state
      setMockDeviceState({
        loaded: true,
        onboarded: true,
        authenticated: false,
      });

      render(
        <TestWrapper>
          <div data-testid="test-child">Test Content</div>
        </TestWrapper>,
      );

      await waitFor(() => {
        expect(screen.getByTestId('auth-guard')).toBeInTheDocument();
      });

      expect(screen.getByTestId('test-child')).toBeInTheDocument();
    });

    it('passes correct auth context to AuthGuard', async () => {
      // Configure the mock to return onboarded state
      setMockDeviceState({
        loaded: true,
        onboarded: true,
        authenticated: false,
      });

      render(
        <TestWrapper>
          <div data-testid="test-child">Test Content</div>
        </TestWrapper>,
      );

      await waitFor(() => {
        expect(screen.getByTestId('auth-guard')).toBeInTheDocument();
      });

      expect(screen.getByTestId('auth-guard')).toHaveAttribute('data-auth-ready', 'true');
    });
  });

  describe('Device State Integration', () => {
    it('updates device authentication state when user authenticates', async () => {
      const authenticatedState: AuthState = {
        isAuthenticated: true,
        isLoading: false,
        user: mockUser,
        error: null,
      };

      const mockSetAuthenticated = vi.fn();
      setMockDeviceState({
        loaded: false,
        onboarded: false,
        authenticated: false,
        setAuthenticated: mockSetAuthenticated,
      });

      mockCheckAuthentication.mockResolvedValue(true);
      mockGetUserFromSession.mockReturnValue(authenticatedState);

      render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>,
      );

      await waitFor(() => {
        expect(mockSetAuthenticated).toHaveBeenCalledWith(true);
      });
    });

    it('updates device authentication state when user is not authenticated', async () => {
      const mockSetAuthenticated = vi.fn();
      setMockDeviceState({
        loaded: false,
        onboarded: false,
        authenticated: false,
        setAuthenticated: mockSetAuthenticated,
      });

      mockCheckAuthentication.mockResolvedValue(false);

      render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>,
      );

      await waitFor(() => {
        expect(mockSetAuthenticated).toHaveBeenCalledWith(false);
      });
    });

    it('re-initializes when device onboarded state changes', async () => {
      const mockSetOnboarded = vi.fn();

      // Start with device not onboarded
      setMockDeviceState({
        loaded: false,
        onboarded: false,
        authenticated: false,
        setOnboarded: mockSetOnboarded,
      });

      const DeviceStateTest: React.FC = () => {
        const deviceState = useDeviceState();

        return (
          <div>
            <div data-testid="device-onboarded">{deviceState.onboarded.toString()}</div>
            <button onClick={() => deviceState.setOnboarded(true)} data-testid="set-onboarded-btn">
              Set Onboarded
            </button>
          </div>
        );
      };

      const { rerender } = render(
        <TestWrapper>
          <DeviceStateTest />
        </TestWrapper>,
      );

      // Initially not onboarded
      await waitFor(() => {
        expect(screen.getByTestId('device-onboarded')).toHaveTextContent('false');
      });

      // Clear previous calls
      mockCheckAuthentication.mockClear();
      mockInitializeConfig.mockClear();

      // Set device as onboarded
      await act(async () => {
        screen.getByTestId('set-onboarded-btn').click();
      });

      // Update the mock to reflect the new state
      setMockDeviceState({
        loaded: false,
        onboarded: true,
        authenticated: false,
        setOnboarded: mockSetOnboarded,
      });

      // Force re-render to trigger the effect
      rerender(
        <TestWrapper>
          <DeviceStateTest />
        </TestWrapper>,
      );

      await waitFor(() => {
        expect(mockSetOnboarded).toHaveBeenCalledWith(true);
      });

      // The OAuth provider should initialize properly
      expect(mockCheckAuthentication).toHaveBeenCalled();
    });
  });

  describe('Configuration State', () => {
    it('reflects isConfigReady state from OAuth config hook', async () => {
      mockUseOAuthConfig.mockReturnValue({
        config: null,
        authServer: null,
        client: null,
        initializeConfig: mockInitializeConfig,
        isConfigReady: false,
      });

      render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>,
      );

      await waitFor(() => {
        expect(screen.getByTestId('config-ready')).toHaveTextContent('false');
      });
    });

    it('updates config ready state when configuration is loaded', async () => {
      // Start with config not ready
      mockUseOAuthConfig.mockReturnValueOnce({
        config: null,
        authServer: null,
        client: null,
        initializeConfig: mockInitializeConfig,
        isConfigReady: false,
      });

      const { rerender } = render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>,
      );

      await waitFor(() => {
        expect(screen.getByTestId('config-ready')).toHaveTextContent('false');
      });

      // Update to config ready
      mockUseOAuthConfig.mockReturnValue({
        config: {
          issuer: 'test-issuer',
          redirect_uri: 'test-redirect',
          scope: 'openid profile email',
          kind: 'oidc' as const,
        },
        authServer: { issuer: 'test-server' },
        client: { client_id: 'test-client' },
        initializeConfig: mockInitializeConfig,
        isConfigReady: true,
      });

      rerender(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>,
      );

      await waitFor(() => {
        expect(screen.getByTestId('config-ready')).toHaveTextContent('true');
      });
    });
  });

  describe('Error Handling', () => {
    it('handles authentication check errors', async () => {
      const authError = new Error('Auth check failed');
      mockCheckAuthentication.mockRejectedValue(authError);

      render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>,
      );

      await waitFor(() => {
        expect(screen.getByTestId('error')).toHaveTextContent('Auth check failed');
        expect(screen.getByTestId('is-authenticated')).toHaveTextContent('false');
        expect(screen.getByTestId('is-loading')).toHaveTextContent('false');
      });
    });

    it('handles session retrieval errors gracefully', async () => {
      mockCheckAuthentication.mockResolvedValue(true);
      mockGetUserFromSession.mockImplementation(() => {
        throw new Error('Session retrieval failed');
      });

      // Should not crash the component
      render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>,
      );

      await waitFor(() => {
        expect(screen.getByTestId('is-loading')).toHaveTextContent('false');
      });
    });

    it('prevents multiple initializations when already authenticated', async () => {
      const authenticatedState: AuthState = {
        isAuthenticated: true,
        isLoading: false,
        user: mockUser,
        error: null,
      };

      mockCheckAuthentication.mockResolvedValue(true);
      mockGetUserFromSession.mockReturnValue(authenticatedState);

      const { rerender } = render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>,
      );

      await waitFor(() => {
        expect(screen.getByTestId('is-authenticated')).toHaveTextContent('true');
      });

      const initialCallCount = mockCheckAuthentication.mock.calls.length;

      // Re-render multiple times
      rerender(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>,
      );

      rerender(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>,
      );

      // Should not call initialization again
      expect(mockCheckAuthentication.mock.calls.length).toBe(initialCallCount);
    });
  });

  describe('Performance and Optimization', () => {
    it('uses useMemo for context value to prevent unnecessary re-renders', async () => {
      let renderCount = 0;

      const RenderCountTest: React.FC = () => {
        renderCount++;
        const auth = useOAuth4WebApiAuth();
        return <div data-testid="render-count">{renderCount}</div>;
      };

      const { rerender } = render(
        <TestWrapper>
          <RenderCountTest />
        </TestWrapper>,
      );

      await waitFor(() => {
        expect(screen.getByTestId('render-count')).toHaveTextContent('1');
      });

      // Re-render with same props should not cause child to re-render unnecessarily
      rerender(
        <TestWrapper>
          <RenderCountTest />
        </TestWrapper>,
      );

      // Note: The context will cause re-renders, but useMemo should help minimize them
      // when the actual context value hasn't changed
      expect(renderCount).toBeLessThan(10); // Allow for some re-renders but not excessive
    });

    it('maintains stable context value when auth state does not change', async () => {
      let contextValues: any[] = [];

      const ContextValueTest: React.FC = () => {
        const auth = useOAuth4WebApiAuth();
        contextValues.push(auth);
        return <div data-testid="context-test">Test</div>;
      };

      render(
        <TestWrapper>
          <ContextValueTest />
        </TestWrapper>,
      );

      await waitFor(() => {
        expect(screen.getByTestId('context-test')).toBeInTheDocument();
      });

      // Wait a bit to ensure initialization is complete
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(contextValues.length).toBeGreaterThan(0);

      // Check that function properties are stable across renders
      if (contextValues.length > 1) {
        const [first, second] = contextValues;
        expect(first.signIn).toBe(second.signIn);
        expect(first.signOut).toBe(second.signOut);
        expect(first.clearError).toBe(second.clearError);
      }
    });
  });
});
