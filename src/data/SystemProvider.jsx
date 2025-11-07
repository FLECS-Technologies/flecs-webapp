/*
 * Copyright (c) 2022 FLECS Technologies GmbH
 *
 * Created on Mon Apr 11 2022
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
import React, { createContext, useState } from 'react';
import PropTypes from 'prop-types';
import DeviceActivationProvider from '../components/providers/DeviceActivationProvider';
import { OnboardingDialog, useOnboardingStatus } from '../components/onboarding';

const SystemContext = createContext({});

const SystemContent = ({ children }) => {
  const [onboardingCompleted, setOnboardingCompleted] = useState(false);
  const { isRequired: onboardingRequired, isLoading } = useOnboardingStatus();

  const handleOnboardingComplete = () => {
    setOnboardingCompleted(true);
  };

  // Only show onboarding if:
  // 1. The system determines it's required AND
  // 2. The user hasn't completed it in this session AND
  // 3. We're not still loading the status
  const showOnboarding = onboardingRequired && !onboardingCompleted && !isLoading;

  return (
    <>
      <DeviceActivationProvider>{children}</DeviceActivationProvider>

      {/* Onboarding Dialog - only shows when required and not completed */}
      <OnboardingDialog open={showOnboarding} onClose={handleOnboardingComplete} />
    </>
  );
};

const SystemContextProvider = ({ children }) => {
  // ping === TRUE: Deamon is available. ping === FALSE: Deamon is currently not available
  const [ping, setPing] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [systemInfo, setSystemInfo] = React.useState();

  return (
    <SystemContext.Provider
      value={{ ping, setPing, loading, setLoading, systemInfo, setSystemInfo }}
    >
      <SystemContent>{children}</SystemContent>
    </SystemContext.Provider>
  );
};

function useSystemContext() {
  return React.useContext(SystemContext);
}

export { SystemContext, SystemContextProvider, useSystemContext };

SystemContextProvider.propTypes = {
  children: PropTypes.any,
};

SystemContent.propTypes = {
  children: PropTypes.any,
};
