/**
 * Typed error class for non-2xx HTTP responses.
 * Orval picks up the ErrorType export to wire TError in generated hooks.
 */
export class FetchError<T = unknown> extends Error {
  readonly status: number;
  readonly data: T;
  readonly headers: Headers;

  constructor(status: number, data: T, headers: Headers) {
    super(`HTTP ${status}`);
    this.name = 'FetchError';
    this.status = status;
    this.data = data;
    this.headers = headers;
  }
}

/**
 * Extract a human-readable reason from a thrown error.
 * Prefers the server-side message carried on FetchError.data — flecs-core returns
 * `additionalInfo` (camelCase) on the wire even though the OpenAPI spec generates
 * it as `additional_info`, so we check both.
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof FetchError) {
    const serverMsg = extractServerMessage(error.data);
    if (serverMsg) return serverMsg;
    return error.message;
  }
  if (error instanceof Error) return error.message;
  return String(error);
}

function extractServerMessage(data: unknown): string | undefined {
  if (typeof data !== 'object' || data === null) return undefined;
  if ('additionalInfo' in data && typeof data.additionalInfo === 'string') return data.additionalInfo;
  if ('additional_info' in data && typeof data.additional_info === 'string') return data.additional_info;
  if ('message' in data && typeof data.message === 'string') return data.message;
  return undefined;
}
