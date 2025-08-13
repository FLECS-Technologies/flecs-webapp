/*
 * Copyright (c) 2022 FLECS Technologies GmbH
 *
 * Created on Tue Aug 05 2025
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
import * as React from 'react';
import { AuthProvider as OidcAuthProvider, useAuth } from 'react-oidc-context';
import { CircularProgress, Box, Typography } from '@mui/material';
import SplashScreen from '../../pages/SplashScreen';
import { WebStorageStateStore } from 'oidc-client-ts';
import { usePublicApi } from './ApiProvider';

interface OidcConfig {
  authority: string;
  client_id: string;
  redirect_uri: string;
  response_type: string;
  scope: string;
  automaticSilentRenew: boolean;
  userStore: WebStorageStateStore;
  accessTokenExpiringNotificationTimeInSeconds: number;
  post_logout_redirect_uri: string;
  silentRequestTimeoutInSeconds: number;
  checkSessionIntervalInSeconds: number;
  staleStateAgeInSeconds: number;
}

interface AuthConfigContextValue {
  oidcConfig: OidcConfig;
  updateAuthority: (authority: string) => void;
  updateClientId: (clientId: string) => void;
  updateConfig: (config: Partial<OidcConfig>) => void;
  isConfigLoading: boolean;
}

interface AuthActionsContextValue {
  signOut: () => Promise<void>;
  switchUser: () => void;
}

const AuthConfigContext = React.createContext<AuthConfigContextValue | undefined>(undefined);
const AuthActionsContext = React.createContext<AuthActionsContextValue | undefined>(undefined);

export const useAuthConfig = () => {
  const context = React.useContext(AuthConfigContext);
  if (!context) {
    throw new Error('useAuthConfig must be used within AuthProvider');
  }
  return context;
};

export const useAuthActions = () => {
  const context = React.useContext(AuthActionsContext);
  if (!context) {
    throw new Error('useAuthActions must be used within AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

function AuthGuard({ children }: { children: React.ReactNode }) {
  const auth = useAuth();
  const { oidcConfig } = useAuthConfig();

  const signOut = React.useCallback(async () => {
    try {
      await auth.signoutRedirect({
        extraQueryParams: {
          post_logout_redirect_uri: oidcConfig.post_logout_redirect_uri,
        },
      });
    } catch (error) {
      console.error('Sign out error:', error);
      // Fallback: clear local storage and reload
      localStorage.clear();
      window.location.href = '/';
    }
  }, [auth, oidcConfig.post_logout_redirect_uri]);

  const switchUser = React.useCallback(() => {
    auth.signoutRedirect({
      extraQueryParams: {
        post_logout_redirect_uri: oidcConfig.post_logout_redirect_uri,
        prompt: 'login',
      },
    });
  }, [auth, oidcConfig.post_logout_redirect_uri]);

  const authActions = React.useMemo(
    () => ({
      signOut,
      switchUser,
    }),
    [signOut, switchUser],
  );

  // Handle authentication errors
  if (auth.error) {
    // Clear any stale authentication state for errors
    auth.removeUser();
  }

  if (auth.isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!auth.isAuthenticated) {
    return <SplashScreen />;
  }

  return <AuthActionsContext.Provider value={authActions}>{children}</AuthActionsContext.Provider>;
}

function AuthProvider({ children }: AuthProviderProps) {
  const api = usePublicApi();
  const [isConfigLoading, setIsConfigLoading] = React.useState(true);

  const [oidcConfig, setOidcConfig] = React.useState<OidcConfig>({
    authority: 'http://localhost:8080/realms/master', // Default fallback
    client_id: 'flecs',
    redirect_uri: window.location.origin,
    response_type: 'code',
    scope: 'openid profile email',
    automaticSilentRenew: true,
    userStore: new WebStorageStateStore({ store: window.localStorage }),
    accessTokenExpiringNotificationTimeInSeconds: 30,
    post_logout_redirect_uri: window.location.origin,
    silentRequestTimeoutInSeconds: 300, // Allow enough time for renewal
    checkSessionIntervalInSeconds: 10, // default is 2 seconds which seems to be very agressive
    staleStateAgeInSeconds: 300, // Clean up stale state after 5 minutes
  });

  const [providerKey, setProviderKey] = React.useState(0);

  // Initialize OIDC config from API
  React.useEffect(() => {
    const initializeConfig = async () => {
      try {
        setIsConfigLoading(true);

        // Check if the default auth provider protocol is OIDC
        const protocolResponse = await api.authentication.authProvidersDefaultProtocolGet();

        if (protocolResponse.data === 'oidc') {
          // Get the default auth provider location
          const locationResponse = await api.authentication.authProvidersDefaultLocationGet();

          if (locationResponse.data && locationResponse.data !== oidcConfig.authority) {
            setOidcConfig((prev) => ({
              ...prev,
              authority: locationResponse.data,
            }));
            // Only increment provider key if authority actually changed
            setProviderKey((prev) => prev + 1);
          }
        }
      } catch (error) {
        console.error('Failed to initialize OIDC config from API:', error);
        // Keep using default config on error
      } finally {
        setIsConfigLoading(false);
      }
    };

    initializeConfig();
  }, [api]);

  const updateAuthority = React.useCallback((authority: string) => {
    setOidcConfig((prev) => ({
      ...prev,
      authority,
    }));
    setProviderKey((prev) => prev + 1);
  }, []);

  const updateClientId = React.useCallback((clientId: string) => {
    setOidcConfig((prev) => ({
      ...prev,
      client_id: clientId,
    }));
    setProviderKey((prev) => prev + 1);
  }, []);

  const updateConfig = React.useCallback((configUpdate: Partial<OidcConfig>) => {
    setOidcConfig((prev) => ({
      ...prev,
      ...configUpdate,
    }));
    setProviderKey((prev) => prev + 1);
  }, []);

  const authConfigValue = React.useMemo(
    () => ({
      oidcConfig,
      updateAuthority,
      updateClientId,
      updateConfig,
      isConfigLoading,
    }),
    [oidcConfig, updateAuthority, updateClientId, updateConfig, isConfigLoading],
  );

  // Show loading while config is being fetched
  if (isConfigLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <Typography>Loading auth config...</Typography>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <AuthConfigContext.Provider value={authConfigValue}>
      <OidcAuthProvider key={providerKey} {...oidcConfig}>
        <AuthGuard>{children}</AuthGuard>
      </OidcAuthProvider>
    </AuthConfigContext.Provider>
  );
}

export { AuthProvider };
