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

import { WizardStep } from './WizardStep';

/**
 * Generic registry for managing wizard steps
 */
export class WizardStepRegistry {
  private steps: Map<string, WizardStep> = new Map();
  private stepOrder: string[] = [];

  /**
   * Register a step in the registry
   * @param step - The step to register
   * @param order - Optional position to insert the step at
   */
  register(step: WizardStep, order?: number): void {
    // Check if step is already registered to prevent duplicates
    if (this.steps.has(step.id)) {
      return;
    }

    this.steps.set(step.id, step);

    if (order !== undefined) {
      this.stepOrder.splice(order, 0, step.id);
    } else {
      this.stepOrder.push(step.id);
    }
  }

  /**
   * Unregister a step from the registry
   * @param stepId - The ID of the step to remove
   */
  unregister(stepId: string): void {
    this.steps.delete(stepId);
    this.stepOrder = this.stepOrder.filter((id) => id !== stepId);
  }

  /**
   * Get a specific step by ID
   * @param stepId - The ID of the step to retrieve
   */
  getStep(stepId: string): WizardStep | undefined {
    return this.steps.get(stepId);
  }

  /**
   * Get all registered steps in order
   */
  getAllSteps(): WizardStep[] {
    return this.stepOrder
      .map((id) => this.steps.get(id))
      .filter((step): step is WizardStep => step !== undefined);
  }

  /**
   * Get steps that are available to execute based on completed steps and dependencies
   * @param completedStepIds - Array of completed step IDs
   * @param context - Optional context for step validation
   */
  async getAvailableSteps(completedStepIds: string[], context?: any): Promise<WizardStep[]> {
    const allSteps = this.getAllSteps();
    const availableSteps: WizardStep[] = [];

    for (const step of allSteps) {
      if (completedStepIds.includes(step.id)) {
        continue;
      }

      const dependencies = step.getDependencies();
      const dependenciesSatisfied = dependencies.every((depId) => completedStepIds.includes(depId));

      if (dependenciesSatisfied && (await step.canExecute())) {
        availableSteps.push(step);
      }
    }

    return availableSteps;
  }

  /**
   * Get the next step that should be executed
   * @param completedStepIds - Array of completed step IDs
   * @param context - Optional context for step validation
   */
  async getNextStep(completedStepIds: string[], context?: any): Promise<WizardStep | null> {
    const availableSteps = await this.getAvailableSteps(completedStepIds, context);
    return availableSteps[0] || null;
  }

  /**
   * Check if all steps in the wizard are completed
   * @param context - Optional context for completion checks
   */
  async isWizardCompleted(context?: any): Promise<boolean> {
    const allSteps = this.getAllSteps();

    for (const step of allSteps) {
      if (!step.canSkip() && !(await step.isCompleted(context))) {
        return false;
      }
    }

    return true;
  } /**
   * Clear all registered steps
   */
  clear(): void {
    this.steps.clear();
    this.stepOrder = [];
  }

  /**
   * Get the total number of registered steps
   */
  getStepCount(): number {
    return this.stepOrder.length;
  }
}
