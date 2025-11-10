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

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import * as oauth from 'oauth4webapi';
import { CircularProgress, Box, Typography } from '@mui/material';
import DeviceLogin from '../../pages/DeviceLogin';
import { usePublicApi } from './ApiProvider';
import { useDeviceState } from './DeviceStateProvider';
import { AuthProvidersAndDefaults, AuthProvider } from '@flecs/core-client-ts';

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: any | null;
  error: Error | null;
}

interface AuthContextValue extends AuthState {
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
  handleOAuthCallback: () => Promise<void>;
  isConfigReady: boolean;
}

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

function AuthGuard({ children }: { children: React.ReactNode }) {
  const auth = useOAuth4WebApiAuth();

  // Don't guard the OAuth callback route
  // Check for both /oauth/callback and /ui/oauth/callback
  const isCallbackRoute = window.location.pathname.endsWith('/oauth/callback');

  if (isCallbackRoute) {
    return <>{children}</>;
  }

  // Handle authentication errors
  if (auth.error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <Box textAlign="center">
          <Typography color="error" variant="h6">
            Authentication Error
          </Typography>
          <Typography sx={{ mt: 1 }}>{auth.error.message}</Typography>
        </Box>
      </Box>
    );
  }

  if (auth.isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <Box textAlign="center">
          <CircularProgress />
          <Typography sx={{ mt: 2 }}>Loading authentication...</Typography>
        </Box>
      </Box>
    );
  }

  if (!auth.isAuthenticated) {
    return <DeviceLogin />;
  }

  return <>{children}</>;
}

