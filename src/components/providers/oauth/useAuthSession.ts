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
import { AuthState, User } from './types';
import { usePublicAuthProviderApi } from '../AuthProviderApiProvider';
import { decodeJwt } from '../../../utils/jwt-utils';

// Session storage keys
export const SESSION_KEYS = {
  ACCESS_TOKEN: 'oauth4webapi_access_token',
  ID_TOKEN: 'oauth4webapi_id_token',
  USER: 'oauth4webapi_user',
  CODE_VERIFIER: 'oauth_code_verifier',
  NONCE: 'oauth_nonce',
} as const;

/**
 * Hook to manage authentication state and session storage
 */
export const useAuthSession = () => {
  const api = usePublicAuthProviderApi();
  const checkAuthentication = useCallback(async (): Promise<boolean> => {
    try {
      // Check for stored access token (using sessionStorage for better security)
      const accessToken = sessionStorage.getItem(SESSION_KEYS.ACCESS_TOKEN);
      const user = sessionStorage.getItem(SESSION_KEYS.USER);
      if (accessToken) {
        const { header } = decodeJwt(accessToken);
        const jwk = await api.AuthApi.getJwk();
        if (jwk && header.kid !== jwk.data?.kid) {
          // Token's key ID does not match the expected JWK key ID
          sessionStorage.removeItem(SESSION_KEYS.ACCESS_TOKEN);
          sessionStorage.removeItem(SESSION_KEYS.USER);
          return false;
        }
      }

      return !!(accessToken && user);
    } catch (error) {
      // Clear potentially corrupted data
      sessionStorage.removeItem(SESSION_KEYS.ACCESS_TOKEN);
      sessionStorage.removeItem(SESSION_KEYS.USER);
      return false;
    }
  }, []);

  const clearSession = useCallback(() => {
    // Clean up stored tokens
    sessionStorage.removeItem(SESSION_KEYS.ACCESS_TOKEN);
    sessionStorage.removeItem(SESSION_KEYS.ID_TOKEN);
    sessionStorage.removeItem(SESSION_KEYS.USER);

    // Clean up any session data
    sessionStorage.removeItem(SESSION_KEYS.CODE_VERIFIER);
    sessionStorage.removeItem(SESSION_KEYS.NONCE);
  }, []);

  const getUserFromSession = useCallback((): AuthState => {
    try {
      const accessToken = sessionStorage.getItem(SESSION_KEYS.ACCESS_TOKEN);
      const user = sessionStorage.getItem(SESSION_KEYS.USER);

      if (accessToken && user) {
        const parsedUser: User = JSON.parse(user);

        // if the user contains at least a preferred_username, consider it valid
        if (parsedUser.preferred_username) {
          return {
            isAuthenticated: true,
            isLoading: false,
            user: parsedUser,
            error: null,
          };
        }

        // Fallback: decode access token to extract user information
        const { payload: tokenClaims } = decodeJwt(accessToken) || {};
        if (tokenClaims) {
          const enhancedUser: User = {
            ...parsedUser,
            sub: tokenClaims.sub || parsedUser.sub,
            email: tokenClaims.email || parsedUser.email,
            preferred_username: tokenClaims.preferred_username || parsedUser.preferred_username,
            exp: tokenClaims.exp || parsedUser.exp,
            realm_access: tokenClaims.realm_access || parsedUser.realm_access,
            resource_access: tokenClaims.resource_access || parsedUser.resource_access,
            // Keep existing properties and add token-derived ones
            access_token: parsedUser.access_token || accessToken,
          };

          return {
            isAuthenticated: true,
            isLoading: false,
            user: enhancedUser,
            error: null,
          };
        }

        // Still return the original user even if token decoding failed
        return {
          isAuthenticated: true,
          isLoading: false,
          user: parsedUser,
          error: null,
        };
      }
    } catch (error) {
      // Clear potentially corrupted data
      sessionStorage.removeItem(SESSION_KEYS.ACCESS_TOKEN);
      sessionStorage.removeItem(SESSION_KEYS.USER);
    }

    return {
      isAuthenticated: false,
      isLoading: false,
      user: null,
      error: null,
    };
  }, []);

  return {
    checkAuthentication,
    clearSession,
    getUserFromSession,
  };
};
