/*
 * Copyright (c) 2025 FLECS Technologies GmbH
 *
 * Created on Nov 07 2025
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

import { PublicAuthProviderApiContextValue } from '@contexts/api/AuthProviderApiProvider';

/**
 * Helper function to check if the authentication provider is configured
 * @param api - The public API instance
 * @returns Promise<boolean> - true if auth provider is configured, false otherwise
 */
export const checkAuthProviderConfigured = async (api: any): Promise<boolean> => {
  try {
    const coreId = await getCoreAuthProviderId(api);
    return coreId !== null;
  } catch (error) {
    return false;
  }
};

/**
 * Helper function to check if the authentication provider core is configured
 * @param api - The public API instance
 * @returns Promise<boolean> - true if auth provider core is configured, false otherwise
 */
export const checkAuthProviderCoreConfigured = async (api: any): Promise<boolean> => {
  try {
    const response = await api.providers.getProvidersAuthCore();
    return !!(response.status === 200 && response.data);
  } catch (error) {
    return false;
  }
};

/**
 * Helper function to get the configured auth provider ID
 * @param api - The public API instance
 * @returns Promise<string | null> - the provider ID if configured, null otherwise
 */
export const getCoreAuthProviderId = async (api: any): Promise<string | null> => {
  try {
    const authResponse = await api.providers.getProvidersAuth();
    if (authResponse.status === 200) return authResponse.data?.core || null;
    return null;
  } catch (error) {
    return null;
  }
};

/**
 * Helper function to check if a super admin exists
 * @param authProviderApi - The auth provider API instance
 * @returns Promise<boolean> - true if super admin exists, false otherwise
 */
export const checkSuperAdminExists = async (
  authProviderApi: PublicAuthProviderApiContextValue,
): Promise<boolean> => {
  try {
    const api = (await authProviderApi.api()).AuthApi;
    const superAdminResponse = await api.getSuperAdmin();
    return superAdminResponse.status === 204;
  } catch (error) {
    return false;
  }
};
