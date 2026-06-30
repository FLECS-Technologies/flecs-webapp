import { getBaseURL } from '@app/api/ApiProvider';
import { FetchError } from './fetch-error';

// Token is stored in localStorage by AuthProvider (OAuth PKCE → upstream Keycloak).
// flecs-core only accepts Authorization: Bearer <jwt> — no cookie session exists
// (verified against codeberg.org/flecs-tech/flecs-core src/wall/watch.rs).
// XSS → token theft risk is mitigated by CSP + DOMPurify, not by storage choice.
const ACCESS_TOKEN_KEY = 'flecs_access_token';

// In-memory fast path. AuthProvider populates this during render, but a request can
// fire before that render runs (a query mounted above AuthProvider, or the first
// requests right after a hard reload), so it is only a cache — never the source of
// truth.
let _accessToken: string | undefined;
export const setAuthToken = (token: string | undefined) => {
  _accessToken = token;
};

// The durable token lives in localStorage. Resolve from the in-memory cache first,
// then fall back to localStorage so the Authorization header is attached whenever a
// token exists — independent of React render timing. sign-out clears both, so an
// empty result here genuinely means "no session". localStorage access is wrapped
// because it can throw (private mode, sandboxed iframes) or be absent (SSR/tests).
const getAccessToken = (): string | undefined => {
  if (_accessToken) return _accessToken;
  try {
    return localStorage.getItem(ACCESS_TOKEN_KEY) ?? undefined;
  } catch {
    return undefined;
  }
};

// Only 401 means the credentials are missing/invalid/expired — flecs-core returns
// 401 for that (see wall/watch.rs). 403 means authenticated-but-forbidden
// (insufficient scope, license-gated endpoint, …); that is NOT a reason to log the
// user out, so we surface it to the caller and keep the session intact.
export const shouldClearAuthOnResponse = (status: number): boolean => status === 401;

function clearStoredAuthAndReload() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem('flecs_user');
  _accessToken = undefined;
  window.location.href = window.location.origin + window.location.pathname;
}

export const customInstance = async <T>(url: string, options?: RequestInit): Promise<T> => {
  // Only force JSON Content-Type for string bodies. FormData/Blob need the
  // browser to set multipart/octet-stream with the correct boundary.
  const isJsonBody = typeof options?.body === 'string';
  const accessToken = getAccessToken();
  const response = await fetch(`${getBaseURL()}${url}`, {
    ...options,
    headers: {
      ...(isJsonBody ? { 'Content-Type': 'application/json' } : {}),
      ...(options?.headers as Record<string, string>),
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
    signal: options?.signal ?? AbortSignal.timeout(15_000),
  });

  const ct = response.headers.get('content-type') ?? '';
  const data = ct.includes('json')
    ? await response.json()
    : ct.includes('octet-stream') || ct.includes('tar') || ct.includes('zip')
      ? await response.blob()
      : await response.text();

  if (!response.ok) {
    const hasStoredAuth = !!getAccessToken();
    if (hasStoredAuth && shouldClearAuthOnResponse(response.status)) {
      clearStoredAuthAndReload();
    }
    throw new FetchError(response.status, data, response.headers);
  }

  return { data, status: response.status, headers: response.headers } as T;
};

// Orval reads these exports to wire up TError/TBody in generated hooks
export type ErrorType<E> = FetchError<E>;
export type BodyType<B> = B;

export default customInstance;
