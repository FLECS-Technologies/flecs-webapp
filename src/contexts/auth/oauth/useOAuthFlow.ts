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

import { useCallback } from 'react';
import * as oauth from 'oauth4webapi';
import { OAuthConfig } from './types';
import { useAuthSession } from './useAuthSession';

/**
 * Hook to handle OAuth sign in and sign out flows
 */
export const useOAuthFlow = (
  authServer: oauth.AuthorizationServer | null,
  client: oauth.Client | null,
  config: OAuthConfig | null,
) => {
  const { clearSession } = useAuthSession();

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
    clearSession();

    // Redirect to logout endpoint or home
    if (authServer?.end_session_endpoint && config?.post_logout_redirect_uri) {
      const logoutUrl = new URL(authServer.end_session_endpoint);
      logoutUrl.searchParams.set('post_logout_redirect_uri', config.post_logout_redirect_uri);
      window.location.href = logoutUrl.toString();
    } else {
      window.location.href = window.location.origin;
    }
  }, [authServer, config, clearSession]);

  return {
    signIn,
    signOut,
  };
};
