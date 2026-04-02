/**
 * OAuth provider — token in localStorage (persists across tabs).
 * Code verifier in sessionStorage (one-time use, dies with tab = secure).
 */
import React, { createContext, useContext, useCallback, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import * as oauth from 'oauth4webapi';
import { getProvidersAuth } from '@generated/core/experimental/experimental';
import type { AuthProvidersAndDefaults, AuthProvider as AuthProviderType } from '@generated/core/schemas';
import { extractCoreProviderId } from '@features/onboarding/OnboardingGuard';
import { setAuthToken } from '@app/api/fetch-instance';

const KEYS = {
  ACCESS_TOKEN: 'flecs_access_token',
  USER: 'flecs_user',
  CODE_VERIFIER: 'flecs_code_verifier',
} as const;

interface User { sub: string; name?: string; email?: string; access_token?: string; }

interface AuthContextValue {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  error: Error | null;
  signIn: () => Promise<void>;
  signOut: () => void;
  isConfigReady: boolean;
  handleOAuthCallback: () => Promise<void>;
  clearError: () => void;
  refreshAuthState: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const useOAuth4WebApiAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useOAuth4WebApiAuth must be used within AuthProvider');
  return ctx;
};

function useAuthConfig() {
  return useQuery({
    queryKey: ['auth-config'],
    queryFn: async () => {
      const res = await getProvidersAuth();
      const data = res.data as AuthProvidersAndDefaults;
      const coreId = extractCoreProviderId(data);
      if (!coreId) return null;

      const provider: AuthProviderType = data.providers[coreId];
      const props = (provider.properties || {}) as Record<string, any>;

      return {
        authServer: {
          issuer: provider.issuer_url,
          authorization_endpoint: provider.kind === 'oauth' ? (provider as any).authorize_url : undefined,
          token_endpoint: provider.kind === 'oauth' ? (provider as any).token_url : undefined,
          jwks_uri: provider.kind === 'oauth' ? (provider as any).jwk_url : undefined,
          ...(props.userinfo_url && { userinfo_endpoint: props.userinfo_url }),
          ...(props.end_session_url && { end_session_endpoint: props.end_session_url }),
          code_challenge_methods_supported: ['S256'],
        } as oauth.AuthorizationServer,
        client: { client_id: props.client_id || 'flecs' } as oauth.Client,
        redirectUri: props.redirect_uri || `${window.location.origin}${window.location.pathname}#/oauth/callback`,
        scope: props.scope || (provider.kind === 'oauth' ? 'api:read' : 'openid email'),
        props,
      };
    },
    staleTime: 5 * 60_000,
    retry: 2,
  });
}

export function OAuth4WebApiAuthProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const { data: config, isLoading: configLoading, error: configError } = useAuthConfig();

  // Restore from localStorage — persists across tabs
  const storedUser = useMemo((): User | null => {
    try {
      const token = localStorage.getItem(KEYS.ACCESS_TOKEN);
      const userStr = localStorage.getItem(KEYS.USER);
      if (token && userStr) return { ...JSON.parse(userStr), access_token: token };
      if (token) return { sub: 'user', access_token: token };
    } catch {}
    return null;
  }, []);

  const isAuthenticated = !!storedUser?.access_token;

  // Set token synchronously — before any TanStack queries fire
  // useEffect runs AFTER render, which is too late for initial queries
  if (storedUser?.access_token) setAuthToken(storedUser.access_token);

  const signIn = useCallback(async () => {
    if (!config) throw new Error('Auth not configured');
    const codeVerifier = oauth.generateRandomCodeVerifier();
    const codeChallenge = await oauth.calculatePKCECodeChallenge(codeVerifier);
    sessionStorage.setItem(KEYS.CODE_VERIFIER, codeVerifier); // sessionStorage = secure, dies with tab

    const url = new URL(config.authServer.authorization_endpoint!);
    url.searchParams.set('client_id', config.client.client_id);
    url.searchParams.set('redirect_uri', config.redirectUri);
    url.searchParams.set('response_type', 'code');
    url.searchParams.set('scope', config.scope);
    url.searchParams.set('code_challenge', codeChallenge);
    url.searchParams.set('code_challenge_method', 'S256');
    window.location.href = url.href;
  }, [config]);

  const handleOAuthCallback = useCallback(async () => {
    if (!config) throw new Error('Auth not configured');
    const code = new URLSearchParams(window.location.search).get('code');
    const codeVerifier = sessionStorage.getItem(KEYS.CODE_VERIFIER);
    if (!code || !codeVerifier) throw new Error('Missing code or verifier');

    const tokenPath = new URL(config.authServer.token_endpoint!).pathname;
    const res = await fetch(tokenPath, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: config.redirectUri,
        client_id: config.client.client_id,
        code_verifier: codeVerifier,
      }),
    });
    const result = await res.json();

    if (result.access_token) {
      localStorage.setItem(KEYS.ACCESS_TOKEN, result.access_token);
      localStorage.setItem(KEYS.USER, JSON.stringify({ sub: result.sub || 'user', access_token: result.access_token }));
      setAuthToken(result.access_token);
    }

    sessionStorage.removeItem(KEYS.CODE_VERIFIER);
    window.location.href = window.location.origin + window.location.pathname;
  }, [config]);

  const signOut = useCallback(() => {
    localStorage.removeItem(KEYS.ACCESS_TOKEN);
    localStorage.removeItem(KEYS.USER);
    setAuthToken(undefined);
    queryClient.clear();
    window.location.href = config?.authServer.end_session_endpoint || window.location.origin;
  }, [config, queryClient]);

  const value: AuthContextValue = {
    isAuthenticated, isLoading: configLoading, user: storedUser, error: configError as Error | null,
    signIn, signOut, handleOAuthCallback, isConfigReady: !!config,
    clearError: () => {}, refreshAuthState: async () => {},
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default OAuth4WebApiAuthProvider;
