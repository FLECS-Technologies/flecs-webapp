/*
 * Copyright (c) 2025 FLECS Technologies GmbH
 *
 * Created on Nov 10 2025
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

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

/**
 * Device state interface representing the three main application states
 */
export interface DeviceState {
  loaded: boolean;
  onboarded: boolean;
  authenticated: boolean;
}

/**
 * Context value interface with state and update methods
 */
export interface DeviceStateContextValue extends DeviceState {
  setLoaded: (loaded: boolean) => void;
  setOnboarded: (onboarded: boolean) => void;
  setAuthenticated: (authenticated: boolean) => void;
}

const DeviceStateContext = createContext<DeviceStateContextValue | undefined>(undefined);

/**
 * Hook to use the DeviceState context
 */
export const useDeviceState = (): DeviceStateContextValue => {
  const context = useContext(DeviceStateContext);
  if (!context) {
    throw new Error('useDeviceState must be used within DeviceStateProvider');
  }
  return context;
};

interface DeviceStateProviderProps {
  children: ReactNode;
}

/**
 * DeviceStateProvider manages the three main device states
 */
export const DeviceStateProvider: React.FC<DeviceStateProviderProps> = ({ children }) => {
  const [state, setState] = useState<DeviceState>({
    loaded: false,
    onboarded: false,
    authenticated: false,
  });

  const setLoaded = useCallback((loaded: boolean) => {
    setState((prev) => ({ ...prev, loaded }));
  }, []);

  const setOnboarded = useCallback((onboarded: boolean) => {
    setState((prev) => ({ ...prev, onboarded }));
  }, []);

  const setAuthenticated = useCallback((authenticated: boolean) => {
    setState((prev) => ({ ...prev, authenticated }));
  }, []);

  const contextValue: DeviceStateContextValue = {
    loaded: state.loaded,
    onboarded: state.onboarded,
    authenticated: state.authenticated,
    setLoaded,
    setOnboarded,
    setAuthenticated,
  };

  return <DeviceStateContext.Provider value={contextValue}>{children}</DeviceStateContext.Provider>;
};
