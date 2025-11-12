/*
 * Copyright (c) 2025 FLECS Technologies GmbH
 *
 * Created on Nov 11 2025
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
import { vi } from 'vitest';
import { WizardContextType } from '../types/types';

// Default mock wizard context
export const createMockWizardContext = (
  overrides?: Partial<WizardContextType>,
): WizardContextType => ({
  currentStep: null,
  completedSteps: [],
  availableSteps: [],
  allSteps: [],
  isLoading: false,
  error: null,
  isCompleted: false,
  nextStep: vi.fn(),
  previousStep: vi.fn(),
  goToStep: vi.fn(),
  completeCurrentStep: vi.fn(),
  refreshStatus: vi.fn(),
  ...overrides,
});

// Mock wizard context
let mockWizardContext = createMockWizardContext();

// Mock useWizard hook
export const useWizard = vi.fn(() => mockWizardContext);

// Helper function to update the mock context in tests
export const setMockWizardContext = (newContext: Partial<WizardContextType>) => {
  mockWizardContext = createMockWizardContext(newContext);
  useWizard.mockReturnValue(mockWizardContext);
};

// Reset function for beforeEach in tests
export const resetMockWizardContext = () => {
  mockWizardContext = createMockWizardContext();
  useWizard.mockReturnValue(mockWizardContext);
  vi.clearAllMocks();
};

// Mock WizardProvider component
export const WizardProvider = ({ children }: { children: React.ReactNode }) => {
  return <div data-testid="wizard-provider">{children}</div>;
};
