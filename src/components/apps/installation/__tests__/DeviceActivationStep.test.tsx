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
import DeviceActivationStep from '../DeviceActivationStep';
import { DeviceActivationContext } from '../../../providers/DeviceActivationContext';
import { vitest } from 'vitest';

vitest.mock('../../../../api/device/license/status');
vitest.mock('../../../../api/device/license/activation');

describe('DeviceActivationStep Component', () => {
  afterAll(() => {
    vitest.clearAllMocks();
  });

  it('renders the DeviceActivationStep component', () => {
    const handleNext = jest.fn();
    act(() => {
      render(
        <DeviceActivationContext.Provider
          value={{
            activated: true,
            activating: false,
            activate: async () => {},
            validating: false,
            validate: async () => {},
          }}
        >
          <DeviceActivationStep handleNext={handleNext} />
        </DeviceActivationContext.Provider>,
      );
    });

    expect(handleNext).toBeCalled();
  });
});
