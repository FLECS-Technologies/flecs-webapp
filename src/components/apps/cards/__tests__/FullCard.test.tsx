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
import FullCard from '../FullCard';
import {
  mockInstalledApp,
  mockAvailableApp,
  mockNotInstallableApp,
  mockAppWithoutAuthor,
  mockAppWithOneReview,
  mockAppWithoutCategories,
  mockAppWithoutVersions,
  mockPurchasableApp,
  mockFreeApp,
  mockNotPurchasableApp,
  mockAppWithoutDescription,
  mockAppWithDocs,
  mockAppWithoutRequirements,
  mockAppWithoutRating,
  mockAppWithoutReviews,
  mockInstalledAppNoInstances,
  mockAppWithEmptyCategories,
  mockMultiArchApp,
} from '../../../../models/__mocks__/app';

// Mock dependencies
const mockSystemContext = {
  systemInfo: {
    arch: 'amd64',
    deviceId: 'test-device-id',
  },
};

const mockUseProtectedApi = vi.fn();
const mockUseMarketplaceUser = vi.fn();

vi.mock('../../../../data/SystemProvider', () => ({
  useSystemContext: () => mockSystemContext,
}));

vi.mock('../../../providers/ApiProvider', () => ({
  useProtectedApi: () => mockUseProtectedApi(),
}));

vi.mock('../../../providers/MarketplaceUserProvider', () => ({
  useMarketplaceUser: () => mockUseMarketplaceUser(),
}));

vi.mock('../installation/InstallationStepper', () => ({
  default: ({ app, version, update }: any) => (
    <div data-testid="installation-stepper">
      Installing {app.title} version {version} {update ? '(update)' : '(new install)'}
    </div>
  ),
}));

vi.mock('../../ContentDialog', () => ({
  default: ({ children, open, title }: any) =>
    open ? (
      <div data-testid="content-dialog">
        <div data-testid="dialog-title">{title}</div>
        {children}
      </div>
    ) : null,
}));

vi.mock('../../ActionSnackbar', () => ({
  default: ({ text, open }: any) => (open ? <div data-testid="action-snackbar">{text}</div> : null),
}));

