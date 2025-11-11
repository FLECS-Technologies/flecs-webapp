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
import { AuthState } from './types';

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
  const checkAuthentication = useCallback(async (): Promise<boolean> => {
    try {
      // Check for stored access token (using sessionStorage for better security)
      const accessToken = sessionStorage.getItem(SESSION_KEYS.ACCESS_TOKEN);
      const user = sessionStorage.getItem(SESSION_KEYS.USER);

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
        return {
          isAuthenticated: true,
          isLoading: false,
          user: JSON.parse(user),
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
