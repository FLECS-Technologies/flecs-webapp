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
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { OnboardingDialog } from '../OnboardingDialog';

// Mock API providers
const mockUseProtectedApi = vi.fn();
const mockUsePublicApi = vi.fn();
const mockUsePublicAuthProviderApi = vi.fn();

vi.mock('../../../providers/ApiProvider', () => ({
  useProtectedApi: () => mockUseProtectedApi(),
  usePublicApi: () => mockUsePublicApi(),
}));

vi.mock('../../../../components/providers/AuthProviderApiProvider', () => ({
  usePublicAuthProviderApi: () => mockUsePublicAuthProviderApi(),
}));

// Material-UI components will use their real implementations

// Use centralized steppers mocks
vi.mock('../../steppers', () => ({
  MultiStepWizard: ({ title }: { title: string }) => (
    <div data-testid="multi-step-wizard" data-title={title}>
      Multi Step Wizard: {title}
    </div>
  ),
}));

// Mock wizard providers with centralized approach
const mockWizardContext = {
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
};

vi.mock('../../steppers/providers', () => ({
  useWizard: () => mockWizardContext,
}));

// Helper functions for managing mock state
const resetMockWizardContext = () => {
  mockWizardContext.isCompleted = false;
  mockWizardContext.currentStep = null;
  mockWizardContext.completedSteps = [];
  mockWizardContext.error = null;
  mockWizardContext.isLoading = false;
  vi.clearAllMocks();
};

const setMockWizardContext = (updates: any) => {
  Object.assign(mockWizardContext, updates);
};

// Mock onboarding step registration
vi.mock('../utils/stepRegistration', () => ({
  onboardingRegistry: {
    getSteps: () => [],
    registerStep: vi.fn(),
    unregisterStep: vi.fn(),
  },
}));

describe('OnboardingDialog', () => {
  let mockApi: any;
  let mockPublicApi: any;
  let mockAuthProviderApi: any;

  beforeEach(() => {
    vi.clearAllMocks();

    // Reset wizard context using centralized mock
    resetMockWizardContext();

    // Setup API mocks
    mockApi = {
      system: {
        systemPingGet: vi.fn(() => Promise.resolve({ data: 'pong' })),
      },
    };

    mockPublicApi = {
      system: {
        systemPingGet: vi.fn(() => Promise.resolve({ data: 'pong' })),
      },
    };

    mockAuthProviderApi = {
      providers: {
        getProvidersAuth: vi.fn(() => Promise.resolve({ data: [] })),
      },
    };

    mockUseProtectedApi.mockReturnValue(mockApi);
    mockUsePublicApi.mockReturnValue(mockPublicApi);
    mockUsePublicAuthProviderApi.mockReturnValue(mockAuthProviderApi);
  });

  it('renders the dialog when open is true', () => {
    render(<OnboardingDialog open={true} />);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Welcome')).toBeInTheDocument();
  });

  it('does not render the dialog when open is false', () => {
    render(<OnboardingDialog open={false} />);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('displays welcome title', () => {
    render(<OnboardingDialog open={true} />);

    expect(screen.getByText('Welcome')).toBeInTheDocument();
  });

  it('renders MultiStepWizard with correct title when dialog is open', () => {
    render(<OnboardingDialog open={true} />);

    // Check that the wizard title is rendered (it's part of the real MultiStepWizard now)
    expect(screen.getByText('Device Onboarding')).toBeInTheDocument();
  });

  it('does not render MultiStepWizard when dialog is closed', () => {
    render(<OnboardingDialog open={false} />);

    expect(screen.queryByTestId('multi-step-wizard')).not.toBeInTheDocument();
  });

  it('renders close button that is disabled when wizard is not completed', () => {
    setMockWizardContext({ isCompleted: false });

    render(<OnboardingDialog open={true} />);

    const closeButton = screen.getByRole('button', { name: /close/i });
    expect(closeButton).toBeInTheDocument();
    expect(closeButton).toBeDisabled();
  });

  it('renders close button', () => {
    render(<OnboardingDialog open={true} />);

    const closeButton = screen.getByRole('button', { name: /close/i });
    expect(closeButton).toBeInTheDocument();
  });

  it('works without onClose prop', () => {
    render(<OnboardingDialog open={true} />);

    const closeButton = screen.getByRole('button', { name: /close/i });
    expect(closeButton).toBeInTheDocument();

    // Should not throw when clicking without onClose
    expect(() => fireEvent.click(closeButton)).not.toThrow();
  });

  it('sets dialog properties correctly', () => {
    render(<OnboardingDialog open={true} />);

    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();
    // Check that the dialog is fullscreen by looking for specific classes or attributes
    expect(dialog.closest('.MuiDialog-paperFullScreen')).toBeInTheDocument();
  });

  it('renders dialog content with proper structure', () => {
    render(<OnboardingDialog open={true} />);

    // Check that the main content is present
    expect(screen.getByText('Welcome')).toBeInTheDocument();
    expect(screen.getByText('Device Onboarding')).toBeInTheDocument();
  });

  it('close button state depends on wizard completion', () => {
    render(<OnboardingDialog open={true} />);

    const closeButton = screen.getByRole('button', { name: /close/i });
    // Note: In the real implementation, the button starts disabled until wizard is completed
    // This test just verifies the button exists and is in the expected initial state
    expect(closeButton).toBeDisabled();
  });

  it('provides API context to wizard through OnboardingProvider', () => {
    render(<OnboardingDialog open={true} />);

    // Verify that API providers are called, indicating the context is being used
    expect(mockUseProtectedApi).toHaveBeenCalled();
    expect(mockUsePublicApi).toHaveBeenCalled();
    expect(mockUsePublicAuthProviderApi).toHaveBeenCalled();
  });
});
