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
import React, { createContext } from 'react';
import PropTypes from 'prop-types';
import DeviceActivationProvider from '../components/providers/DeviceActivationProvider';
import { OnboardingDialog, useOnboardingStatus } from '../components/onboarding';
import { useDeviceState } from '../components/providers/DeviceStateProvider';

const SystemContext = createContext({});

const SystemContent = ({ children }) => {
  const [onboardingCompleted, setOnboardingCompleted] = React.useState(false);
  const deviceState = useDeviceState();
  const { isRequired: onboardingRequired, isLoading } = useOnboardingStatus();

  const handleOnboardingComplete = () => {
    setOnboardingCompleted(true);
    // Mark device as onboarded when onboarding is completed
    deviceState.setOnboarded(true);
  };

  // Show onboarding when all conditions are met:
  // 1. Device is loaded, 2. Device is not onboarded, 3. Onboarding is required
  const showOnboarding =
    deviceState.loaded &&
    !deviceState.onboarded &&
    onboardingRequired &&
    !isLoading &&
    !onboardingCompleted;

  return (
    <>
      <DeviceActivationProvider>{children}</DeviceActivationProvider>

      {/* Onboarding Dialog - only render when actually needed */}
      {showOnboarding && <OnboardingDialog open={true} onClose={handleOnboardingComplete} />}
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
