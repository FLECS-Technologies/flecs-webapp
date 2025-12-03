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
import React, { createContext, useContext, useMemo } from 'react';
import normalizeUrl from 'normalize-url';
import { useOAuth4WebApiAuth } from './OAuth4WebApiAuthProvider';

import { Configuration } from '@flecs/core-client-ts';
import { createApi } from '../../api/flecs-core/api-client';

// Remove the global api export from api-client.ts
export function getBaseURL(): string {
  return normalizeUrl(host() + '/' + baseURL());
}

export function host() {
  if (import.meta.env.VITE_APP_ENVIRONMENT === 'development') {
    return import.meta.env.VITE_APP_DEV_CORE_URL || '';
  }
  return window.location.origin;
}

export function baseURL() {
  if (import.meta.env.VITE_APP_ENVIRONMENT === 'development') {
    return '/api/v2';
  }
  return '../api/v2';
}

// Public API Context (no authentication)
const PublicApiContext = createContext<ReturnType<typeof createApi> | undefined>(undefined);

export const usePublicApi = () => {
  const context = useContext(PublicApiContext);
  if (!context) {
    throw new Error('usePublicApi must be used within PublicApiProvider');
  }
  return context;
};

// Protected API Context (with authentication)
const ProtectedApiContext = createContext<ReturnType<typeof createApi> | undefined>(undefined);

export const useProtectedApi = () => {
  const context = useContext(ProtectedApiContext);
  if (!context) {
    throw new Error('useProtectedApi must be used within ProtectedApiProvider');
  }
  return context;
};

interface ApiProviderProps {
  children: React.ReactNode;
}

export function PublicApiProvider({ children }: ApiProviderProps) {
  const api = useMemo(() => {
    const config = new Configuration({
      basePath: getBaseURL(),
      // No accessToken for public API
    });
    return createApi(config);
  }, []);

  return <PublicApiContext.Provider value={api}>{children}</PublicApiContext.Provider>;
}

export function ProtectedApiProvider({ children }: ApiProviderProps) {
  const auth = useOAuth4WebApiAuth();

  const api = useMemo(() => {
    const config = new Configuration({
      basePath: getBaseURL(),
      accessToken: auth.user?.access_token,
    });
    return createApi(config);
  }, [auth.user?.access_token]);

  return <ProtectedApiContext.Provider value={api}>{children}</ProtectedApiContext.Provider>;
}

// For backward compatibility - alias to protected API
export const ApiProvider = ProtectedApiProvider;
export const useApi = useProtectedApi;
