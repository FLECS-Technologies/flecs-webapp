// Public API Context (no authentication)
import React, { createContext, useContext, useMemo } from 'react';
import { Configuration } from '@flecs/auth-provider-client-ts';
import { createApi } from '../../api/auth-provider-client/api-client';
import { getBaseURL } from './ApiProvider';

function getAuthURL() {
  return getBaseURL() + '/providers/auth/core';
}

const PublicAuthProviderApiContext = createContext<ReturnType<typeof createApi> | undefined>(
  undefined,
);

export const usePublicAuthProviderApi = () => {
  const context = useContext(PublicAuthProviderApiContext);
  if (!context) {
    throw new Error('usePublicAuthProviderApi must be used within PublicApiProvider');
  }
  return context;
};

interface PublicAuthProviderApiProviderProps {
  children: React.ReactNode;
}

export function PublicAuthProviderApiProvider({ children }: PublicAuthProviderApiProviderProps) {
  const api = useMemo(() => {
    const config = new Configuration({
      basePath: getAuthURL(),
    });
    return createApi(config);
  }, []);

  return (
    <PublicAuthProviderApiContext.Provider value={api}>
      {children}
    </PublicAuthProviderApiContext.Provider>
  );
}
