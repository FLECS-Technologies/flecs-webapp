import { getBaseURL } from '@app/api/ApiProvider';
import { FetchError } from './fetch-error';

// In production: device sets HttpOnly sid cookie → browser sends it automatically → zero JS token storage
// In dev: Vite proxy is different origin, cookie doesn't work → fallback to Bearer token from localStorage
let _accessToken: string | undefined;
export const setAuthToken = (token: string | undefined) => { _accessToken = token; };

export const customInstance = async <T>(url: string, options?: RequestInit): Promise<T> => {
  // Only force JSON Content-Type for string bodies. FormData/Blob need the
  // browser to set multipart/octet-stream with the correct boundary.
  const isJsonBody = typeof options?.body === 'string';
  const response = await fetch(`${getBaseURL()}${url}`, {
    ...options,
    credentials: 'include',
    headers: {
      ...(isJsonBody ? { 'Content-Type': 'application/json' } : {}),
      ...(options?.headers as Record<string, string>),
      ...(_accessToken ? { Authorization: `Bearer ${_accessToken}` } : {}),
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
    if (response.status === 401) {
      localStorage.removeItem('flecs_access_token');
      localStorage.removeItem('flecs_user');
      _accessToken = undefined;
      window.location.href = window.location.origin + window.location.pathname;
    }
    throw new FetchError(response.status, data, response.headers);
  }

  return { data, status: response.status, headers: response.headers } as T;
};

// Orval reads these exports to wire up TError/TBody in generated hooks
export type ErrorType<E> = FetchError<E>;
export type BodyType<B> = B;

export default customInstance;
