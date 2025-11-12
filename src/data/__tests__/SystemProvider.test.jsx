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

import React from 'react';
import { render } from '@testing-library/react';
import { describe, it, beforeEach, vi } from 'vitest';
import { SystemContextProvider } from '../SystemProvider';

// Mock the DeviceActivationProvider to avoid state update warnings
vi.mock('../../components/providers/DeviceActivationProvider', () => ({
  default: ({ children }) => children,
}));

// Mock the DeviceStateProvider using the centralized mock
vi.mock('../../components/providers/DeviceStateProvider');

// Import the mock helpers
import { resetMockDeviceState } from '../../components/providers/__mocks__/DeviceStateProvider';

// Mock the onboarding components to avoid complex dependencies
vi.mock('../../components/onboarding', () => ({
  OnboardingDialog: ({ children }) => <div data-testid="onboarding-dialog">{children}</div>,
  useOnboardingStatus: () => ({
    isRequired: false,
    isLoading: false,
  }),
}));

describe('SystemContextProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetMockDeviceState(); // Reset the device state mock
  });

  it('renders SystemContextProvider component', () => {
    render(<SystemContextProvider />);
  });
});
