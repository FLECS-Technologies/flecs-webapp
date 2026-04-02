import { getBaseURL } from '@app/api/ApiProvider';

// In production: device sets HttpOnly sid cookie → browser sends it automatically → zero JS token storage
// In dev: Vite proxy is different origin, cookie doesn't work → fallback to Bearer token from localStorage
let _accessToken: string | undefined;
export const setAuthToken = (token: string | undefined) => { _accessToken = token; };

export const customInstance = async <T>(url: string, options?: RequestInit): Promise<T> => {
  const response = await fetch(`${getBaseURL()}${url}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers as Record<string, string>),
      ...(_accessToken ? { Authorization: `Bearer ${_accessToken}` } : {}),
    },
    signal: options?.signal ?? AbortSignal.timeout(15_000),
  });

  if (response.status === 401) {
    localStorage.removeItem('flecs_access_token');
    localStorage.removeItem('flecs_user');
    _accessToken = undefined;
    window.location.href = window.location.origin + window.location.pathname;
    throw new Error('Session expired');
  }

  const ct = response.headers.get('content-type');
  const data = ct?.includes('json') ? await response.json() : await response.text();
  return { data, status: response.status, headers: response.headers } as T;
};

export default customInstance;
