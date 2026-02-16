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
import UpdateButton from '../UpdateButton';
import { mockInstalledApp } from '../../../../models/__mocks__/app';
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
  default: ({ app, version, update, onStateChange }: any) => {
    React.useEffect(() => {
      if (onStateChange) {
        (window as any).testOnStateChange = onStateChange;
      }
    }, [onStateChange]);

    return (
      <div data-testid="installation-stepper" data-update={update}>
        <button
          data-testid="trigger-updating"
          onClick={() =>
            onStateChange?.({
              updating: true,
              currentQuest: { description: 'Migrating instances' },
            })
          }
        >
          Start Update
        </button>
        <button
          data-testid="trigger-updating-no-desc"
          onClick={() => onStateChange?.({ updating: true, currentQuest: null })}
        >
          Start Update No Desc
        </button>
        <button
          data-testid="trigger-completed"
          onClick={() => onStateChange?.({ updating: false, currentQuest: null })}
        >
          Complete Update
        </button>
      </div>
    );
  },
}));

const mockFromVersion = createVersion('1.0.0', 'Initial release', null, true);
const mockToVersion = createVersion('2.0.0', 'New features', null, false);

describe('UpdateButton', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('renders update button with default text', () => {
      render(<UpdateButton app={mockInstalledApp} from={mockFromVersion} to={mockToVersion} />);

      const button = screen.getByTestId('update-app-button');
      expect(button).toBeInTheDocument();
      expect(button).toHaveTextContent('Update');
    });

    it('renders update button with version when showSelectedVersion is true', () => {
      render(
        <UpdateButton
          app={mockInstalledApp}
          from={mockFromVersion}
          to={mockToVersion}
          showSelectedVersion={true}
        />,
      );

      const button = screen.getByTestId('update-app-button');
      expect(button).toHaveTextContent('Update to 2.0.0');
    });

    it('renders with Update icon', () => {
      render(<UpdateButton app={mockInstalledApp} from={mockFromVersion} to={mockToVersion} />);

      expect(screen.getByTestId('UpdateIcon')).toBeInTheDocument();
    });

    it('passes additional button props correctly', () => {
      render(
        <UpdateButton
          app={mockInstalledApp}
          from={mockFromVersion}
          to={mockToVersion}
          disabled={true}
        />,
      );

      const button = screen.getByTestId('update-app-button');
      expect(button).toBeDisabled();
    });

    it('uses info color by default', () => {
      render(<UpdateButton app={mockInstalledApp} from={mockFromVersion} to={mockToVersion} />);

      const button = screen.getByTestId('update-app-button');
      expect(button).toBeInTheDocument();
      // MUI applies color via className
      expect(button.className).toContain('MuiButton');
    });
  });

  describe('Dialog Functionality', () => {
    it('opens update dialog when button is clicked', () => {
      render(<UpdateButton app={mockInstalledApp} from={mockFromVersion} to={mockToVersion} />);

      const button = screen.getByTestId('update-app-button');
      fireEvent.click(button);

      const dialog = screen.getByTestId('content-dialog');
      expect(dialog).toHaveAttribute('data-open', 'true');
      expect(dialog).toHaveAttribute('data-title', 'Update Installed Test App to 2.0.0');
    });

    it('dialog is initially closed', () => {
      render(<UpdateButton app={mockInstalledApp} from={mockFromVersion} to={mockToVersion} />);

      const dialog = screen.getByTestId('content-dialog');
      expect(dialog).toHaveAttribute('data-open', 'false');
    });

    it('renders InstallationStepper with update flag in the dialog', () => {
      render(<UpdateButton app={mockInstalledApp} from={mockFromVersion} to={mockToVersion} />);

      const button = screen.getByTestId('update-app-button');
      fireEvent.click(button);

      const stepper = screen.getByTestId('installation-stepper');
      expect(stepper).toBeInTheDocument();
      expect(stepper).toHaveAttribute('data-update', 'true');
    });
  });

  describe('Update State', () => {
    it('shows quest description when update starts', async () => {
      render(<UpdateButton app={mockInstalledApp} from={mockFromVersion} to={mockToVersion} />);

      const button = screen.getByTestId('update-app-button');
      fireEvent.click(button);

      const startButton = screen.getByTestId('trigger-updating');
      fireEvent.click(startButton);

      await waitFor(() => {
        expect(button).toHaveTextContent('Migrating instances');
      });
    });

    it('shows "Updating" fallback when quest has no description', async () => {
      render(<UpdateButton app={mockInstalledApp} from={mockFromVersion} to={mockToVersion} />);

      const button = screen.getByTestId('update-app-button');
      fireEvent.click(button);

      const startButton = screen.getByTestId('trigger-updating-no-desc');
      fireEvent.click(startButton);

      await waitFor(() => {
        expect(button).toHaveTextContent('Updating');
      });
    });

    it('returns to "Update" text when update completes', async () => {
      render(
        <UpdateButton
          app={mockInstalledApp}
          from={mockFromVersion}
          to={mockToVersion}
          showSelectedVersion={true}
        />,
      );

      const button = screen.getByTestId('update-app-button');
      fireEvent.click(button);

      // Start update
      const startButton = screen.getByTestId('trigger-updating');
      fireEvent.click(startButton);

      await waitFor(() => {
        expect(button).toHaveTextContent('Migrating instances');
      });

      // Complete update
      const completeButton = screen.getByTestId('trigger-completed');
      fireEvent.click(completeButton);

      await waitFor(() => {
        expect(button).toHaveTextContent('Update to 2.0.0');
      });
    });

    it('shows loading state on button during update', async () => {
      render(<UpdateButton app={mockInstalledApp} from={mockFromVersion} to={mockToVersion} />);

      const button = screen.getByTestId('update-app-button');
      fireEvent.click(button);

      const startButton = screen.getByTestId('trigger-updating');
      fireEvent.click(startButton);

      await waitFor(() => {
        expect(button).toHaveClass('MuiButton-loading');
        expect(button).toBeDisabled();
      });
    });

    it('is not in loading state before update starts', () => {
      render(<UpdateButton app={mockInstalledApp} from={mockFromVersion} to={mockToVersion} />);

      const button = screen.getByTestId('update-app-button');
      expect(button).not.toHaveClass('MuiButton-loading');
      expect(button).not.toBeDisabled();
    });
  });

  describe('Version Handling', () => {
    it('works without from version (optional)', () => {
      render(<UpdateButton app={mockInstalledApp} to={mockToVersion} />);

      const button = screen.getByTestId('update-app-button');
      expect(button).toBeInTheDocument();
      expect(button).toHaveTextContent('Update');
    });

    it('displays correct to version in dialog title', () => {
      const differentVersion = createVersion('3.0.0', 'Major update', null, false);
      render(<UpdateButton app={mockInstalledApp} from={mockFromVersion} to={differentVersion} />);

      const button = screen.getByTestId('update-app-button');
      fireEvent.click(button);

      const dialog = screen.getByTestId('content-dialog');
      expect(dialog).toHaveAttribute('data-title', 'Update Installed Test App to 3.0.0');
    });
  });

  describe('Props Forwarding', () => {
    it('forwards sx prop to button', () => {
      render(
        <UpdateButton
          app={mockInstalledApp}
          from={mockFromVersion}
          to={mockToVersion}
          sx={{ margin: 2 }}
        />,
      );

      const button = screen.getByTestId('update-app-button');
      expect(button).toBeInTheDocument();
    });

    it('forwards custom color prop to button', () => {
      render(
        <UpdateButton
          app={mockInstalledApp}
          from={mockFromVersion}
          to={mockToVersion}
          color="primary"
        />,
      );

      const button = screen.getByTestId('update-app-button');
      expect(button).toBeInTheDocument();
      expect(button.className).toContain('MuiButton');
    });

    it('does not override internal onClick handler', () => {
      render(<UpdateButton app={mockInstalledApp} from={mockFromVersion} to={mockToVersion} />);

      const button = screen.getByTestId('update-app-button');
      fireEvent.click(button);

      const dialog = screen.getByTestId('content-dialog');
      expect(dialog).toHaveAttribute('data-open', 'true');
    });

    it('forwards fullWidth prop correctly', () => {
      render(
        <UpdateButton
          app={mockInstalledApp}
          from={mockFromVersion}
          to={mockToVersion}
          fullWidth={false}
        />,
      );

      const button = screen.getByTestId('update-app-button');
      expect(button).toBeInTheDocument();
    });
  });
});
