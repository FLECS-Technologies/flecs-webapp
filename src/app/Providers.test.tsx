/**
 * AppGate — render-order regression tests.
 * Auth state comes synchronously from localStorage; the auth-config fetch
 * (isLoading) must never block an already-authenticated render, otherwise a
 * spinner flashes on every reload and after the OAuth redirect.
 */
import { beforeEach, describe, it, expect, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { renderWithProviders } from '@test/test-utils';

const authState = {
  isAuthenticated: false,
  isLoading: false,
  user: null,
  signIn: vi.fn().mockResolvedValue(undefined),
  signOut: vi.fn(),
  isConfigReady: false,
  isCoreProviderReady: false,
  isDefaultProviderReady: false,
  authProviderId: null as string | null,
  handleOAuthCallback: vi.fn(),
  clearError: vi.fn(),
  refreshAuthState: vi.fn(),
  error: null,
};

const initialAuthState = { ...authState };

vi.mock('@features/auth/AuthProvider', () => ({
  OAuth4WebApiAuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useOAuth4WebApiAuth: () => authState,
}));

const firstTimeSetupMutate = vi.fn();
const selectCoreProviderMutate = vi.fn();
const selectDefaultProviderMutate = vi.fn();

vi.mock('@generated/core/experimental/experimental', () => ({
  usePostProvidersAuthFirstTimeSetupFlecsport: () => ({ mutate: firstTimeSetupMutate }),
  usePutProvidersAuthCore: () => ({ mutate: selectCoreProviderMutate }),
  usePutProvidersAuthDefault: () => ({ mutate: selectDefaultProviderMutate }),
}));

import Providers from './Providers';

describe('AppGate', () => {
  beforeEach(() => {
    Object.assign(authState, initialAuthState);
    window.location.hash = '';
    authState.signIn.mockClear();
    firstTimeSetupMutate.mockClear();
    selectCoreProviderMutate.mockClear();
    selectDefaultProviderMutate.mockClear();
  });

  it('renders children immediately when authenticated, even while auth config loads', () => {
    Object.assign(authState, {
      isAuthenticated: true,
      isLoading: true,
      isConfigReady: true,
      isCoreProviderReady: true,
      isDefaultProviderReady: true,
    });
    renderWithProviders(<Providers>app-content</Providers>);
    expect(screen.getByText('app-content')).toBeTruthy();
  });

  it('shows spinner while auth config loads when not authenticated', () => {
    Object.assign(authState, {
      isAuthenticated: false,
      isLoading: true,
      isConfigReady: false,
      isCoreProviderReady: false,
    });
    const { container } = renderWithProviders(<Providers>app-content</Providers>);
    expect(screen.queryByText('app-content')).toBeNull();
    expect(container.querySelector('.animate-spin')).toBeTruthy();
  });

  it('starts OAuth only after Core has configured the provider', async () => {
    Object.assign(authState, {
      isAuthenticated: false,
      isLoading: false,
      isConfigReady: true,
      isCoreProviderReady: true,
      isDefaultProviderReady: true,
      authProviderId: '000fe4ce',
    });
    renderWithProviders(<Providers>app-content</Providers>);
    expect(screen.queryByText('app-content')).toBeNull();
    await waitFor(() => expect(authState.signIn).toHaveBeenCalledTimes(1));
  });

  it('does not start OAuth more than once for the same render lifecycle', async () => {
    Object.assign(authState, {
      isAuthenticated: false,
      isLoading: false,
      isConfigReady: true,
      isCoreProviderReady: true,
      isDefaultProviderReady: false,
      authProviderId: '000fe4ce',
    });
    const { rerender } = renderWithProviders(<Providers>app-content</Providers>);
    await waitFor(() => expect(authState.signIn).toHaveBeenCalledTimes(1));
    rerender(<Providers>app-content</Providers>);
    await waitFor(() => expect(authState.signIn).toHaveBeenCalledTimes(1));
  });

  it('triggers core first-time setup when no auth provider is discovered yet', async () => {
    Object.assign(authState, {
      isAuthenticated: false,
      isLoading: false,
      isConfigReady: false,
      isCoreProviderReady: false,
      isDefaultProviderReady: false,
      authProviderId: null,
    });
    renderWithProviders(<Providers>app-content</Providers>);
    await waitFor(() => expect(firstTimeSetupMutate).toHaveBeenCalledTimes(1));
    expect(selectCoreProviderMutate).not.toHaveBeenCalled();
    expect(authState.signIn).not.toHaveBeenCalled();
  });

  it('selects the discovered auth provider before starting OAuth', async () => {
    Object.assign(authState, {
      isAuthenticated: false,
      isLoading: false,
      isConfigReady: true,
      isCoreProviderReady: false,
      isDefaultProviderReady: false,
      authProviderId: '000fe4ce',
    });
    renderWithProviders(<Providers>app-content</Providers>);
    await waitFor(() =>
      expect(selectCoreProviderMutate).toHaveBeenCalledWith({
        data: { provider: '000fe4ce' },
      }),
    );
    expect(firstTimeSetupMutate).not.toHaveBeenCalled();
    expect(authState.signIn).not.toHaveBeenCalled();
  });

  it('does not mutate provider state on the OAuth callback route', () => {
    window.location.hash = '#/oauth/callback?code=oauth-code';
    Object.assign(authState, {
      isAuthenticated: false,
      isLoading: false,
      isConfigReady: true,
      isCoreProviderReady: false,
      isDefaultProviderReady: false,
      authProviderId: '000fe4ce',
    });
    renderWithProviders(<Providers>app-content</Providers>);
    expect(screen.getByText('app-content')).toBeTruthy();
    expect(firstTimeSetupMutate).not.toHaveBeenCalled();
    expect(selectCoreProviderMutate).not.toHaveBeenCalled();
    expect(selectDefaultProviderMutate).not.toHaveBeenCalled();
    expect(authState.signIn).not.toHaveBeenCalled();
  });

  it('sets the default provider after authentication when Core has not set one', async () => {
    Object.assign(authState, {
      isAuthenticated: true,
      isLoading: false,
      isConfigReady: true,
      isCoreProviderReady: true,
      isDefaultProviderReady: false,
      authProviderId: '000fe4ce',
    });
    renderWithProviders(<Providers>app-content</Providers>);
    expect(screen.getByText('app-content')).toBeTruthy();
    await waitFor(() =>
      expect(selectDefaultProviderMutate).toHaveBeenCalledWith({
        data: { provider_id: '000fe4ce' },
      }),
    );
    expect(firstTimeSetupMutate).not.toHaveBeenCalled();
    expect(selectCoreProviderMutate).not.toHaveBeenCalled();
    expect(authState.signIn).not.toHaveBeenCalled();
  });
});
