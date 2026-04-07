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

describe('Installed Apps', () => {
  it('renders installed apps heading', async () => {
    renderWithProviders(<InstalledApps />, { route: '/' });
    await waitFor(() => {
      expect(screen.getByText(/installed apps/i)).toBeTruthy();
    });
  });
});
