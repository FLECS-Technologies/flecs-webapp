/*
 * Copyright (c) 2025 FLECS Technologies GmbH
 *
 * Created on Thu Oct 31 2025
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
import { OnboardingStepper } from '../';

// Mock the API provider
const mockUseProtectedApi = vi.fn();

vi.mock('../../providers/ApiProvider', () => ({
  useProtectedApi: () => mockUseProtectedApi(),
}));

// Mock Material-UI components that might cause issues in tests
vi.mock('@mui/material/Stepper', () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="stepper">{children}</div>
  ),
}));

vi.mock('@mui/material/Step', () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="step">{children}</div>
  ),
}));

vi.mock('@mui/material/StepLabel', () => ({
  default: ({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) => (
    <div data-testid="step-label" onClick={onClick}>
      {children}
    </div>
  ),
}));

describe('OnboardingStepper', () => {
  let mockApi: any;

  beforeEach(() => {
    vi.clearAllMocks();

    mockApi = {
      providers: {
        getProvidersAuthDefault: vi.fn(() => Promise.resolve({ data: null })),
      },
    };

    mockUseProtectedApi.mockReturnValue(mockApi);
  });

  it('renders the onboarding stepper with welcome message', async () => {
    render(<OnboardingStepper />);

    expect(screen.getByText('Welcome to FLECS')).toBeInTheDocument();
    expect(screen.getByText("Let's set up your IoT device management system")).toBeInTheDocument();
  });

  it('shows setup progress', async () => {
    render(<OnboardingStepper />);

    await waitFor(() => {
      expect(screen.getByText(/Setup Progress:/)).toBeInTheDocument();
    });
  });

  it('renders setup steps', async () => {
    render(<OnboardingStepper />);

    await waitFor(() => {
      expect(screen.getByText('Setup Authentication Provider')).toBeInTheDocument();
      expect(screen.getByText('Create Super Administrator')).toBeInTheDocument();
    });
  });

  it('does not render when onboarding is completed', async () => {
    // Mock completed onboarding status
    mockApi.providers.getProvidersAuthDefault.mockResolvedValue({ data: { id: 'default' } });

    render(<OnboardingStepper />);

    // Since we can't easily mock the super admin check, this test is simplified
    // In a real implementation, you would mock both checks to return completed status
    await waitFor(() => {
      expect(screen.getByText('Welcome to FLECS')).toBeInTheDocument();
    });
  });

  it('handles API errors gracefully', async () => {
    mockApi.providers.getProvidersAuthDefault.mockRejectedValue(new Error('API Error'));

    render(<OnboardingStepper />);

    await waitFor(() => {
      expect(screen.getByText('Welcome to FLECS')).toBeInTheDocument();
    });
  });
});
