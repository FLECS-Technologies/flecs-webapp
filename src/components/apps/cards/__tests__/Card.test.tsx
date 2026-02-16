/*
 * Copyright (c) 2021 FLECS Technologies GmbH
 *
 * Created on Wed Jan 29 2025
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
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Card from '../Card';
import {
  mockInstalledApp,
  mockAvailableApp,
  mockUpdateAvailableApp,
  mockNotInstallableApp,
} from '../../../../models/__mocks__/app';

// Mock dependencies
const mockSystemContext = {
  systemInfo: {
    arch: 'amd64',
    deviceId: 'test-device-id',
  },
};

vi.mock('@contexts/data/SystemProvider', () => ({
  useSystemContext: () => mockSystemContext,
}));

vi.mock('../../ui/ContentDialog', () => ({
  default: ({ children, open, title }: any) =>
    open ? (
      <div data-testid="content-dialog">
        <div data-testid="dialog-title">{title}</div>
        {children}
      </div>
    ) : null,
}));

vi.mock('../installation/InstallationStepper', () => ({
  default: ({ app, version, update }: any) => (
    <div data-testid="installation-stepper">
      Installing {app.title} version {version} {update ? '(update)' : '(new install)'}
    </div>
  ),
}));

vi.mock('../../instances/tabs/editors/EditorButtons', () => ({
  EditorButtons: ({ instance }: any) => <button data-testid="editor-buttons">Open Editor</button>,
}));

vi.mock('../FullCard', () => ({
  default: ({ app, open, onClose }: any) =>
    open ? (
      <div data-testid="full-card">
        <div>Full Card for {app.title}</div>
        <button onClick={onClose} data-testid="close-full-card">
          Close
        </button>
      </div>
    ) : null,
}));

describe('Card Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders card with basic app information', () => {
      render(<Card {...mockAvailableApp} />);

      expect(screen.getByTestId('app-card')).toBeInTheDocument();
      expect(screen.getByText(mockAvailableApp.title)).toBeInTheDocument();
      expect(screen.getByText(`by ${mockAvailableApp.author}`)).toBeInTheDocument();
    });

    it('renders avatar with correct src', () => {
      render(<Card {...mockAvailableApp} />);

      const avatar = screen.getByRole('img');
      expect(avatar).toHaveAttribute('src', mockAvailableApp.avatar);
    });

    it('displays "MORE DETAILS" text', () => {
      render(<Card {...mockAvailableApp} />);

      expect(screen.getByText('MORE DETAILS')).toBeInTheDocument();
    });
  });

  describe('Status Chips', () => {
    it('shows "Installed" chip for installed app without updates', () => {
      render(<Card {...mockInstalledApp} />);

      expect(screen.getByText('Installed')).toBeInTheDocument();
    });

    it('shows "Not Installable" chip for incompatible app', () => {
      render(<Card {...mockNotInstallableApp} />);

      expect(screen.getByText('Not Installable')).toBeInTheDocument();
    });

    it('does not show status chip for available installable app', () => {
      render(<Card {...mockAvailableApp} />);

      expect(screen.queryByText('Installed')).not.toBeInTheDocument();
      expect(screen.queryByText('Update')).not.toBeInTheDocument();
      expect(screen.queryByText('Not Installable')).not.toBeInTheDocument();
    });
  });

  describe('Action Buttons', () => {
    it('shows install button for available app', () => {
      render(<Card {...mockAvailableApp} />);

      const installButton = screen.getByTestId('install-app-button');
      expect(installButton).toBeInTheDocument();
      expect(installButton).toHaveTextContent('Install');
      expect(installButton).not.toBeDisabled();
    });

    it('disables install button for not installable app', () => {
      render(<Card {...mockNotInstallableApp} />);

      const installButton = screen.getByTestId('install-app-button');
      expect(installButton).toBeDisabled();
    });

    it('shows editor buttons for installed app with instances', () => {
      render(<Card {...mockInstalledApp} />);

      // EditorButtons are rendered but the actual component uses aria-label
      const editorButton = screen.getByRole('button', { name: 'open-editor-button-0' });
      expect(editorButton).toBeInTheDocument();
      expect(screen.queryByTestId('install-app-button')).not.toBeInTheDocument();
    });

    it('shows update button when update is available', () => {
      render(<Card {...mockUpdateAvailableApp} />);

      const updateButton = screen.getByRole('button', { name: /update/i });
      expect(updateButton).toBeInTheDocument();
      expect(updateButton).not.toBeDisabled();
    });
  });

  describe('User Interactions', () => {
    it('opens full card when clicking on card action area', () => {
      render(<Card {...mockAvailableApp} />);

      // Click on the CardActionArea
      const cardActionArea = screen.getByRole('button', { name: /MORE DETAILS/i });
      fireEvent.click(cardActionArea);

      expect(screen.getByTestId('full-card')).toBeInTheDocument();
      expect(screen.getByText(`Full Card for ${mockAvailableApp.title}`)).toBeInTheDocument();
    });

    it('closes full card when close button is clicked', () => {
      render(<Card {...mockAvailableApp} />);

      // Open full card
      const cardActionArea = screen.getByRole('button', { name: /MORE DETAILS/i });
      fireEvent.click(cardActionArea);

      expect(screen.getByTestId('full-card')).toBeInTheDocument();

      // Close full card
      const closeButton = screen.getByTestId('close-full-card');
      fireEvent.click(closeButton);

      expect(screen.queryByTestId('full-card')).not.toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles app with no author', () => {
      const appWithoutAuthor = {
        ...mockAvailableApp,
        author: undefined,
      };
      render(<Card {...appWithoutAuthor} />);

      expect(screen.getByText('by')).toBeInTheDocument();
    });

    it('handles app with no versions', () => {
      const appWithoutVersions = {
        ...mockAvailableApp,
        versions: undefined,
      };
      render(<Card {...appWithoutVersions} />);

      expect(screen.getByTestId('app-card')).toBeInTheDocument();
    });

    it('handles app with no instances', () => {
      const installedAppNoInstances = {
        ...mockInstalledApp,
        instances: undefined,
      };
      render(<Card {...installedAppNoInstances} />);

      expect(screen.queryByTestId('editor-buttons')).not.toBeInTheDocument();
    });

    it('handles app with empty instances array', () => {
      const installedAppEmptyInstances = {
        ...mockInstalledApp,
        instances: [],
      };
      render(<Card {...installedAppEmptyInstances} />);

      expect(screen.queryByTestId('editor-buttons')).not.toBeInTheDocument();
    });
  });

  describe('System Compatibility', () => {
    it('marks app as installable when requirement matches system arch', () => {
      render(<Card {...mockAvailableApp} />);

      const installButton = screen.getByTestId('install-app-button');
      expect(installButton).not.toBeDisabled();
    });

    it('marks app as not installable when requirement does not match system arch', () => {
      render(<Card {...mockNotInstallableApp} />);

      const installButton = screen.getByTestId('install-app-button');
      expect(installButton).toBeDisabled();
      expect(screen.getByText('Not Installable')).toBeInTheDocument();
    });

    it('handles app with multiple compatible architectures', () => {
      const multiArchApp = {
        ...mockAvailableApp,
        requirement: ['amd64', 'arm64', 'x86_64'],
      };
      render(<Card {...multiArchApp} />);

      const installButton = screen.getByTestId('install-app-button');
      expect(installButton).not.toBeDisabled();
    });
  });
});