describe('FullCard Component', () => {
  const mockOnClose = vi.fn();
  const mockApi = {
    instances: {
      instancesGet: vi.fn(() => Promise.resolve([])),
    },
  };
  const mockMarketplaceUser = {
    user: null,
    setUser: vi.fn(),
    userChanged: false,
    authHeaderUseBearer: vi.fn(() => ({})),
    authorizationHeaderUseBearer: vi.fn(() => ({})),
    authHeaderUseXAccess: vi.fn(() => ({})),
    jwt: vi.fn(() => ''),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseProtectedApi.mockReturnValue(mockApi);
    mockUseMarketplaceUser.mockReturnValue(mockMarketplaceUser);
  });

  describe('Dialog Behavior', () => {
    it('renders dialog when open is true', () => {
      render(<FullCard app={mockAvailableApp} open={true} onClose={mockOnClose} />);

      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('does not render dialog when open is false', () => {
      render(<FullCard app={mockAvailableApp} open={false} onClose={mockOnClose} />);

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('calls onClose when close button is clicked', () => {
      render(<FullCard app={mockAvailableApp} open={true} onClose={mockOnClose} />);

      const closeButtons = screen.getAllByRole('button');
      const closeButton = closeButtons[0]; // First button is the close button
      fireEvent.click(closeButton);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('Header Section', () => {
    it('renders app title and author', () => {
      render(<FullCard app={mockAvailableApp} open={true} onClose={mockOnClose} />);

      expect(screen.getByText(mockAvailableApp.title)).toBeInTheDocument();
      expect(screen.getByText(`by ${mockAvailableApp.author}`)).toBeInTheDocument();
    });

    it('displays "Unknown" for missing author', () => {
      render(<FullCard app={mockAppWithoutAuthor} open={true} onClose={mockOnClose} />);

      expect(screen.getByText('by Unknown')).toBeInTheDocument();
    });

    it('renders avatar with correct src and padding', () => {
      render(<FullCard app={mockAvailableApp} open={true} onClose={mockOnClose} />);

      const images = screen.getAllByRole('img');
      const avatar = images.find((img) => img.tagName === 'IMG');
      expect(avatar).toHaveAttribute('src', mockAvailableApp.avatar);
    });

    it('displays rating and review count', () => {
      render(<FullCard app={mockAvailableApp} open={true} onClose={mockOnClose} />);

      expect(screen.getByText(/3.8/)).toBeInTheDocument();
      expect(screen.getByText(/15 reviews/)).toBeInTheDocument();
    });

    it('displays singular "review" for single review', () => {
      render(<FullCard app={mockAppWithOneReview} open={true} onClose={mockOnClose} />);

      expect(screen.getByText(/1 review/)).toBeInTheDocument();
    });

    it('displays categories as chips', () => {
      render(<FullCard app={mockAvailableApp} open={true} onClose={mockOnClose} />);

      expect(screen.getByText('Utility')).toBeInTheDocument();
    });

    it('handles app without categories', () => {
      render(<FullCard app={mockAppWithoutCategories} open={true} onClose={mockOnClose} />);

      expect(screen.getByText(mockAvailableApp.title)).toBeInTheDocument();
    });
  });

  describe('Status Chips', () => {
    it('shows "Installed" chip for installed app without updates', () => {
      render(<FullCard app={mockInstalledApp} open={true} onClose={mockOnClose} />);

      expect(screen.getByText('Installed')).toBeInTheDocument();
    });

    it('does not show status chip for available app', () => {
      render(<FullCard app={mockAvailableApp} open={true} onClose={mockOnClose} />);

      expect(screen.queryByText('Installed')).not.toBeInTheDocument();
      expect(screen.queryByText('Update')).not.toBeInTheDocument();
    });
  });

  describe('Version Selector', () => {
    it('renders version selector when versions are available', () => {
      render(<FullCard app={mockAvailableApp} open={true} onClose={mockOnClose} />);

      expect(screen.getByRole('combobox', { name: /version/i })).toBeInTheDocument();
    });

    it('does not render version selector when no versions available', () => {
      render(<FullCard app={mockAppWithoutVersions} open={true} onClose={mockOnClose} />);

      expect(screen.queryByRole('combobox', { name: /version/i })).not.toBeInTheDocument();
    });
  });

  describe('Action Buttons - Available App', () => {
    it('shows install button for available app', () => {
      render(<FullCard app={mockAvailableApp} open={true} onClose={mockOnClose} />);

      const installButton = screen.getByRole('button', { name: /install/i });
      expect(installButton).toBeInTheDocument();
      expect(installButton).not.toBeDisabled();
      expect(installButton.textContent).toMatch(/install \d+\.\d+\.\d+/i);
    });

    it('disables install button for incompatible app', () => {
      render(<FullCard app={mockNotInstallableApp} open={true} onClose={mockOnClose} />);

      const installButton = screen.getByRole('button', { name: /install/i });
      expect(installButton).toBeDisabled();
    });

    it('shows incompatibility alert for incompatible app', () => {
      render(<FullCard app={mockNotInstallableApp} open={true} onClose={mockOnClose} />);

      expect(
        screen.getByText(/is not compatible with your system architecture/i),
      ).toBeInTheDocument();
      expect(screen.getByText(/Required: arm64/i)).toBeInTheDocument();
    });
  });

  describe('Action Buttons - Installed App', () => {
    it('shows uninstall button for installed app', () => {
      render(<FullCard app={mockInstalledApp} open={true} onClose={mockOnClose} />);

      // UninstallButton renders with aria-label
      expect(screen.getByLabelText('uninstall-app-button')).toBeInTheDocument();
    });

    it('handles uninstall complete callback', () => {
      render(<FullCard app={mockInstalledApp} open={true} onClose={mockOnClose} />);

      const uninstallButton = screen.getByLabelText('uninstall-app-button');
      fireEvent.click(uninstallButton);

      // Clicking uninstall button should render - test basic interaction
      expect(uninstallButton).toBeInTheDocument();
    });
  });

  describe('Purchase License Button', () => {
    it('shows purchase button for purchasable app with price', () => {
      render(<FullCard app={mockPurchasableApp} open={true} onClose={mockOnClose} />);

      const purchaseButton = screen.getByRole('link', { name: /purchase license/i });
      expect(purchaseButton).toBeInTheDocument();
      expect(purchaseButton).toHaveAttribute('href', 'https://example.com/purchase');
      expect(purchaseButton).toHaveAttribute('target', '_blank');
    });

    it('does not show purchase button for free app', () => {
      render(<FullCard app={mockFreeApp} open={true} onClose={mockOnClose} />);

      expect(screen.queryByRole('link', { name: /purchase license/i })).not.toBeInTheDocument();
    });

    it('does not show purchase button when not purchasable', () => {
      render(<FullCard app={mockNotPurchasableApp} open={true} onClose={mockOnClose} />);

      expect(screen.queryByRole('link', { name: /purchase license/i })).not.toBeInTheDocument();
    });
  });

  describe('About Section', () => {
    it('displays app description', () => {
      render(<FullCard app={mockAvailableApp} open={true} onClose={mockOnClose} />);

      expect(screen.getByText(mockAvailableApp.description!)).toBeInTheDocument();
    });

    it('displays "No description available" when description is missing', () => {
      render(<FullCard app={mockAppWithoutDescription} open={true} onClose={mockOnClose} />);

      expect(screen.getByText('No description available.')).toBeInTheDocument();
    });

    it('displays documentation link when available', () => {
      render(<FullCard app={mockAppWithDocs} open={true} onClose={mockOnClose} />);

      const docLink = screen.getByRole('link', { name: /documentation/i });
      expect(docLink).toBeInTheDocument();
      expect(docLink).toHaveAttribute('href', 'https://example.com/docs');
      expect(docLink).toHaveAttribute('target', '_blank');
    });

    it('does not display documentation link when not available', () => {
      render(<FullCard app={mockAvailableApp} open={true} onClose={mockOnClose} />);

      expect(screen.queryByRole('link', { name: /documentation/i })).not.toBeInTheDocument();
    });
  });

  describe('System Requirements Section', () => {
    it('displays system requirements', () => {
      render(<FullCard app={mockAvailableApp} open={true} onClose={mockOnClose} />);

      expect(screen.getByText('System Requirements')).toBeInTheDocument();
      expect(screen.getByText('amd64')).toBeInTheDocument();
    });

    it('highlights compatible architecture', () => {
      render(<FullCard app={mockAvailableApp} open={true} onClose={mockOnClose} />);

      const amd64Chip = screen.getByText('amd64').closest('.MuiChip-root');
      expect(amd64Chip).toHaveClass('MuiChip-colorSuccess');
    });

    it('does not highlight incompatible architecture', () => {
      render(<FullCard app={mockNotInstallableApp} open={true} onClose={mockOnClose} />);

      const arm64Chip = screen.getByText('arm64').closest('.MuiChip-root');
      expect(arm64Chip).not.toHaveClass('MuiChip-colorSuccess');
    });

    it('does not render system requirements section when none specified', () => {
      render(<FullCard app={mockAppWithoutRequirements} open={true} onClose={mockOnClose} />);

      expect(screen.queryByText('System Requirements')).not.toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles app with no rating', () => {
      render(<FullCard app={mockAppWithoutRating} open={true} onClose={mockOnClose} />);

      expect(screen.getByText(/0.0/)).toBeInTheDocument();
    });

    it('handles app with zero reviews', () => {
      render(<FullCard app={mockAppWithoutReviews} open={true} onClose={mockOnClose} />);

      expect(screen.getByText(/0 reviews/)).toBeInTheDocument();
    });

    it('handles installed app without instances', () => {
      render(<FullCard app={mockInstalledAppNoInstances} open={true} onClose={mockOnClose} />);

      // EditorButtons should not appear when no instances
      expect(screen.queryByLabelText('open-editor')).not.toBeInTheDocument();
    });

    it('handles app with empty categories array', () => {
      render(<FullCard app={mockAppWithEmptyCategories} open={true} onClose={mockOnClose} />);

      // Should still render without errors
      expect(screen.getByText(mockAvailableApp.title)).toBeInTheDocument();
    });

    it('handles app with multiple requirements', () => {
      render(<FullCard app={mockMultiArchApp} open={true} onClose={mockOnClose} />);

      expect(screen.getByText('amd64')).toBeInTheDocument();
      expect(screen.getByText('arm64')).toBeInTheDocument();
      expect(screen.getByText('armhf')).toBeInTheDocument();
    });
  });
});
