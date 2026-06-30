import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { customInstance, setAuthToken, shouldClearAuthOnResponse } from './fetch-instance';

vi.mock('@app/api/ApiProvider', () => ({ getBaseURL: () => 'https://core.test' }));

describe('shouldClearAuthOnResponse', () => {
  it('clears auth only for unauthorized (401) responses — invalid/expired credentials', () => {
    expect(shouldClearAuthOnResponse(401)).toBe(true);
  });

  it('keeps auth for forbidden (403) responses — authenticated but not permitted', () => {
    // 403 means the session is valid but the action is not allowed (scope, license,
    // admin-only endpoint). Logging the user out here causes a sign-in loop.
    expect(shouldClearAuthOnResponse(403)).toBe(false);
  });

  it('keeps auth for non-auth failures', () => {
    expect(shouldClearAuthOnResponse(404)).toBe(false);
    expect(shouldClearAuthOnResponse(500)).toBe(false);
  });
});

describe('customInstance Authorization header', () => {
  let fetchMock: ReturnType<typeof vi.fn>;
  let store: Map<string, string>;

  const headersOf = () =>
    new Headers((fetchMock.mock.calls[0][1] as RequestInit).headers as HeadersInit);

  beforeEach(() => {
    setAuthToken(undefined);
    store = new Map();
    vi.stubGlobal('localStorage', {
      getItem: (k: string) => store.get(k) ?? null,
      setItem: (k: string, v: string) => store.set(k, v),
      removeItem: (k: string) => store.delete(k),
      clear: () => store.clear(),
    });
    fetchMock = vi
      .fn()
      .mockResolvedValue(
        new Response('{}', { status: 200, headers: { 'content-type': 'application/json' } }),
      );
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    setAuthToken(undefined);
  });

  it('attaches the token even when setAuthToken was never called (token only in localStorage)', async () => {
    // Reproduces the reported bug: a request fires before AuthProvider rendered, so
    // the in-memory cache is empty — the header must still come from localStorage.
    store.set('flecs_access_token', 'stored-token');

    await customInstance('/foo');

    expect(headersOf().get('Authorization')).toBe('Bearer stored-token');
  });

  it('prefers the in-memory token when set', async () => {
    store.set('flecs_access_token', 'stored-token');
    setAuthToken('memory-token');

    await customInstance('/foo');

    expect(headersOf().get('Authorization')).toBe('Bearer memory-token');
  });

  it('sends no Authorization header when there is no session', async () => {
    await customInstance('/foo');

    expect(headersOf().has('Authorization')).toBe(false);
  });
});
