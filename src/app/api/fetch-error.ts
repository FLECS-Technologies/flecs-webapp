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
