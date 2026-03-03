import { createApi } from '@shared/api/api-client';

export const getAuthCoreProvider = async (api: ReturnType<typeof createApi>) => {
  try {
    let coreProvider = await api.providers.getProvidersAuthCore();
    if (coreProvider && coreProvider.data === 'default') {
      const defaultAuthProvider = await api.providers.getProvidersAuthDefault();
      return defaultAuthProvider.data;
    } else {
      return coreProvider.data;
    }
  } catch (error) {}
};
