const BASE_URL = import.meta.env.VITE_CONSOLE_URL || 'https://console.flecs.tech';

export const customInstance = async <T>(url: string, options?: RequestInit): Promise<T> => {
  const response = await fetch(`${BASE_URL}${url}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(options?.headers as Record<string, string>) },
    signal: options?.signal ?? AbortSignal.timeout(15_000),
  });

  const contentType = response.headers.get('content-type');
  const data = contentType?.includes('json') ? await response.json() : await response.text();
  return { data, status: response.status, headers: response.headers } as T;
};

export default customInstance;
