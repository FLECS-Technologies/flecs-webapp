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
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CompletionStep, resetCompletionStepState } from '../CompletionStep';

// Mock router
const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

describe('CompletionStep', () => {
  let mockProps: any;

  beforeEach(() => {
    vi.clearAllMocks();
    resetCompletionStepState();

    // Setup props
    mockProps = {
      onNext: vi.fn(),
      onPrevious: vi.fn(),
      onComplete: vi.fn(),
      isLoading: false,
      error: null,
    };
  });

  describe('CompletionStepComponent', () => {
    const CompletionStepComponent = new CompletionStep().component;

    it('renders completion message', () => {
      render(<CompletionStepComponent {...mockProps} />);

      expect(screen.getByText('Onboarding Complete!')).toBeInTheDocument();
      expect(
        screen.getByText('Your device has been successfully configured and is ready to use.'),
      ).toBeInTheDocument();
      expect(
        screen.getByText('You can now start using your device with full administrative access.'),
      ).toBeInTheDocument();
    });

    it('calls onComplete on mount', async () => {
      render(<CompletionStepComponent {...mockProps} />);

      // Wait for useEffect to run
      await waitFor(() => {
        expect(mockProps.onComplete).toHaveBeenCalled();
      });
    });

    it('navigates to device-login on mount', async () => {
      render(<CompletionStepComponent {...mockProps} />);

      // Wait for useEffect to run
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/device-login');
      });
    });

    it('only calls effects once even with multiple renders', async () => {
      const { rerender } = render(<CompletionStepComponent {...mockProps} />);

      // Wait for first effect
      await waitFor(() => {
        expect(mockProps.onComplete).toHaveBeenCalled();
      });

      // Re-render the component
      rerender(<CompletionStepComponent {...mockProps} />);

      // Should still only be called once due to the hasBeenRendered flag
      expect(mockProps.onComplete).toHaveBeenCalledTimes(1);
      expect(mockNavigate).toHaveBeenCalledTimes(1);
    });
  });

  describe('CompletionStep Class', () => {
    let step: CompletionStep;

    beforeEach(() => {
      step = new CompletionStep();
    });

    it('has correct properties', () => {
      expect(step.id).toBe('completion');
      expect(step.title).toBe('Complete');
      expect(step.description).toBe('Onboarding completed successfully');
      expect(step.component).toBeDefined();
    });

    it('has auth-provider dependency', () => {
      expect(step.getDependencies()).toEqual(['auth-provider']);
    });

    it('cannot be skipped', () => {
      expect(step.canSkip()).toBe(false);
    });

    it('can always execute when dependencies are met', async () => {
      const canExecute = await step.canExecute();
      expect(canExecute).toBe(true);
    });

    it('reports completion status based on render flag', async () => {
      // Render the component to trigger completion
      render(<step.component {...mockProps} />);

      // Wait for effect to run
      await waitFor(() => {
        expect(mockProps.onComplete).toHaveBeenCalled();
      });

      // Should now be completed
      const isCompletedAfter = await step.isCompleted();
      expect(isCompletedAfter).toBe(true);
    });
  });
});
