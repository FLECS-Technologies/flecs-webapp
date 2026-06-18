/**
 * AppGate — render-order regression tests.
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
  signIn: vi.fn().mockResolvedValue(undefined),
  signOut: vi.fn(),
  isConfigReady: false,
  fenceBaseURL: null as string | null,
  handleOAuthCallback: vi.fn(),
  clearError: vi.fn(),
  refreshAuthState: vi.fn(),
  error: null,
};

vi.mock('@features/auth/AuthProvider', () => ({
  OAuth4WebApiAuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useOAuth4WebApiAuth: () => authState,
}));

const adminQuery = { data: undefined as boolean | undefined, isLoading: false };

vi.mock('@features/auth/fence-api', () => ({
  useSuperAdminExists: () => adminQuery,
  useCreateSuperAdmin: () => ({ mutateAsync: vi.fn(), isPending: false, error: null }),
}));

vi.mock('@generated/core/experimental/experimental', () => ({
  postProvidersAuthFirstTimeSetupFlecsport: vi.fn().mockResolvedValue({}),
}));

import Providers from './Providers';

describe('AppGate', () => {
  it('renders children immediately when authenticated, even while auth config loads', () => {
    Object.assign(authState, { isAuthenticated: true, isLoading: true, isConfigReady: true, fenceBaseURL: 'http://fence' });
    Object.assign(adminQuery, { data: true, isLoading: false });
    renderWithProviders(<Providers>app-content</Providers>);
    expect(screen.getByText('app-content')).toBeTruthy();
  });

  it('shows spinner while auth config loads when not authenticated', () => {
    Object.assign(authState, { isAuthenticated: false, isLoading: true, isConfigReady: false, fenceBaseURL: null });
    Object.assign(adminQuery, { data: undefined, isLoading: false });
    const { container } = renderWithProviders(<Providers>app-content</Providers>);
    expect(screen.queryByText('app-content')).toBeNull();
    expect(container.querySelector('.animate-spin')).toBeTruthy();
  });

  it('shows create-account form on first boot when no admin exists', () => {
    Object.assign(authState, { isAuthenticated: false, isLoading: false, isConfigReady: true, fenceBaseURL: 'http://fence' });
    Object.assign(adminQuery, { data: false, isLoading: false });
    renderWithProviders(<Providers>app-content</Providers>);
    expect(screen.queryByText('app-content')).toBeNull();
    expect(screen.getByText('Create your account')).toBeTruthy();
  });
});
