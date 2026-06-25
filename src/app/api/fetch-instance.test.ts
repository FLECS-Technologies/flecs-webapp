import { describe, expect, it } from 'vitest';
import { shouldClearAuthOnResponse } from './fetch-instance';

describe('shouldClearAuthOnResponse', () => {
  it('clears auth for unauthorized responses', () => {
    expect(shouldClearAuthOnResponse(401, { message: 'expired token' })).toBe(true);
  });

  it('clears auth for empty forbidden responses from flecs-core', () => {
    expect(shouldClearAuthOnResponse(403, '')).toBe(true);
    expect(shouldClearAuthOnResponse(403, null)).toBe(true);
  });

  it('keeps auth for forbidden responses with domain error bodies', () => {
    expect(shouldClearAuthOnResponse(403, { additionalInfo: 'license key 403' })).toBe(false);
  });

  it('keeps auth for non-auth failures', () => {
    expect(shouldClearAuthOnResponse(404, '')).toBe(false);
    expect(shouldClearAuthOnResponse(500, '')).toBe(false);
  });
});
