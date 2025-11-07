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

import { WizardStepProps, StepResult } from '../types/types';

/**
 * Abstract base class for wizard steps
 */
export abstract class WizardStep {
  abstract readonly id: string;
  abstract readonly title: string;
  abstract readonly description: string;
  abstract readonly component: any; // React.ComponentType<WizardStepProps> but avoiding React import

  /**
   * Check if this step is already completed
   * @param context - Context for making API calls or other checks
   */
  abstract isCompleted(context?: any): Promise<boolean>;

  /**
   * Execute the step's main action (optional)
   */
  async execute?(): Promise<StepResult> {
    return { success: false, error: 'Not implemented' };
  }

  /**
   * Check if this step can be skipped
   */
  canSkip(): boolean {
    return false;
  }

  /**
   * Get step dependencies
   */
  getDependencies(): string[] {
    return [];
  }

  /**
   * Validate if this step can be executed
   */
  async canExecute(): Promise<boolean> {
    return true;
  }
}
