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

import React, { useState, useEffect, createContext, useContext } from 'react';
import { WizardStep } from '../core/WizardStep';
import { WizardContextType, WizardProviderProps } from '../types/types';

const WizardContext = createContext<WizardContextType | null>(null);

export const useWizard = () => {
  const context = useContext(WizardContext);
  if (!context) {
    throw new Error('useWizard must be used within WizardProvider');
  }
  return context;
};

export const WizardProvider: React.FC<WizardProviderProps> = ({
  children,
  registry,
  context: wizardContext,
}) => {
  const [currentStep, setCurrentStep] = useState<WizardStep | null>(null);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [availableSteps, setAvailableSteps] = useState<WizardStep[]>([]);
  const [allSteps, setAllSteps] = useState<WizardStep[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    initializeWizard();
  }, []);

  const initializeWizard = async () => {
    try {
      setIsLoading(true);
      await refreshStatus();
    } catch (err: any) {
      setError(err.message || 'Failed to initialize wizard');
    } finally {
      setIsLoading(false);
    }
  };

  const refreshStatus = async () => {
    try {
      const steps = registry.getAllSteps();
      setAllSteps(steps);

      // Let the registry handle all completion checking
      const allCompleted = await registry.isWizardCompleted(wizardContext);
      setIsCompleted(allCompleted);

      if (!allCompleted) {
        // Build completed steps list by checking each step
        const completionPromises = steps.map(async (step) => ({
          stepId: step.id,
          isCompleted: await step.isCompleted(wizardContext),
        }));

        const completionStatus = await Promise.all(completionPromises);
        const apiCompleted = completionStatus
          .filter((status) => status.isCompleted)
          .map((status) => status.stepId);

        // Merge immediately completed steps with API results to avoid overwriting
        setCompletedSteps((prevCompleted) => {
          const combined = [...new Set([...prevCompleted, ...apiCompleted])];
          return combined;
        });

        // Use current state for registry operations (will be updated after setState)
        const currentCompleted = [...new Set([...completedSteps, ...apiCompleted])];

        // Get available steps and current step
        const available = await registry.getAvailableSteps(currentCompleted, wizardContext);
        setAvailableSteps(available);

        const nextStep = await registry.getNextStep(currentCompleted, wizardContext);
        setCurrentStep(nextStep);
      } else {
        // All steps completed - show the last step in the list
        const lastStep = steps[steps.length - 1];
        setCompletedSteps(steps.map((step) => step.id));
        setAvailableSteps([]);
        setCurrentStep(lastStep || null);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to check wizard status');
    }
  };

  const nextStep = async () => {
    if (!currentStep) return;

    const currentIndex = allSteps.findIndex((step) => step.id === currentStep.id);
    if (currentIndex < allSteps.length - 1) {
      const nextStepCandidate = allSteps[currentIndex + 1];
      setCurrentStep(nextStepCandidate);
    }
  };

  const previousStep = () => {
    if (!currentStep) return;

    const currentIndex = allSteps.findIndex((step) => step.id === currentStep.id);
    if (currentIndex > 0) {
      const prevStep = allSteps[currentIndex - 1];
      setCurrentStep(prevStep);
    }
  };

  const goToStep = (stepId: string) => {
    const step = registry.getStep(stepId);
    if (step) {
      setCurrentStep(step);
    }
  };

  const completeCurrentStep = async () => {
    if (!currentStep) return;

    try {
      setIsLoading(true);

      // Mark the current step as completed immediately
      if (!completedSteps.includes(currentStep.id)) {
        const updatedCompletedSteps = [...completedSteps, currentStep.id];
        setCompletedSteps(updatedCompletedSteps);
      }

      await refreshStatus();
    } catch (err: any) {
      setError(err.message || 'Failed to complete step');
    } finally {
      setIsLoading(false);
    }
  };

  const contextValue: WizardContextType = {
    currentStep,
    completedSteps,
    availableSteps,
    allSteps,
    isLoading,
    error,
    isCompleted,
    nextStep,
    previousStep,
    goToStep,
    completeCurrentStep,
    refreshStatus,
  };

  return <WizardContext.Provider value={contextValue}>{children}</WizardContext.Provider>;
};
