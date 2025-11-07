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
import { Box, Stepper, Step, StepLabel } from '@mui/material';
import { HorizontalStepperProps } from '../types';

export const HorizontalStepper: React.FC<HorizontalStepperProps> = ({
  steps,
  currentStepIndex,
  onStepClick,
}) => {
  const handleStepClick = (stepId: string, index: number) => {
    if (onStepClick && (steps[index].completed || index === currentStepIndex)) {
      onStepClick(stepId, index);
    }
  };

  return (
    <Box sx={{ mb: 4 }}>
      <Stepper activeStep={currentStepIndex} alternativeLabel>
        {steps.map((step, index) => (
          <Step key={step.id} completed={step.completed}>
            <StepLabel onClick={() => handleStepClick(step.id, index)}>{step.title}</StepLabel>
          </Step>
        ))}
      </Stepper>
    </Box>
  );
};