export const OAuth4WebApiAuthProvider: React.FC<OAuth4WebApiAuthProviderProps> = ({ children }) => {
  const api = usePublicApi();
  const deviceState = useDeviceState();

  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    isLoading: true,
    user: null,
    error: null,
  });

  const [config, setConfig] = useState<any>(null);
  const [authServer, setAuthServer] = useState<oauth.AuthorizationServer | null>(null);
  const [client, setClient] = useState<oauth.Client | null>(null);
  const [shouldRenderAuthGuard, setShouldRenderAuthGuard] = useState(false);
  const initializingRef = useRef(false);
  const callbackProcessingRef = useRef(false);

  // Check if user is authenticated by looking for valid tokens
  const checkAuthentication = useCallback(async () => {
    try {
      // Check for stored access token (using sessionStorage for better security)
      const accessToken = sessionStorage.getItem('oauth4webapi_access_token');
      const user = sessionStorage.getItem('oauth4webapi_user');

      if (accessToken && user) {
        // We have tokens, assume authenticated (oauth4webapi doesn't validate by default)
        setAuthState({
          isAuthenticated: true,
          isLoading: false,
          user: JSON.parse(user),
          error: null,
        });
        // Update device state
        deviceState.setAuthenticated(true);
        return true;
      }
    } catch (error) {
      // Clear potentially corrupted data
      sessionStorage.removeItem('oauth4webapi_access_token');
      sessionStorage.removeItem('oauth4webapi_user');
    }

    setAuthState((prev) => ({ ...prev, isLoading: false }));
    // Update device state
    deviceState.setAuthenticated(false);
    return false;
  }, [deviceState]);

  // Initialize OAuth configuration
  const initializeConfig = useCallback(async () => {
    // Prevent multiple initialization calls in dev mode
    if (initializingRef.current) {
      return;
    }
    initializingRef.current = true;

    try {
      // Get auth provider configuration from /providers/auth endpoint
      const response = await api.providers.getProvidersAuth();
      const authData: AuthProvidersAndDefaults = response.data;

      // Check if auth system is ready - if core is null and no providers, system not ready
      if (!authData.core && (!authData.providers || Object.keys(authData.providers).length === 0)) {
        // Auth system not ready yet, allow access without authentication
        setAuthState({
          isAuthenticated: true,
          isLoading: false,
          user: null,
          error: null,
        });
        return;
      }

      // Get the active provider using the core ID
      const coreProviderId = authData.core as string;
      const providerConfig: AuthProvider = authData.providers[coreProviderId];

      // Get issuer URL from the provider config
      const issuerUrl = providerConfig.issuer_url;
      const issuer = new URL(issuerUrl);
      const algorithm = providerConfig.kind === 'oauth' ? 'oauth2' : 'oidc';

      // Additional properties are in the properties field
      const props = providerConfig.properties || {};

      // Construct AuthorizationServer manually from provider config endpoints
      const as: oauth.AuthorizationServer = {
        issuer: issuer.href,
        authorization_endpoint: providerConfig.authorize_url,
        token_endpoint: providerConfig.token_url,
        jwks_uri: providerConfig.jwk_url,
        // Add optional endpoints if available in properties
        ...(props.userinfo_url && { userinfo_endpoint: props.userinfo_url }),
        ...(props.end_session_url && {
          end_session_endpoint: props.end_session_url,
        }),
        // Add PKCE support
        code_challenge_methods_supported: ['S256', 'plain'],
      };

      const oauthClient: oauth.Client = {
        client_id: props.client_id || 'flecs',
      };

      // Use current page location as redirect URI to handle base paths correctly
      // Get the base path from the current pathname (e.g., /ui)
      const basePath = import.meta.env.BASE_URL || '/';
      const redirectUri =
        props.redirect_uri || `${window.location.origin}${basePath}oauth/callback`;

      setConfig({
        ...providerConfig,
        ...props,
        issuer: issuer.href,
        redirect_uri: redirectUri,
        scope: props.scope || (algorithm === 'oidc' ? 'openid email' : 'api:read'),
      });

      setAuthServer(as);
      setClient(oauthClient);
    } catch (error) {
      console.error('Failed to initialize OAuth config:', error);
      setAuthState((prev) => ({
        ...prev,
        error: error as Error,
        isLoading: false,
      }));
    } finally {
      initializingRef.current = false;
    }
  }, [api]);

  // Handle OAuth callback - stateless approach
  const handleCallback = useCallback(async () => {
    // Prevent multiple callback processing in dev mode
    if (callbackProcessingRef.current) {
      return;
    }
    callbackProcessingRef.current = true;

    try {
      // Initialize config if not already done (needed for direct callback URL access)
      if (!authServer || !client || !config) {
        await initializeConfig();
        // Config will be set, but we need to wait for the next render cycle
        // The callback will be retriggered when config is ready
        return;
      }
      const currentUrl = new URL(window.location.href);

      const codeVerifier = sessionStorage.getItem('oauth_code_verifier');
      const nonce = sessionStorage.getItem('oauth_nonce');

      if (!codeVerifier) {
        throw new Error('Missing code verifier');
      }

      const params = oauth.validateAuthResponse(authServer, client, currentUrl);

      const clientAuth = config.client_secret
        ? oauth.ClientSecretPost(config.client_secret)
        : oauth.None();

      const response = await oauth.authorizationCodeGrantRequest(
        authServer,
        client,
        clientAuth,
        params,
        config.redirect_uri,
        codeVerifier,
        {
          [oauth.allowInsecureRequests]: true,
        },
      );

      const result =
        config.kind === 'oidc'
          ? await oauth.processAuthorizationCodeResponse(authServer, client, response, {
              expectedNonce: nonce || undefined,
              requireIdToken: true,
            })
          : await oauth.processAuthorizationCodeResponse(authServer, client, response);

      // Store tokens securely in sessionStorage (better than localStorage)
      if (result.access_token) {
        sessionStorage.setItem('oauth4webapi_access_token', result.access_token);
      }

      if (result.id_token && config.kind === 'oidc') {
        sessionStorage.setItem('oauth4webapi_id_token', result.id_token);

        // For OIDC, parse user info from ID token
        try {
          const claims = oauth.getValidatedIdTokenClaims(result);
          if (claims) {
            const user = {
              sub: claims.sub,
              email: claims.email || undefined,
              name: claims.name || undefined,
              access_token: result.access_token,
            };
            sessionStorage.setItem('oauth4webapi_user', JSON.stringify(user));
          } else {
            throw new Error('No claims found in ID token');
          }
        } catch (error) {
          const user = {
            sub: 'authenticated',
            access_token: result.access_token,
          };
          sessionStorage.setItem('oauth4webapi_user', JSON.stringify(user));
        }
      } else if (config.kind === 'oauth') {
        // For OAuth, get user info from userinfo endpoint
        try {
          const userInfoResponse = await oauth.userInfoRequest(
            authServer,
            client,
            result.access_token,
          );
          const expectedSub = typeof result.sub === 'string' ? result.sub : 'unknown';
          const userInfo = await oauth.processUserInfoResponse(
            authServer,
            client,
            expectedSub,
            userInfoResponse,
          );

          const user = {
            sub: userInfo.sub,
            email: userInfo.email || undefined,
            name: userInfo.name || undefined,
            access_token: result.access_token,
          };
          sessionStorage.setItem('oauth4webapi_user', JSON.stringify(user));
        } catch (error) {
          const user = {
            sub: result.sub || 'authenticated',
            access_token: result.access_token,
          };
          sessionStorage.setItem('oauth4webapi_user', JSON.stringify(user));
        }
      }

      // Clean up temporary session data
      sessionStorage.removeItem('oauth_code_verifier');
      sessionStorage.removeItem('oauth_nonce');

      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);

      // Check authentication status after successful OAuth flow
      await checkAuthentication();
    } catch (error) {
      console.error('OAuth callback error:', error);
      setAuthState((prev) => ({
        ...prev,
        error: error as Error,
        isLoading: false,
      }));
      throw error; // Re-throw so the callback component can handle it
    } finally {
      callbackProcessingRef.current = false;
    }
  }, [authServer, client, config, checkAuthentication, initializeConfig]);

  // Start OAuth flow
  const signIn = useCallback(async () => {
    if (!authServer || !client || !config) {
      throw new Error('OAuth not initialized');
    }

    const codeVerifier = oauth.generateRandomCodeVerifier();
    const codeChallenge = await oauth.calculatePKCECodeChallenge(codeVerifier);

    // Store in sessionStorage only for the duration of the flow
    sessionStorage.setItem('oauth_code_verifier', codeVerifier);

    const authUrl = new URL(authServer.authorization_endpoint!);
    authUrl.searchParams.set('client_id', client.client_id);
    authUrl.searchParams.set('redirect_uri', config.redirect_uri);
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('scope', config.scope);
    authUrl.searchParams.set('code_challenge', codeChallenge);
    authUrl.searchParams.set('code_challenge_method', 'S256');

    // OIDC vs OAuth difference
    if (config.kind === 'oidc') {
      if (authServer.code_challenge_methods_supported?.includes('S256') !== true) {
        const nonce = oauth.generateRandomNonce();
        authUrl.searchParams.set('nonce', nonce);
        sessionStorage.setItem('oauth_nonce', nonce);
      }
    } else {
      if (authServer.code_challenge_methods_supported?.includes('S256') !== true) {
        const state = oauth.generateRandomState();
        authUrl.searchParams.set('state', state);
      }
    }

    window.location.href = authUrl.href;
  }, [authServer, client, config]);

  const signOut = useCallback(async () => {
    setAuthState({
      isAuthenticated: false,
      isLoading: false,
      user: null,
      error: null,
    });

    // Clean up stored tokens
    sessionStorage.removeItem('oauth4webapi_access_token');
    sessionStorage.removeItem('oauth4webapi_id_token');
    sessionStorage.removeItem('oauth4webapi_user');

    // Clean up any session data
    sessionStorage.removeItem('oauth_code_verifier');
    sessionStorage.removeItem('oauth_nonce');

    // Redirect to logout endpoint or home
    if (authServer?.end_session_endpoint && config?.post_logout_redirect_uri) {
      const logoutUrl = new URL(authServer.end_session_endpoint);
      logoutUrl.searchParams.set('post_logout_redirect_uri', config.post_logout_redirect_uri);
      window.location.href = logoutUrl.toString();
    } else {
      window.location.href = window.location.origin;
    }
  }, [authServer, config]);

  const clearError = useCallback(() => {
    setAuthState((prev) => ({ ...prev, error: null }));
  }, []);

  // Initialize on mount
  useEffect(() => {
    const initialize = async () => {
      // Check if already authenticated
      const isAuth = await checkAuthentication();
      if (!isAuth) {
        await initializeConfig();
      }
    };

    initialize();
  }, []);

  // Monitor deviceState.onboarded to determine when to render AuthGuard
  useEffect(() => {
    if (deviceState.onboarded) {
      initializeConfig();
      setShouldRenderAuthGuard(true);
    } else {
      setShouldRenderAuthGuard(false);
    }
  }, [deviceState.onboarded, initializeConfig]);

  // Remove the automatic callback handling - now handled by dedicated route
  // The callback will be handled by the OAuthCallback component

  const contextValue: AuthContextValue = {
    ...authState,
    signIn,
    signOut,
    clearError,
    handleOAuthCallback: handleCallback,
    isConfigReady: !!(authServer && client && config),
  };

  return (
    <OAuth4WebApiAuthContext.Provider value={contextValue}>
      {shouldRenderAuthGuard ? <AuthGuard>{children}</AuthGuard> : children}
    </OAuth4WebApiAuthContext.Provider>
  );
};
