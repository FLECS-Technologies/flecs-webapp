import React, { createContext, useContext, useMemo } from 'react';
import { useAuth } from 'react-oidc-context';

import { Configuration } from '@flecs/core-client-ts';
import { createApi } from '../../api/flecs-core/api-client';

// Remove the global api export from api-client.ts
function getBaseURL(): string {
  return host() + baseURL();
}

function host() {
  let target = '';
  if (import.meta.env.VITE_APP_ENVIRONMENT === 'development') {
    target = import.meta.env.VITE_APP_DEV_CORE_URL || '';
  }
  return target;
}

function baseURL() {
  if (
    import.meta.env.VITE_APP_ENVIRONMENT === 'test' ||
    import.meta.env.VITE_APP_ENVIRONMENT === 'development'
  ) {
    return '/api/v2';
  }
  return '../api/v2';
}

const ApiContext = createContext<ReturnType<typeof createApi> | undefined>(undefined);

export const useApi = () => {
  const context = useContext(ApiContext);
  if (!context) {
    throw new Error('useApi must be used within ApiProvider');
  }
  return context;
};

interface ApiProviderProps {
  children: React.ReactNode;
}

export function ApiProvider({ children }: ApiProviderProps) {
  const auth = useAuth();

  const api = useMemo(() => {
    const config = new Configuration({
      basePath: getBaseURL(),
      accessToken: auth.user?.access_token,
    });
    return createApi(config);
  }, [auth.user?.access_token]);

  return <ApiContext.Provider value={api}>{children}</ApiContext.Provider>;
}
