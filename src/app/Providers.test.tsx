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
  fenceBaseURL: null as string | null,
  handleOAuthCallback: vi.fn(),
  clearError: vi.fn(),
  refreshAuthState: vi.fn(),
  error: null,
};

const initialAuthState = { ...authState };

// Mutable holder so individual tests can simulate a returning ?code= / ?error=.
const oauthResponseParams = { current: new URLSearchParams() };

vi.mock('@features/auth/AuthProvider', () => ({
  OAuth4WebApiAuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useOAuth4WebApiAuth: () => authState,
  getOAuthCallbackParameters: () => oauthResponseParams.current,
}));

const firstTimeSetupMutate = vi.fn();
const selectCoreProviderMutate = vi.fn();
const selectDefaultProviderMutate = vi.fn();
const createSuperAdminMutateAsync = vi.fn();
const adminQuery = {
  data: undefined as boolean | undefined,
  isLoading: false,
  error: null as Error | null,
  refetch: vi.fn(),
};

vi.mock('@features/auth/fence-api', () => ({
  useSuperAdminExists: () => adminQuery,
  useCreateSuperAdmin: () => ({
    mutateAsync: createSuperAdminMutateAsync,
    isPending: false,
    error: null,
  }),
}));

vi.mock('@generated/core/experimental/experimental', () => ({
  usePostProvidersAuthFirstTimeSetupFlecsport: () => ({ mutate: firstTimeSetupMutate }),
  usePutProvidersAuthCore: () => ({ mutate: selectCoreProviderMutate }),
  usePutProvidersAuthDefault: () => ({ mutate: selectDefaultProviderMutate }),
}));

// BootScreen renders the brand <Logo>, which calls useDarkMode() and so needs a
// ThemeHandler ancestor. These tests exercise AppGate's bootstrap logic, not the
// logo, so stub it out (same approach as BootScreen.test.tsx).
vi.mock('@app/layout/Logo', () => ({
  default: () => <span data-testid="logo" />,
}));

import Providers from './Providers';

describe('AppGate', () => {
  beforeEach(() => {
    Object.assign(authState, initialAuthState);
    window.location.hash = '';
    oauthResponseParams.current = new URLSearchParams();
    authState.handleOAuthCallback = vi.fn().mockResolvedValue(undefined);
    authState.signIn.mockClear();
    firstTimeSetupMutate.mockClear();
    selectCoreProviderMutate.mockClear();
    selectDefaultProviderMutate.mockClear();
    createSuperAdminMutateAsync.mockClear();
    Object.assign(adminQuery, {
      data: undefined,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    });
  });

  it('renders children immediately when authenticated, even while auth config loads', () => {
    Object.assign(authState, {
      isAuthenticated: true,
      isLoading: true,
      isConfigReady: true,
      isCoreProviderReady: true,
      isDefaultProviderReady: true,
      authProviderId: '000fe4ce',
      fenceBaseURL: 'https://fence',
    });
    Object.assign(adminQuery, { data: true, isLoading: false });
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
      fenceBaseURL: 'https://fence',
    });
    Object.assign(adminQuery, { data: true, isLoading: false });
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
      fenceBaseURL: 'https://fence',
    });
    Object.assign(adminQuery, { data: true, isLoading: false });
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
      fenceBaseURL: null,
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
      fenceBaseURL: 'https://fence',
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
      fenceBaseURL: 'https://fence',
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
      fenceBaseURL: 'https://fence',
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

  it('exchanges an authorization code that returns to the app root (no #/oauth/callback)', async () => {
    // The provider drops the redirect_uri fragment, so the code lands at /?code=...#/
    // rather than on the dedicated callback route. AppGate must still complete sign-in.
    oauthResponseParams.current = new URLSearchParams('code=root-code');
    authState.handleOAuthCallback = vi.fn().mockReturnValue(new Promise(() => {}));
    Object.assign(authState, {
      isAuthenticated: false,
      isLoading: false,
      isConfigReady: true,
      isCoreProviderReady: true,
      isDefaultProviderReady: true,
      authProviderId: '000fe4ce',
      fenceBaseURL: 'https://fence',
    });
    Object.assign(adminQuery, { data: true, isLoading: false });
    renderWithProviders(<Providers>app-content</Providers>);

    await waitFor(() => expect(authState.handleOAuthCallback).toHaveBeenCalledTimes(1));
    // Must not render the app (would fire token-less 403s) and must not re-trigger sign-in.
    expect(screen.queryByText('app-content')).toBeNull();
    expect(authState.signIn).not.toHaveBeenCalled();
  });

  it('shows create-account form on first boot when Fence has no admin', () => {
    Object.assign(authState, {
      isAuthenticated: false,
      isLoading: false,
      isConfigReady: true,
      isCoreProviderReady: true,
      isDefaultProviderReady: false,
      authProviderId: '000fe4ce',
      fenceBaseURL: 'https://fence',
    });
    Object.assign(adminQuery, { data: false, isLoading: false });
    renderWithProviders(<Providers>app-content</Providers>);
    expect(screen.queryByText('app-content')).toBeNull();
    expect(screen.getByText('Create your account')).toBeTruthy();
    expect(authState.signIn).not.toHaveBeenCalled();
  });
});
