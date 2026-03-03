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

import { useCallback, useRef } from 'react';
import * as oauth from 'oauth4webapi';
import { OAuthConfig } from './types';
import { SESSION_KEYS } from './useAuthSession';

/**
 * Hook to handle OAuth callback processing
 */
export const useOAuthCallback = (
  authServer: oauth.AuthorizationServer | null,
  client: oauth.Client | null,
  config: OAuthConfig | null,
  initializeConfig: () => Promise<any>,
) => {
  const callbackProcessingRef = useRef(false);

  const handleCallback = useCallback(async () => {
    // Prevent multiple callback processing in dev mode
    if (callbackProcessingRef.current) {
      return;
    }
    callbackProcessingRef.current = true;

    try {
      // Initialize config if not already done (needed for direct callback URL access)
      if (!authServer || !client || !config) {
        callbackProcessingRef.current = false; // Reset ref before calling initializeConfig
        await initializeConfig();
        // Config will be set, but we need to wait for the next render cycle
        // The callback will be retriggered when config is ready
        return;
      }

      const currentUrl = new URL(window.location.href);

      const codeVerifier = sessionStorage.getItem(SESSION_KEYS.CODE_VERIFIER);
      const nonce = sessionStorage.getItem(SESSION_KEYS.NONCE);

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
        sessionStorage.setItem(SESSION_KEYS.ACCESS_TOKEN, result.access_token);
      }

      if (result.id_token && config.kind === 'oidc') {
        sessionStorage.setItem(SESSION_KEYS.ID_TOKEN, result.id_token);

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
            sessionStorage.setItem(SESSION_KEYS.USER, JSON.stringify(user));
          } else {
            throw new Error('No claims found in ID token');
          }
        } catch (error) {
          const user = {
            sub: 'anonymous',
            access_token: result.access_token,
          };
          sessionStorage.setItem(SESSION_KEYS.USER, JSON.stringify(user));
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
          sessionStorage.setItem(SESSION_KEYS.USER, JSON.stringify(user));
        } catch (error) {
          const user = {
            sub: result.sub || 'anonymous',
            access_token: result.access_token,
          };
          sessionStorage.setItem(SESSION_KEYS.USER, JSON.stringify(user));
        }
      }

      // Clean up temporary session data
      sessionStorage.removeItem(SESSION_KEYS.CODE_VERIFIER);
      sessionStorage.removeItem(SESSION_KEYS.NONCE);

      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    } catch (error) {
      console.error('OAuth callback error:', error);
      throw error; // Re-throw so the callback component can handle it
    } finally {
      callbackProcessingRef.current = false;
    }
  }, [authServer, client, config, initializeConfig]);

  return { handleCallback };
};
