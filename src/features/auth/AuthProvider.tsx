/**
 * OAuth PKCE flow; access_token persisted in localStorage.
 * XSS → token theft risk is mitigated by CSP + DOMPurify (not by storage choice).
 * flecs-core has no cookie-session path (see src/app/api/fetch-instance.ts).
 * Code verifier is in sessionStorage (one-time use, dies with tab).
 */
import React, { createContext, useContext, useCallback, useEffect, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import * as oauth from 'oauth4webapi';
import { getProvidersAuth } from '@generated/core/experimental/experimental';
import type {
  AuthProvidersAndDefaults,
  AuthProvider as AuthProviderType,
} from '@generated/core/schemas';
import { getAuthProviderURL } from '@app/api/ApiProvider';

export function extractCoreProviderId(data: AuthProvidersAndDefaults): string | null {
  const ref = data?.core;
  if (typeof ref === 'string' && ref !== 'Default') return ref;
  if (ref && typeof ref === 'object' && 'Provider' in ref && ref.Provider !== 'Default') {
    return ref.Provider;
  }
  if (ref === 'Default' && data?.default) return data.default;

  const providerIds = Object.keys(data?.providers ?? {});
  return providerIds.length === 1 ? providerIds[0] : null;
}

export function hasConfiguredCoreProvider(data: AuthProvidersAndDefaults): boolean {
  const ref = data?.core;
  if (typeof ref === 'string') return ref !== 'Default' || !!data?.default;
  return !!(ref && typeof ref === 'object' && 'Provider' in ref && ref.Provider !== 'Default');
}

export function hasConfiguredDefaultProvider(data: AuthProvidersAndDefaults): boolean {
  return !!data?.default;
}
import { setAuthToken } from '@app/api/fetch-instance';

const KEYS = {
  ACCESS_TOKEN: 'flecs_access_token',
  USER: 'flecs_user',
  CODE_VERIFIER: 'flecs_code_verifier',
} as const;

// Standard OIDC claims, decoded from the access token (the profile page reads them;
// absent claims render as "—"). `access_token` is the runtime convenience copy of the
// raw JWT — it is never persisted separately inside the user object.
interface User {
  sub: string;
  name?: string;
  email?: string;
  access_token?: string;
  preferred_username?: string;
  exp?: number;
  realm_access?: { roles?: string[] };
  resource_access?: Record<string, { roles?: string[] }>;
}

// Decode the (unverified) claims from a JWT access token. The token is the single
// source of truth for identity, so we derive the user from it rather than persisting a
// second copy. The signature is NOT checked here — flecs-core verifies it on every
// request; this is only for display. Returns {} for opaque/non-JWT tokens.
export function decodeJwtClaims(token: string): Partial<User> {
  try {
    const payload = token.split('.')[1];
    if (!payload) return {};
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const binary = atob(base64.padEnd(Math.ceil(base64.length / 4) * 4, '='));
    const json = decodeURIComponent(
      Array.from(binary, (c) => '%' + c.charCodeAt(0).toString(16).padStart(2, '0')).join(''),
    );
    return JSON.parse(json) as Partial<User>;
  } catch {
    return {};
  }
}

interface AuthContextValue {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  error: Error | null;
  authProviderId: string | null;
  fenceBaseURL: string | null;
  signIn: () => Promise<void>;
  signOut: () => void;
  isConfigReady: boolean;
  isCoreProviderReady: boolean;
  isDefaultProviderReady: boolean;
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

export function getOAuthCallbackParameters(
  location: Pick<Location, 'search' | 'hash'> = window.location,
): URLSearchParams {
  const searchParams = new URLSearchParams(location.search);
  if (searchParams.has('code') || searchParams.has('error')) return searchParams;

  const queryStart = location.hash.indexOf('?');
  if (queryStart === -1) return searchParams;

  return new URLSearchParams(location.hash.slice(queryStart + 1));
}

function useAuthConfig() {
  return useQuery({
    queryKey: ['auth-config'],
    queryFn: async () => {
      const res = await getProvidersAuth();
      const data = res.data as AuthProvidersAndDefaults;
      const coreId = extractCoreProviderId(data);
      if (!coreId) return null;

      const provider: AuthProviderType = data.providers[coreId];
      const props = (provider.properties || {}) as Record<string, string>;

      return {
        providerId: coreId,
        authServer: {
          issuer: provider.issuer_url,
          authorization_endpoint: provider.kind === 'oauth' ? provider.authorize_url : undefined,
          token_endpoint: provider.kind === 'oauth' ? provider.token_url : undefined,
          jwks_uri: provider.kind === 'oauth' ? provider.jwk_url : undefined,
          ...(props.userinfo_url && { userinfo_endpoint: props.userinfo_url }),
          ...(props.end_session_url && { end_session_endpoint: props.end_session_url }),
          code_challenge_methods_supported: ['S256'],
        } as oauth.AuthorizationServer,
        client: { client_id: props.client_id || 'flecs' } as oauth.Client,
        redirectUri:
          props.redirect_uri ||
          `${window.location.origin}${window.location.pathname}#/oauth/callback`,
        scope: props.scope || (provider.kind === 'oauth' ? 'api:read' : 'openid email'),
        props,
        fenceBaseURL: getAuthProviderURL(coreId),
        isCoreProviderReady: hasConfiguredCoreProvider(data),
        isDefaultProviderReady: hasConfiguredDefaultProvider(data),
      };
    },
    staleTime: 5 * 60_000,
    retry: 2,
    // Adaptive backoff: check early (core often registers Fence within 1-2s),
    // then back off toward 3s to avoid hammering on slow machines.
    refetchInterval: (query) => {
      if (query.state.data !== null && query.state.data?.isCoreProviderReady !== false) {
        return false;
      }
      const n = query.state.dataUpdateCount;
      return Math.min(300 * 2 ** n, 3_000);
    },
  });
}

export function OAuth4WebApiAuthProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const { data: config, isLoading: configLoading, error: configError } = useAuthConfig();

  // Restore from localStorage — persists across tabs. The token is the only thing we
  // store; the user's claims are derived from it (no redundant second copy).
  const storedUser = useMemo((): User | null => {
    try {
      const token = localStorage.getItem(KEYS.ACCESS_TOKEN);
      if (!token) return null;
      return { sub: 'user', ...decodeJwtClaims(token), access_token: token };
    } catch {
      return null;
    }
  }, []);

  // Drop the legacy flecs_user key written by older builds (it duplicated the token);
  // claims now come from the JWT itself.
  useEffect(() => {
    localStorage.removeItem(KEYS.USER);
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
    const callbackParameters = oauth.validateAuthResponse(
      config.authServer,
      config.client,
      getOAuthCallbackParameters(),
      oauth.expectNoState,
    );
    const codeVerifier = sessionStorage.getItem(KEYS.CODE_VERIFIER);
    if (!codeVerifier) throw new Error('Missing OAuth verifier. Please sign in again.');

    const response = await oauth.authorizationCodeGrantRequest(
      config.authServer,
      config.client,
      oauth.None(),
      callbackParameters,
      config.redirectUri,
      codeVerifier,
      {
        // flecs-core's auth endpoints are same-origin in production and reached
        // through the Vite proxy in dev. The provider's token_endpoint is an absolute
        // URL, so hitting it directly is cross-origin in dev and fails CORS. Route the
        // request through the current origin by path — mirroring the pre-oauth4webapi
        // behavior that worked (token request went to `new URL(token_url).pathname`).
        [oauth.customFetch]: (url, options) => {
          const target = new URL(url);
          const sameOrigin = window.location.origin + target.pathname + target.search;
          return fetch(sameOrigin, { ...options, credentials: 'include' });
        },
      },
    );
    const result = await oauth.processAuthorizationCodeResponse(
      config.authServer,
      config.client,
      response,
    );

    // Store only the token — the user's identity is decoded from it on read.
    localStorage.setItem(KEYS.ACCESS_TOKEN, result.access_token);
    localStorage.removeItem(KEYS.USER); // clear any legacy duplicate from older builds
    setAuthToken(result.access_token);

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
    isAuthenticated,
    isLoading: configLoading,
    user: storedUser,
    error: configError as Error | null,
    authProviderId: config?.providerId ?? null,
    fenceBaseURL: config?.fenceBaseURL ?? null,
    signIn,
    signOut,
    handleOAuthCallback,
    isConfigReady: !!config,
    isCoreProviderReady: config?.isCoreProviderReady ?? false,
    isDefaultProviderReady: config?.isDefaultProviderReady ?? false,
    clearError: () => {},
    refreshAuthState: async () => {},
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default OAuth4WebApiAuthProvider;
