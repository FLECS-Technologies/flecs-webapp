/*
 * Copyright (c) 2025 FLECS Technologies GmbH
 *
 * Created on Nov 03 2025
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

import { useState, useEffect } from 'react';
import { usePublicApi } from '@contexts/api/ApiProvider';
import { usePublicAuthProviderApi } from '@contexts/api/AuthProviderApiProvider';
import { useDeviceState } from '@contexts/device/DeviceStateProvider';
import { checkAuthProviderConfigured, checkSuperAdminExists } from '../utils/onboardingHelpers';

interface OnboardingStatus {
  isRequired: boolean;
  isLoading: boolean;
  error: string | null;
}

/**
 * Hook to determine if onboarding is required for the current device
 * Checks if essential configuration steps are completed
 */
export const useOnboardingStatus = (): OnboardingStatus => {
  const [status, setStatus] = useState<OnboardingStatus>({
    isRequired: false,
    isLoading: false,
    error: null,
  });

  const api = usePublicApi();
  const authProviderApi = usePublicAuthProviderApi();
  const deviceState = useDeviceState();

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      try {
        setStatus((prev) => ({ ...prev, isLoading: true, error: null }));

        // Check if authentication provider is configured
        const authConfigured = await checkAuthProviderConfigured(api);

        const superAdminExists = await checkSuperAdminExists(authProviderApi);
        // Add more checks here as needed

        const onboardingRequired = !authConfigured || !superAdminExists;

        setStatus({
          isRequired: onboardingRequired,
          isLoading: false,
          error: null,
        });

        // Update device state: loaded = true, onboarded = !onboardingRequired
        deviceState.setLoaded(true);
        deviceState.setOnboarded(!onboardingRequired);
      } catch (error: any) {
        setStatus({
          isRequired: false,
          isLoading: false,
          error: error.message || 'Failed to check onboarding status',
        });

        // In case of error, assume device is loaded but might need onboarding
        deviceState.setLoaded(true);
        deviceState.setOnboarded(false);
      }
    };

    if (api && authProviderApi && !status.isLoading) {
      checkOnboardingStatus();
    }
  }, [api, authProviderApi]);

  return status;
};
