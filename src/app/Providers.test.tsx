/**
 * AuthGate — render-order regression tests.
 * Auth state comes synchronously from localStorage; the auth-config fetch
 * (isLoading) must never block an already-authenticated render, otherwise a
 * spinner flashes on every reload and after the OAuth redirect.
 */
import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '@test/test-utils';

const authState = {
  isAuthenticated: false,
  isLoading: false,
  user: null,
  signIn: vi.fn(),
  signOut: vi.fn(),
  isConfigReady: true,
  handleOAuthCallback: vi.fn(),
  clearError: vi.fn(),
  refreshAuthState: vi.fn(),
  error: null,
};

vi.mock('@features/auth/AuthProvider', () => ({
  OAuth4WebApiAuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useOAuth4WebApiAuth: () => authState,
}));

import Providers from './Providers';

describe('AuthGate', () => {
  it('renders children immediately when authenticated, even while auth config loads', () => {
    Object.assign(authState, { isAuthenticated: true, isLoading: true });
    renderWithProviders(<Providers>app-content</Providers>);
    expect(screen.getByText('app-content')).toBeTruthy();
  });

  it('shows the spinner while config loads when not authenticated', () => {
    Object.assign(authState, { isAuthenticated: false, isLoading: true });
    const { container } = renderWithProviders(<Providers>app-content</Providers>);
    expect(screen.queryByText('app-content')).toBeNull();
    expect(container.querySelector('.animate-spin')).toBeTruthy();
  });

  it('shows the device login when not authenticated and config loaded', () => {
    Object.assign(authState, { isAuthenticated: false, isLoading: false });
    renderWithProviders(<Providers>app-content</Providers>);
    expect(screen.queryByText('app-content')).toBeNull();
    expect(screen.getByText('Welcome')).toBeTruthy();
  });
});
