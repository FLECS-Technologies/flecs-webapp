/**
 * Installed Apps — integration test.
 */
import { describe, it, expect, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { renderWithProviders } from '@test/test-utils';

vi.mock('@features/auth/AuthProvider', () => ({
  useOAuth4WebApiAuth: () => ({
    isAuthenticated: true,
    isLoading: false,
    user: { sub: 'test', access_token: 'test-token' },
    signIn: vi.fn(),
    signOut: vi.fn(),
    isConfigReady: true,
    handleOAuthCallback: vi.fn(),
    clearError: vi.fn(),
    refreshAuthState: vi.fn(),
    error: null,
  }),
}));

import InstalledApps from './InstalledApps';
import { fireEvent } from '@testing-library/react';

describe('Installed Apps', () => {
  it('renders installed apps heading', async () => {
    renderWithProviders(<InstalledApps />, { route: '/' });
    await waitFor(() => {
      expect(screen.getByText(/installed apps/i)).toBeTruthy();
    });
  });

  it('starts the sideload stepper when a manifest is dropped on the deploy card', async () => {
    renderWithProviders(<InstalledApps />, { route: '/' });
    const card = await screen.findByTestId('sideload-dropzone');

    const manifest = new File(['{"app":"tech.flecs.test","version":"1.0.0"}'], 'manifest.json', {
      type: 'application/json',
    });
    fireEvent.drop(card, { dataTransfer: { files: [manifest] } });

    await waitFor(() => {
      expect(screen.getByText('Installing Sideloaded App')).toBeInTheDocument();
    });
  });

  it('does not start the stepper for a non-json drop', async () => {
    renderWithProviders(<InstalledApps />, { route: '/' });
    const card = await screen.findByTestId('sideload-dropzone');

    const png = new File(['x'], 'image.png', { type: 'image/png' });
    fireEvent.drop(card, { dataTransfer: { files: [png] } });

    await waitFor(() => {
      expect(screen.queryByText('Installing Sideloaded App')).not.toBeInTheDocument();
    });
  });
});
