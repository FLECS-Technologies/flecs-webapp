/**
 * OAuth callback — must NOT show a separate "Completing sign in" gear screen.
 * It renders the same skeleton the app lands on, so sign-in reads as one
 * continuous loading state (skeleton → data) with nothing flashing in between.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { renderWithProviders } from '@test/test-utils';

const authState = {
  isAuthenticated: false,
  isLoading: false,
  user: null,
  signIn: vi.fn(),
  signOut: vi.fn(),
  isConfigReady: true,
  handleOAuthCallback: vi.fn().mockResolvedValue(undefined),
  clearError: vi.fn(),
  refreshAuthState: vi.fn(),
  error: null,
};

vi.mock('@features/auth/AuthProvider', () => ({
  useOAuth4WebApiAuth: () => authState,
}));

const { navigate, toastError } = vi.hoisted(() => ({ navigate: vi.fn(), toastError: vi.fn() }));
vi.mock('react-router-dom', async (importOriginal) => ({
  ...(await importOriginal<typeof import('react-router-dom')>()),
  useNavigate: () => navigate,
}));
vi.mock('sonner', () => ({ toast: { error: toastError } }));

import OAuthCallback from './OAuthCallback';

describe('OAuthCallback', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authState.handleOAuthCallback.mockResolvedValue(undefined);
  });

  it('renders the app skeleton, not a separate "completing sign in" gear screen', () => {
    const { container } = renderWithProviders(<OAuthCallback />, { route: '/oauth/callback' });

    expect(screen.queryByText(/completing sign in/i)).toBeNull();
    expect(container.querySelector('.animate-pulse')).toBeTruthy();
  });

  it('drops back to login with a toast when the token exchange fails', async () => {
    authState.handleOAuthCallback.mockRejectedValueOnce(new Error('bad code'));
    renderWithProviders(<OAuthCallback />, { route: '/oauth/callback' });

    await waitFor(() => expect(navigate).toHaveBeenCalledWith('/', { replace: true }));
    expect(toastError).toHaveBeenCalledWith('bad code');
  });
});
