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
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SuperAdminStep } from '../SuperAdminStep';
import {
  createMockAuthProviderApi,
  setupSuperAdminExists,
  setupSuperAdminCreation,
} from '../../../../__mocks__/auth-provider-client-ts';
import * as onboardingHelpers from '../../utils/onboardingHelpers';

// Mock API provider
const mockUsePublicAuthProviderApi = vi.fn();

vi.mock('../../../../components/providers/AuthProviderApiProvider', () => ({
  usePublicAuthProviderApi: () => mockUsePublicAuthProviderApi(),
}));

// Mock onboarding helpers
vi.mock('../../utils/onboardingHelpers');

describe('SuperAdminStep', () => {
  let mockApi: any;
  let mockProps: any;

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup props
    mockProps = {
      onNext: vi.fn(),
      onPrevious: vi.fn(),
      onComplete: vi.fn(),
      isLoading: false,
      error: null,
    };

    // Setup API mock using centralized mock
    mockApi = createMockAuthProviderApi();
    // Create the API structure that matches the actual provider
    // The actual provider returns { api: () => Promise<{ AuthApi: ... }> }
    mockUsePublicAuthProviderApi.mockReturnValue({
      api: vi.fn().mockResolvedValue({
        AuthApi: mockApi,
      }),
    });

    // Reset helper mocks
    vi.mocked(onboardingHelpers.checkSuperAdminExists).mockResolvedValue(false);
  });

  describe('SuperAdminStepComponent', () => {
    const SuperAdminStepComponent = new SuperAdminStep().component;

    describe('Initial Rendering', () => {
      it('renders the form with all required fields', () => {
        render(<SuperAdminStepComponent {...mockProps} />);

        expect(screen.getByText('Create Super Administrator')).toBeInTheDocument();
        expect(
          screen.getByText(
            'Create the initial administrator account for your device. This account will have full access to manage the system.',
          ),
        ).toBeInTheDocument();

        expect(screen.getByLabelText('Username')).toBeInTheDocument();
        expect(screen.getByLabelText('Password')).toBeInTheDocument();
        expect(screen.getByLabelText('Confirm Password')).toBeInTheDocument();
        expect(screen.getByText('Create Administrator')).toBeInTheDocument();
      });

      it('has default username set to "admin"', () => {
        render(<SuperAdminStepComponent {...mockProps} />);

        const usernameField = screen.getByLabelText('Username') as HTMLInputElement;
        expect(usernameField.value).toBe('admin');
      });

      it('has password fields initially empty', () => {
        render(<SuperAdminStepComponent {...mockProps} />);

        const passwordField = screen.getByLabelText('Password') as HTMLInputElement;
        const confirmPasswordField = screen.getByLabelText('Confirm Password') as HTMLInputElement;

        expect(passwordField.value).toBe('');
        expect(confirmPasswordField.value).toBe('');
      });
    });

    describe('Form Input Handling', () => {
      it('allows typing in username field', () => {
        render(<SuperAdminStepComponent {...mockProps} />);

        const usernameField = screen.getByLabelText('Username');
        fireEvent.change(usernameField, { target: { value: 'testuser' } });

        expect((usernameField as HTMLInputElement).value).toBe('testuser');
      });

      it('allows typing in password field', () => {
        render(<SuperAdminStepComponent {...mockProps} />);

        const passwordField = screen.getByLabelText('Password');
        fireEvent.change(passwordField, { target: { value: 'testpassword123' } });

        expect((passwordField as HTMLInputElement).value).toBe('testpassword123');
      });

      it('allows typing in confirm password field', () => {
        render(<SuperAdminStepComponent {...mockProps} />);

        const confirmPasswordField = screen.getByLabelText('Confirm Password');
        fireEvent.change(confirmPasswordField, { target: { value: 'testpassword123' } });

        expect((confirmPasswordField as HTMLInputElement).value).toBe('testpassword123');
      });
    });

    describe('Password Visibility Toggle', () => {
      it('toggles password visibility for password field', () => {
        render(<SuperAdminStepComponent {...mockProps} />);

        const passwordField = screen.getByLabelText('Password');
        const toggleButton = passwordField.parentElement?.querySelector('button');

        expect(passwordField).toHaveAttribute('type', 'password');

        if (toggleButton) {
          fireEvent.click(toggleButton);
          expect(passwordField).toHaveAttribute('type', 'text');

          fireEvent.click(toggleButton);
          expect(passwordField).toHaveAttribute('type', 'password');
        }
      });

      it('toggles password visibility for confirm password field', () => {
        render(<SuperAdminStepComponent {...mockProps} />);

        const confirmPasswordField = screen.getByLabelText('Confirm Password');
        const toggleButton = confirmPasswordField.parentElement?.querySelector('button');

        expect(confirmPasswordField).toHaveAttribute('type', 'password');

        if (toggleButton) {
          fireEvent.click(toggleButton);
          expect(confirmPasswordField).toHaveAttribute('type', 'text');
        }
      });
    });

    describe('Password Strength Indicator', () => {
      it('shows password strength indicator when password is entered', () => {
        render(<SuperAdminStepComponent {...mockProps} />);

        const passwordField = screen.getByLabelText('Password');
        fireEvent.change(passwordField, { target: { value: '123' } });

        expect(screen.getByText(/Password Strength:/)).toBeInTheDocument();
        expect(screen.getByText(/Weak/)).toBeInTheDocument();
      });

      it('shows different strength levels based on password complexity', () => {
        render(<SuperAdminStepComponent {...mockProps} />);

        const passwordField = screen.getByLabelText('Password');

        // Weak password
        fireEvent.change(passwordField, { target: { value: '123' } });
        expect(screen.getByText(/Weak/)).toBeInTheDocument();

        // Stronger password
        fireEvent.change(passwordField, { target: { value: 'TestPassword123!' } });
        expect(screen.getByText(/Strong/)).toBeInTheDocument();
      });

      it('does not show password strength when password is empty', () => {
        render(<SuperAdminStepComponent {...mockProps} />);

        expect(screen.queryByText(/Password Strength:/)).not.toBeInTheDocument();
      });
    });

    describe('Form Validation', () => {
      it('shows validation error for empty username', async () => {
        render(<SuperAdminStepComponent {...mockProps} />);

        const usernameField = screen.getByLabelText('Username');
        const passwordField = screen.getByLabelText('Password');
        const confirmPasswordField = screen.getByLabelText('Confirm Password');
        const submitButton = screen.getByText('Create Administrator');

        // Clear username and set passwords
        fireEvent.change(usernameField, { target: { value: '' } });
        fireEvent.change(passwordField, { target: { value: 'password123' } });
        fireEvent.change(confirmPasswordField, { target: { value: 'password123' } });

        fireEvent.click(submitButton);

        await waitFor(() => {
          expect(screen.getByText('Username is required')).toBeInTheDocument();
        });
      });

      it('shows validation error for empty password', async () => {
        render(<SuperAdminStepComponent {...mockProps} />);

        const passwordField = screen.getByLabelText('Password');
        const confirmPasswordField = screen.getByLabelText('Confirm Password');
        const submitButton = screen.getByText('Create Administrator');

        // Set confirm password but leave password empty
        fireEvent.change(confirmPasswordField, { target: { value: 'password123' } });

        fireEvent.click(submitButton);

        await waitFor(() => {
          expect(screen.getByText('Password is required')).toBeInTheDocument();
        });
      });

      it('shows validation error for mismatched passwords', async () => {
        render(<SuperAdminStepComponent {...mockProps} />);

        const passwordField = screen.getByLabelText('Password');
        const confirmPasswordField = screen.getByLabelText('Confirm Password');
        const submitButton = screen.getByText('Create Administrator');

        fireEvent.change(passwordField, { target: { value: 'password123' } });
        fireEvent.change(confirmPasswordField, { target: { value: 'different123' } });

        fireEvent.click(submitButton);

        await waitFor(() => {
          expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
        });
      });
    });

    describe('Form Submission', () => {
      it('submits form with correct data when valid', async () => {
        mockApi.postSuperAdmin.mockResolvedValue({});

        render(<SuperAdminStepComponent {...mockProps} />);

        const usernameField = screen.getByLabelText('Username');
        const passwordField = screen.getByLabelText('Password');
        const confirmPasswordField = screen.getByLabelText('Confirm Password');
        const submitButton = screen.getByText('Create Administrator');

        fireEvent.change(usernameField, { target: { value: 'testadmin' } });
        fireEvent.change(passwordField, { target: { value: 'password123' } });
        fireEvent.change(confirmPasswordField, { target: { value: 'password123' } });

        fireEvent.click(submitButton);

        await waitFor(() => {
          expect(mockApi.postSuperAdmin).toHaveBeenCalledWith({
            full_name: 'testadmin',
            name: 'testadmin',
            password: 'password123',
          });
        });

        expect(mockProps.onComplete).toHaveBeenCalled();
        expect(mockProps.onNext).toHaveBeenCalled();
      });

      it('handles API error during submission', async () => {
        const errorMessage = 'User creation failed';
        mockApi.postSuperAdmin.mockRejectedValue(new Error(errorMessage));

        render(<SuperAdminStepComponent {...mockProps} />);

        const passwordField = screen.getByLabelText('Password');
        const confirmPasswordField = screen.getByLabelText('Confirm Password');
        const submitButton = screen.getByText('Create Administrator');

        fireEvent.change(passwordField, { target: { value: 'password123' } });
        fireEvent.change(confirmPasswordField, { target: { value: 'password123' } });

        fireEvent.click(submitButton);

        await waitFor(() => {
          expect(screen.getByText(errorMessage)).toBeInTheDocument();
        });

        expect(mockProps.onComplete).not.toHaveBeenCalled();
        expect(mockProps.onNext).not.toHaveBeenCalled();
      });

      it('shows generic error message when no error message provided', async () => {
        mockApi.postSuperAdmin.mockRejectedValue(new Error());

        render(<SuperAdminStepComponent {...mockProps} />);

        const passwordField = screen.getByLabelText('Password');
        const confirmPasswordField = screen.getByLabelText('Confirm Password');
        const submitButton = screen.getByText('Create Administrator');

        fireEvent.change(passwordField, { target: { value: 'password123' } });
        fireEvent.change(confirmPasswordField, { target: { value: 'password123' } });

        fireEvent.click(submitButton);

        await waitFor(() => {
          expect(
            screen.getByText('Failed to create super admin. Please try again.'),
          ).toBeInTheDocument();
        });
      });
    });

    describe('Button States', () => {
      it('allows clicking submit button when passwords do not match and shows validation error', async () => {
        render(<SuperAdminStepComponent {...mockProps} />);

        const passwordField = screen.getByLabelText('Password');
        const confirmPasswordField = screen.getByLabelText('Confirm Password');
        const submitButton = screen.getByText('Create Administrator');

        fireEvent.change(passwordField, { target: { value: 'password123' } });
        fireEvent.change(confirmPasswordField, { target: { value: 'different123' } });

        expect(submitButton).not.toBeDisabled();

        fireEvent.click(submitButton);

        await waitFor(() => {
          expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
        });
      });

      it('allows clicking submit button when password is empty and shows validation error', async () => {
        render(<SuperAdminStepComponent {...mockProps} />);

        const submitButton = screen.getByText('Create Administrator');
        expect(submitButton).not.toBeDisabled();

        fireEvent.click(submitButton);

        await waitFor(() => {
          expect(screen.getByText('Password is required')).toBeInTheDocument();
        });
      });

      it('allows clicking submit button when confirm password is empty and shows validation error', async () => {
        render(<SuperAdminStepComponent {...mockProps} />);

        const passwordField = screen.getByLabelText('Password');
        const submitButton = screen.getByText('Create Administrator');

        fireEvent.change(passwordField, { target: { value: 'password123' } });

        expect(submitButton).not.toBeDisabled();

        fireEvent.click(submitButton);

        await waitFor(() => {
          expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
        });
      });

      it('enables submit button when all fields are valid', () => {
        render(<SuperAdminStepComponent {...mockProps} />);

        const passwordField = screen.getByLabelText('Password');
        const confirmPasswordField = screen.getByLabelText('Confirm Password');
        const submitButton = screen.getByText('Create Administrator');

        fireEvent.change(passwordField, { target: { value: 'password123' } });
        fireEvent.change(confirmPasswordField, { target: { value: 'password123' } });

        expect(submitButton).not.toBeDisabled();
      });

      it('shows loading state during submission', () => {
        render(<SuperAdminStepComponent {...mockProps} isLoading={true} />);

        const submitButton = screen.getByText('Creating Admin...');
        expect(submitButton).toBeDisabled();
      });

      it('disables fields during loading', () => {
        render(<SuperAdminStepComponent {...mockProps} isLoading={true} />);

        const usernameField = screen.getByLabelText('Username');
        const passwordField = screen.getByLabelText('Password');
        const confirmPasswordField = screen.getByLabelText('Confirm Password');

        expect(usernameField).toBeDisabled();
        expect(passwordField).toBeDisabled();
        expect(confirmPasswordField).toBeDisabled();
      });
    });

    describe('Error Display', () => {
      it('displays parent error when provided', () => {
        render(<SuperAdminStepComponent {...mockProps} error="Parent component error" />);

        expect(screen.getByText('Parent component error')).toBeInTheDocument();
      });
    });
  });

  describe('SuperAdminStep Class', () => {
    let step: SuperAdminStep;

    beforeEach(() => {
      step = new SuperAdminStep();
    });

    it('has correct properties', () => {
      expect(step.id).toBe('super-admin');
      expect(step.title).toBe('Create Super Admin');
      expect(step.description).toBe('Create the initial administrator account');
      expect(step.component).toBeDefined();
    });

    it('has auth-provider dependency', () => {
      expect(step.getDependencies()).toEqual(['auth-provider']);
    });

    it('cannot be skipped', () => {
      expect(step.canSkip()).toBe(false);
    });

    it('checks completion status correctly', async () => {
      const mockApiContext = {
        auth: mockApi,
      };

      vi.mocked(onboardingHelpers.checkSuperAdminExists).mockResolvedValue(true);

      const isCompleted = await step.isCompleted(mockApiContext);

      expect(isCompleted).toBe(true);
      expect(onboardingHelpers.checkSuperAdminExists).toHaveBeenCalledWith(mockApi);
    });

    it('returns false when no API context provided', async () => {
      const isCompleted = await step.isCompleted();

      expect(isCompleted).toBe(false);
    });

    it('returns false when no auth API in context', async () => {
      const mockApiContext = {};

      const isCompleted = await step.isCompleted(mockApiContext);

      expect(isCompleted).toBe(false);
    });
  });
});
