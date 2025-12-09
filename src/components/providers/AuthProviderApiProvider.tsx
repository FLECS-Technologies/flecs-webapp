// Auth provider API context and provider
import React, { createContext, useContext, useMemo, useState, useEffect } from 'react';
import { Configuration } from '@flecs/auth-provider-client-ts';
import { createApi } from '../../api/auth-provider-client/api-client';
import { getAuthProviderURL } from './ApiProvider';
import { getCoreAuthProviderId } from '../onboarding/utils/onboardingHelpers';
import { usePublicApi } from './ApiProvider';

async function getProviderId(api: ReturnType<typeof usePublicApi>) {
  return await getCoreAuthProviderId(api);
}

export interface PublicAuthProviderApiContextValue {
  api: () => Promise<ReturnType<typeof createApi>>;
}

// Function to lazy load the AuthProvider API and set the provider ID when available
async function getApi(
  providerId: string | null,
  setProviderId: React.Dispatch<React.SetStateAction<string | null>>,
  api: ReturnType<typeof usePublicApi>,
) {
  if (!providerId) {
    providerId = await getProviderId(api);
  }
  if (!providerId) {
    throw 'Could not get provider id';
  }
  setProviderId(providerId);
  const basePath = getAuthProviderURL(providerId);
  const config = new Configuration({
    basePath,
  });
  return createApi(config);
}

const PublicAuthProviderApiContext = createContext<PublicAuthProviderApiContextValue | undefined>(
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
  const [providerId, setProviderId] = useState<string | null>(null);

  const api = usePublicApi();
  const contextValue = { api: () => getApi(providerId, setProviderId, api) };

  return (
    <PublicAuthProviderApiContext.Provider value={contextValue}>
      {children}
    </PublicAuthProviderApiContext.Provider>
  );
}
