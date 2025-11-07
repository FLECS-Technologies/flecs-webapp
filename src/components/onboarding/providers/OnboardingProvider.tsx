/*
 * Copyright (c) 2025 FLECS Technologies GmbH
 *
 * Created on Thu Oct 31 2025
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

import React from 'react';
import { WizardProvider, useWizard } from '../../steppers';
import { usePublicApi, useProtectedApi } from '../../providers/ApiProvider';
import { usePublicAuthProviderApi } from '../../../components/providers/AuthProviderApiProvider';
import { onboardingRegistry } from '../utils/stepRegistration';

// Re-export the wizard hook with onboarding-specific name for backwards compatibility
export const useOnboarding = useWizard;

interface OnboardingProviderProps {
  children: React.ReactNode;
}

export const OnboardingProvider: React.FC<OnboardingProviderProps> = ({ children }) => {
  const publicApi = usePublicApi();
  const protectedApi = useProtectedApi();
  const authProviderApi = usePublicAuthProviderApi();

  // Create composite API context with all available API providers
  const apiContext = {
    public: publicApi,
    protected: protectedApi,
    auth: authProviderApi,
    // Add more API providers as needed
  };

  return (
    <WizardProvider registry={onboardingRegistry} context={apiContext}>
      {children}
    </WizardProvider>
  );
};
