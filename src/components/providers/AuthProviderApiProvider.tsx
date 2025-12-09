// Public API Context (no authentication)
import React, { createContext, useContext, useMemo, useState, useEffect } from 'react';
import { Configuration } from '@flecs/auth-provider-client-ts';
import { createApi } from '../../api/auth-provider-client/api-client';
import { getBaseURL } from './ApiProvider';
import { getCoreAuthProviderId } from '../onboarding/utils/onboardingHelpers';
import { usePublicApi } from './ApiProvider';

function getAuthURL() {
  return getBaseURL() + '/providers/auth/core';
}

function getAuthProviderURL(providerId: string) {
  return getBaseURL() + '/providers/auth/' + providerId;
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
  const publicApi = usePublicApi();
  const [providerId, setProviderId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProviderId = async () => {
      try {
        const id = await getCoreAuthProviderId(publicApi);
        setProviderId(id);
      } catch (error) {
        console.error('Failed to fetch auth provider ID:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProviderId();
  }, []);

  const api = useMemo(() => {
    const basePath = providerId ? getAuthProviderURL(providerId) : getAuthURL();
    const config = new Configuration({
      basePath,
    });
    return createApi(config);
  }, [providerId]);

  return (
    <PublicAuthProviderApiContext.Provider value={api}>
      {children}
    </PublicAuthProviderApiContext.Provider>
  );
}
