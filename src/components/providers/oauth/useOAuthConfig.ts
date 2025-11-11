/*
 * Copyright (c) 2025 FLECS Technologies GmbH
 *
 * Created on Nov 10 2025
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

import { useState, useCallback, useRef } from 'react';
import * as oauth from 'oauth4webapi';
import { usePublicApi } from '../ApiProvider';
import { AuthProvidersAndDefaults, AuthProvider } from '@flecs/core-client-ts';
import { OAuthConfig, OAuthState } from './types';

/**
 * Hook to manage OAuth configuration initialization
 */
export const useOAuthConfig = () => {
  const api = usePublicApi();
  const [oauthState, setOAuthState] = useState<OAuthState>({
    config: null,
    authServer: null,
    client: null,
  });
  const initializingRef = useRef(false);

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
        return { isSystemReady: false };
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
      const authServer: oauth.AuthorizationServer = {
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
      const basePath = import.meta.env.BASE_URL || '/';
      const redirectUri =
        props.redirect_uri || `${window.location.origin}${basePath}oauth/callback`;

      const config: OAuthConfig = {
        ...providerConfig,
        ...props,
        issuer: issuer.href,
        redirect_uri: redirectUri,
        scope: props.scope || (algorithm === 'oidc' ? 'openid email' : 'api:read'),
      };

      setOAuthState({
        config,
        authServer,
        client: oauthClient,
      });

      return { isSystemReady: true };
    } catch (error) {
      console.error('Failed to initialize OAuth config:', error);
      throw error;
    } finally {
      initializingRef.current = false;
    }
  }, [api]);

  const isConfigReady = !!(oauthState.authServer && oauthState.client && oauthState.config);

  return {
    ...oauthState,
    initializeConfig,
    isConfigReady,
  };
};
