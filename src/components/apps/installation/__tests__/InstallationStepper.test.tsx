/*
 * Copyright (c) 2022 FLECS Technologies GmbH
 *
 * Created on Tue Jan 30 2024
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
import { render, act, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import InstallationStepper from '../InstallationStepper';
import { DeviceActivationContext } from '../../../providers/DeviceActivationContext';
import { mockApp } from '../../../../models/__mocks__/app';
import { ReferenceDataContextProvider } from '../../../../data/ReferenceDataContext';
import { vitest } from 'vitest';

vitest.mock('../../../../api/device/DeviceAuthAPI');
vitest.mock('../../../../api/device/license/status');
vitest.mock('../../../../api/device/license/activation');

describe('InstallationStepper Component', () => {
  afterAll(() => {
    vitest.clearAllMocks();
  });

  it('App installation', () => {
    act(() => {
      render(
        <ReferenceDataContextProvider>
          <DeviceActivationContext.Provider
            value={{
              activated: true,
              activating: false,
              activate: async () => {},
              validating: false,
              validate: async () => {},
              error: false,
              statusText: '',
            }}
          >
            <InstallationStepper
              app={mockApp}
              version={mockApp.appKey.version}
              sideload={false}
              update={false}
            />
          </DeviceActivationContext.Provider>
        </ReferenceDataContextProvider>,
      );
    });

    const infoText = screen.getByTestId('install-app-step');
    expect(infoText).toBeInTheDocument();
  });

  it('App update', () => {
    act(() => {
      render(
        <ReferenceDataContextProvider>
          <DeviceActivationContext.Provider
            value={{
              activated: true,
              activating: false,
              activate: async () => {},
              validating: false,
              validate: async () => {},
              error: false,
              statusText: '',
            }}
          >
            <InstallationStepper
              app={mockApp}
              version={mockApp.appKey.version}
              sideload={false}
              update={true}
            />
          </DeviceActivationContext.Provider>
        </ReferenceDataContextProvider>,
      );
    });

    const infoText = screen.getByTestId('update-app-step');
    expect(infoText).toBeInTheDocument();
  });

  it('App sideload', () => {
    act(() => {
      render(
        <ReferenceDataContextProvider>
          <DeviceActivationContext.Provider
            value={{
              activated: true,
              activating: false,
              activate: async () => {},
              validating: false,
              validate: async () => {},
              error: false,
              statusText: '',
            }}
          >
            <InstallationStepper
              app={mockApp}
              version={mockApp.appKey.version}
              sideload={true}
              update={false}
            />
          </DeviceActivationContext.Provider>
        </ReferenceDataContextProvider>,
      );
    });

    const infoText = screen.getByTestId('sideload-app-step');
    expect(infoText).toBeInTheDocument();
  });

  it('Missing activation', () => {
    act(() => {
      render(
        <ReferenceDataContextProvider>
          <DeviceActivationContext.Provider
            value={{
              activated: false,
              activating: false,
              activate: async () => {},
              validating: false,
              validate: async () => {},
              error: false,
              statusText: '',
            }}
          >
            <InstallationStepper
              app={mockApp}
              version={mockApp.appKey.version}
              sideload={false}
              update={false}
            />
          </DeviceActivationContext.Provider>
        </ReferenceDataContextProvider>,
      );
    });

    const infoText = screen.getByTestId('device-activation-step');
    expect(infoText).toBeInTheDocument();
  });
});
