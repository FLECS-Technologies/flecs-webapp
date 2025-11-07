/*
 * Copyright (c) 2025 FLECS Technologies GmbH
 *
 * Created on Nov 02 2025
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
import { WizardStep } from '../core/WizardStep';
import { WizardStepRegistry } from '../core/WizardStepRegistry';

// Core stepper UI interfaces
export interface StepperStep {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
}

export interface HorizontalStepperProps {
  steps: StepperStep[];
  currentStepIndex: number;
  onStepClick?: (stepId: string, stepIndex: number) => void;
}

// Multi-step wizard interfaces
export interface MultiStepWizardProps {
  title: string;
}

// Wizard step interfaces
export interface WizardStepProps {
  onNext: () => void;
  onPrevious: () => void;
  onComplete: () => Promise<void>;
  isLoading?: boolean;
  error?: string;
}

export interface StepResult {
  success: boolean;
  error?: string;
  data?: any;
}

// Wizard context interfaces
export interface WizardContextType {
  currentStep: WizardStep | null;
  completedSteps: string[];
  availableSteps: WizardStep[];
  allSteps: WizardStep[];
  isLoading: boolean;
  error: string | null;
  isCompleted: boolean;
  nextStep: () => Promise<void>;
  previousStep: () => void;
  goToStep: (stepId: string) => void;
  completeCurrentStep: () => Promise<void>;
  refreshStatus: () => Promise<void>;
}

export interface WizardProviderProps {
  children: React.ReactNode;
  registry: WizardStepRegistry;
  context?: any; // Context passed to step completion checks
}
