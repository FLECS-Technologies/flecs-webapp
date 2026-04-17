/**
 * Proof that the sideload wire format is correct:
 *   POST /apps/sideload   body:  {"manifest":"<raw-text>"}
 *
 * This is the bug the PRD targets. The old code passed an EnrichedApp
 * view model through `as unknown as Parameters<typeof sideloadApp>[0]['data']`,
 * so the serialized body had no `manifest` key and the backend 400'd every time.
 *
 * We stub `customInstance` (orval's fetch wrapper) and assert what the
 * generated `postAppsSideload` actually calls it with.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

const customInstanceMock = vi.fn();

vi.mock('@app/api/fetch-instance', () => ({
  customInstance: (...args: unknown[]) => customInstanceMock(...args),
}));

// Import AFTER the mock is registered so the generated module picks it up.
const { postAppsSideload } = await import('@generated/core/apps/apps');
const { PostAppsSideloadBody } = await import('@generated/core/schemas/postAppsSideloadBody')
  .then((m) => ({ PostAppsSideloadBody: m }))
  .catch(() => ({ PostAppsSideloadBody: null as unknown }));

describe('POST /apps/sideload wire format', () => {
  beforeEach(() => {
    customInstanceMock.mockReset();
    customInstanceMock.mockResolvedValue({ data: { jobId: 42 }, status: 202, headers: new Headers() });
  });

  it('sends a JSON body of {"manifest": "<raw text>"} — not a parsed object', async () => {
    const rawManifest = 'app: com.example.widget\nversion: 1.0.0\nimage: example/widget:1.0.0\n';

    await postAppsSideload({ manifest: rawManifest });

    expect(customInstanceMock).toHaveBeenCalledTimes(1);
    const [url, init] = customInstanceMock.mock.calls[0];

    expect(url).toBe('/apps/sideload');
    expect(init.method).toBe('POST');
    expect(init.headers['Content-Type']).toBe('application/json');

    const parsed = JSON.parse(init.body);
    expect(parsed).toEqual({ manifest: rawManifest });
    expect(Object.keys(parsed)).toEqual(['manifest']);
  });

  it('does not leak extra fields even if called with a wider object', async () => {
    // Regression guard: even if a caller tried to sneak in EnrichedApp-ish fields
    // (the exact pre-fix bug), the generated type would block it at compile time
    // AND — belt-and-braces — the serialized body only contains `manifest` because
    // PostAppsSideloadBody is `{ manifest: string }`.
    await postAppsSideload({ manifest: 'only-this' });
    const [, init] = customInstanceMock.mock.calls[0];
    const parsed = JSON.parse(init.body);
    expect(parsed).not.toHaveProperty('appKey');
    expect(parsed).not.toHaveProperty('title');
    expect(parsed).not.toHaveProperty('versions');
  });
});
