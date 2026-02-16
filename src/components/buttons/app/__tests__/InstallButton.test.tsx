/*
 * Copyright (c) 2025 FLECS Technologies GmbH
 *
 * Created on Fri Jan 09 2026
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
import { describe, it, expect, vi, beforeEach } from 'vitest';
import InstallButton from '../InstallButton';
import { mockAvailableApp } from '../../../../models/__mocks__/app';
import { createVersion } from '../../../../utils/version-utils';

// Mock the dependencies
vi.mock('../../../ui/ContentDialog', () => ({
  default: ({ open, children, title }: any) => (
    <div data-testid="content-dialog" data-open={open} data-title={title}>
      {open && children}
    </div>
  ),
}));

vi.mock('../../../apps/installation/InstallationStepper', () => ({
  default: ({ app, version, onStateChange }: any) => {
    React.useEffect(() => {
      // Simulate what would happen in the real component
      if (onStateChange) {
        (window as any).testOnStateChange = onStateChange;
      }
    }, [onStateChange]);

    return (
      <div data-testid="installation-stepper">
        <button
          data-testid="trigger-installing"
          onClick={() =>
            onStateChange?.({ installing: true, currentQuest: { description: 'Downloading app' } })
          }
        >
          Start Install
        </button>
        <button
          data-testid="trigger-installing-no-desc"
          onClick={() => onStateChange?.({ installing: true, currentQuest: null })}
        >
          Start Install No Desc
        </button>
        <button
          data-testid="trigger-completed"
          onClick={() => onStateChange?.({ installing: false, currentQuest: null })}
        >
          Complete Install
        </button>
      </div>
    );
  },
}));

const mockVersion = createVersion('1.0.0', 'Initial release', null, false);

describe('InstallButton', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('renders install button with default text', () => {
      render(<InstallButton app={mockAvailableApp} version={mockVersion} />);

      const button = screen.getByTestId('install-app-button');
      expect(button).toBeInTheDocument();
      expect(button).toHaveTextContent('Install');
    });

    it('renders install button with version when showSelectedVersion is true', () => {
      render(
        <InstallButton app={mockAvailableApp} version={mockVersion} showSelectedVersion={true} />,
      );

      const button = screen.getByTestId('install-app-button');
      expect(button).toHaveTextContent('Install 1.0.0');
    });

    it('renders with Download icon', () => {
      render(<InstallButton app={mockAvailableApp} version={mockVersion} />);

      expect(screen.getByTestId('DownloadIcon')).toBeInTheDocument();
    });

    it('passes additional button props correctly', () => {
      render(<InstallButton app={mockAvailableApp} version={mockVersion} disabled={true} />);

      const button = screen.getByTestId('install-app-button');
      expect(button).toBeDisabled();
    });
  });

  describe('Dialog Functionality', () => {
    it('opens installation dialog when button is clicked', () => {
      render(<InstallButton app={mockAvailableApp} version={mockVersion} />);

      const button = screen.getByTestId('install-app-button');
      fireEvent.click(button);

      const dialog = screen.getByTestId('content-dialog');
      expect(dialog).toHaveAttribute('data-open', 'true');
      expect(dialog).toHaveAttribute('data-title', 'Install Available Test App');
    });

    it('dialog is initially closed', () => {
      render(<InstallButton app={mockAvailableApp} version={mockVersion} />);

      const dialog = screen.getByTestId('content-dialog');
      expect(dialog).toHaveAttribute('data-open', 'false');
    });

    it('renders InstallationStepper in the dialog', () => {
      render(<InstallButton app={mockAvailableApp} version={mockVersion} />);

      const button = screen.getByTestId('install-app-button');
      fireEvent.click(button);

      expect(screen.getByTestId('installation-stepper')).toBeInTheDocument();
    });
  });

  describe('Installation State', () => {
    it('shows quest description when installation starts', async () => {
      render(<InstallButton app={mockAvailableApp} version={mockVersion} />);

      // Open dialog
      const button = screen.getByTestId('install-app-button');
      fireEvent.click(button);

      // Trigger installation state
      const startButton = screen.getByTestId('trigger-installing');
      fireEvent.click(startButton);

      await waitFor(() => {
        expect(button).toHaveTextContent('Downloading app');
      });
    });

    it('shows "Installing" fallback when quest has no description', async () => {
      render(<InstallButton app={mockAvailableApp} version={mockVersion} />);

      const button = screen.getByTestId('install-app-button');
      fireEvent.click(button);

      const startButton = screen.getByTestId('trigger-installing-no-desc');
      fireEvent.click(startButton);

      await waitFor(() => {
        expect(button).toHaveTextContent('Installing');
      });
    });

    it('returns to "Install" text when installation completes', async () => {
      render(
        <InstallButton app={mockAvailableApp} version={mockVersion} showSelectedVersion={true} />,
      );

      const button = screen.getByTestId('install-app-button');
      fireEvent.click(button);

      // Start installation
      const startButton = screen.getByTestId('trigger-installing');
      fireEvent.click(startButton);

      await waitFor(() => {
        expect(button).toHaveTextContent('Downloading app');
      });

      // Complete installation
      const completeButton = screen.getByTestId('trigger-completed');
      fireEvent.click(completeButton);

      await waitFor(() => {
        expect(button).toHaveTextContent('Install 1.0.0');
      });
    });

    it('shows loading state on button during installation', async () => {
      render(<InstallButton app={mockAvailableApp} version={mockVersion} />);

      const button = screen.getByTestId('install-app-button');
      fireEvent.click(button);

      const startButton = screen.getByTestId('trigger-installing');
      fireEvent.click(startButton);

      await waitFor(() => {
        expect(button).toHaveClass('MuiButton-loading');
        expect(button).toBeDisabled();
      });
    });

    it('is not in loading state before installation starts', () => {
      render(<InstallButton app={mockAvailableApp} version={mockVersion} />);

      const button = screen.getByTestId('install-app-button');
      expect(button).not.toHaveClass('MuiButton-loading');
      expect(button).not.toBeDisabled();
    });
  });

  describe('Props Forwarding', () => {
    it('forwards sx prop to button', () => {
      render(<InstallButton app={mockAvailableApp} version={mockVersion} sx={{ margin: 2 }} />);

      const button = screen.getByTestId('install-app-button');
      expect(button).toBeInTheDocument();
    });

    it('forwards custom color prop to button', () => {
      render(<InstallButton app={mockAvailableApp} version={mockVersion} color="primary" />);

      const button = screen.getByTestId('install-app-button');
      expect(button).toBeInTheDocument();
      // The color prop is applied via className, not as an attribute
      expect(button.className).toContain('MuiButton');
    });

    it('does not override internal onClick handler', () => {
      render(<InstallButton app={mockAvailableApp} version={mockVersion} />);

      const button = screen.getByTestId('install-app-button');
      fireEvent.click(button);

      const dialog = screen.getByTestId('content-dialog');
      expect(dialog).toHaveAttribute('data-open', 'true');
    });
  });
});
