/*
 * Copyright (c) 2025 FLECS Technologies GmbH
 *
 * Created on Nov 07 2025
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

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useDeviceState } from './DeviceStateProvider';
import { AuthState, AuthContextValue } from './oauth/types';
import { useOAuthConfig } from './oauth/useOAuthConfig';
import { useOAuthCallback } from './oauth/useOAuthCallback';
import { useOAuthFlow } from './oauth/useOAuthFlow';
import { useAuthSession } from './oauth/useAuthSession';
import { AuthGuard } from '../auth/AuthGuard';

const OAuth4WebApiAuthContext = createContext<AuthContextValue | undefined>(undefined);

export const useOAuth4WebApiAuth = () => {
  const context = useContext(OAuth4WebApiAuthContext);
  if (!context) {
    throw new Error('useOAuth4WebApiAuth must be used within OAuth4WebApiAuthProvider');
  }
  return context;
};

interface OAuth4WebApiAuthProviderProps {
  children: React.ReactNode;
}

export const OAuth4WebApiAuthProvider: React.FC<OAuth4WebApiAuthProviderProps> = ({ children }) => {
  const deviceState = useDeviceState();

  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    isLoading: true,
    user: null,
    error: null,
  });

  const [shouldRenderAuthGuard, setShouldRenderAuthGuard] = useState(false);
  const [initialized, setInitialized] = useState(false);

  // Initialize OAuth configuration
  const { config, authServer, client, initializeConfig, isConfigReady } = useOAuthConfig();

  // Session management
  const { checkAuthentication, getUserFromSession } = useAuthSession();

  // OAuth callback handling
  const { handleCallback } = useOAuthCallback(authServer, client, config, initializeConfig);

  // OAuth flow management
  const { signIn, signOut } = useOAuthFlow(authServer, client, config);

  const clearError = useCallback(() => {
    setAuthState((prev) => ({ ...prev, error: null }));
  }, []);

  const refreshAuthState = useCallback(async () => {
    const isAuth = await checkAuthentication();
    if (isAuth) {
      const sessionState = getUserFromSession();
      setAuthState(sessionState);
      deviceState.setAuthenticated(sessionState.isAuthenticated);
    } else {
      setAuthState((prev) => ({
        ...prev,
        isAuthenticated: false,
        user: null,
      }));
      deviceState.setAuthenticated(false);
    }
  }, [deviceState]);

  // Initialize only once on mount or when deviceState.onboarded changes
  useEffect(() => {
    if (initialized && authState.isAuthenticated) return; // Prevent multiple initializations

    const initialize = async () => {
      try {
        // Check if already authenticated
        const isAuth = await checkAuthentication();
        if (isAuth) {
          // Update auth state from session
          const sessionState = getUserFromSession();
          setAuthState(sessionState);
          // Update device state synchronously after auth check
          deviceState.setAuthenticated(sessionState.isAuthenticated);
        } else {
          // Initialize OAuth config
          const result = await initializeConfig();
          if (result?.isSystemReady) {
            setAuthState((prev) => ({ ...prev, isLoading: false }));
            deviceState.setAuthenticated(false);
          }
        }
      } catch (error) {
        setAuthState({
          isAuthenticated: false,
          isLoading: false,
          user: null,
          error: error as Error,
        });
        deviceState.setAuthenticated(false);
      } finally {
        setInitialized(true);
      }
    };

    initialize();
  }, [deviceState.onboarded]);

  // Monitor deviceState.onboarded to determine when to render AuthGuard
  useEffect(() => {
    setShouldRenderAuthGuard(deviceState.onboarded);
  }, [deviceState.onboarded]);

  // Periodically refresh auth state every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (authState.isAuthenticated) refreshAuthState();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [refreshAuthState]);

  const contextValue: AuthContextValue = useMemo(
    () => ({
      ...authState,
      signIn,
      signOut,
      clearError,
      handleOAuthCallback: handleCallback,
      refreshAuthState,
      isConfigReady,
    }),
    [authState, signIn, signOut, clearError, handleCallback, refreshAuthState, isConfigReady],
  );

  return (
    <OAuth4WebApiAuthContext.Provider value={contextValue}>
      {shouldRenderAuthGuard ? <AuthGuard auth={contextValue}>{children}</AuthGuard> : children}
    </OAuth4WebApiAuthContext.Provider>
  );
};
