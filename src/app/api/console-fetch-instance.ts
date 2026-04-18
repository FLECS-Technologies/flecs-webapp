import { FetchError } from './fetch-error';

const BASE_URL = import.meta.env.VITE_CONSOLE_URL || 'https://console.flecs.tech';

export const customInstance = async <T>(url: string, options?: RequestInit): Promise<T> => {
  // Only force JSON Content-Type for string bodies. FormData/Blob need the
  // browser to set multipart/octet-stream with the correct boundary.
  const isJsonBody = typeof options?.body === 'string';
  const response = await fetch(`${BASE_URL}${url}`, {
    ...options,
    headers: {
      ...(isJsonBody ? { 'Content-Type': 'application/json' } : {}),
      ...(options?.headers as Record<string, string>),
    },
    signal: options?.signal ?? AbortSignal.timeout(15_000),
  });

  const contentType = response.headers.get('content-type');
  const data = contentType?.includes('json') ? await response.json() : await response.text();

  if (!response.ok) {
    throw new FetchError(response.status, data, response.headers);
  }

  return { data, status: response.status, headers: response.headers } as T;
};

// Orval reads these exports to wire up TError/TBody in generated hooks
export type ErrorType<E> = FetchError<E>;
export type BodyType<B> = B;

export default customInstance;
