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
import { Container, Typography, Button, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { WizardStep, WizardStepProps } from '../../steppers';

// Track if this step has been rendered
let hasBeenRendered = false;

// For testing: reset the module state
export const resetCompletionStepState = () => {
  hasBeenRendered = false;
};

const CompletionStepComponent: React.FC<WizardStepProps> = ({ onComplete }) => {
  const navigate = useNavigate();

  // Call onComplete when this component gets rendered
  useEffect(() => {
    if (!hasBeenRendered) {
      hasBeenRendered = true;
      navigate('/device-login');
      onComplete();
    }
  }, [onComplete]);

  return (
    <Container maxWidth="md" sx={{ py: 4, textAlign: 'center' }}>
      <Typography variant="h4" gutterBottom>
        Onboarding Complete!
      </Typography>

      <Typography color="text.secondary" sx={{ mb: 2 }}>
        Your device has been successfully configured and is ready to use.
      </Typography>

      <Typography color="text.secondary">
        You can now start using your device with full administrative access.
      </Typography>
    </Container>
  );
};

export class CompletionStep extends WizardStep {
  readonly id = 'completion';
  readonly title = 'Complete';
  readonly description = 'Onboarding completed successfully';
  readonly component = CompletionStepComponent;

  async isCompleted(apiContext?: any): Promise<boolean> {
    // Only completed after it has been rendered
    return hasBeenRendered;
  }

  async canExecute(): Promise<boolean> {
    // Always executable when dependencies are met
    return true;
  }

  canSkip(): boolean {
    return false;
  }

  getDependencies(): string[] {
    return ['auth-provider'];
  }
}
