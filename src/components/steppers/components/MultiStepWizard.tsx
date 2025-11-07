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

import React, { useEffect } from 'react';
import { Box, Typography, Alert, Button, Card, CardContent } from '@mui/material';
import { HorizontalStepper } from './HorizontalStepper';
import { StepperStep, MultiStepWizardProps } from '../types/types';
import { useWizard } from '../providers';

export const MultiStepWizard: React.FC<MultiStepWizardProps> = ({ title }) => {
  const {
    currentStep,
    completedSteps,
    allSteps,
    isLoading,
    error,
    nextStep,
    previousStep,
    completeCurrentStep,
    refreshStatus,
    goToStep,
  } = useWizard();

  useEffect(() => {
    refreshStatus();
  }, []); // Only run once on mount

  const getCurrentStepComponent = () => {
    if (!currentStep) return null;

    const StepComponent = currentStep.component;
    return (
      <StepComponent
        onNext={nextStep}
        onPrevious={previousStep}
        onComplete={completeCurrentStep}
        isLoading={isLoading}
        error={error || undefined}
      />
    );
  };

  const currentStepIndex = currentStep
    ? allSteps.findIndex((s: any) => s.id === currentStep.id)
    : 0;

  // Convert wizard steps to stepper format
  const steps: StepperStep[] = allSteps.map((step: any) => ({
    id: step.id,
    title: step.title,
    description: step.description,
    completed: completedSteps.includes(step.id),
  }));

  // Handle step click using wizard context
  const handleStepClick = (stepId: string) => {
    goToStep(stepId);
  };
  return (
    <Card sx={{ p: 4, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Typography variant="h6" align="center" pb={4}>
          {title}
        </Typography>
        <HorizontalStepper
          steps={steps}
          currentStepIndex={currentStepIndex}
          onStepClick={handleStepClick}
        />

        {error && (
          <Alert
            severity="error"
            sx={{ mb: 3 }}
            action={
              <Button color="inherit" size="small" onClick={refreshStatus}>
                Retry
              </Button>
            }
          >
            {error}
          </Alert>
        )}

        <Box sx={{ mt: 4, flex: 1, display: 'flex', flexDirection: 'column' }}>
          {isLoading && !currentStep ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1 }}>
              <Typography variant="body1">Loading...</Typography>
            </Box>
          ) : (
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              {getCurrentStepComponent()}
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};
