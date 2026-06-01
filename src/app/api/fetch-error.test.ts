/**
 * Regression lock for getErrorMessage() — commits b7e00f5 + 020b479.
 *
 * Every error toast in the webapp runs through this helper. The camelCase vs
 * snake_case dual-key fallback exists because the flecs-core runtime emits
 * `additionalInfo` (camelCase) while the OpenAPI spec declares
 * `additional_info` (snake_case) — see docs/ISSUE-flecs-core-additionalinfo-schema.md.
 *
 * When the upstream spec is fixed, the snake_case branch can be deleted AND
 * the corresponding assertion below updated — but not before.
 */
import { describe, it, expect } from 'vitest';
import { FetchError, getErrorMessage } from './fetch-error';

describe('getErrorMessage', () => {
  it('prefers FetchError.data.additionalInfo (camelCase — what flecs-core emits)', () => {
    const err = new FetchError(500, { additionalInfo: 'license key 403' }, new Headers());
    expect(getErrorMessage(err)).toBe('license key 403');
  });

  it('falls back to FetchError.data.additional_info (snake_case — what spec says)', () => {
    const err = new FetchError(500, { additional_info: 'spec-compliant path' }, new Headers());
    expect(getErrorMessage(err)).toBe('spec-compliant path');
  });

  it('prefers camelCase over snake_case when both are present', () => {
    const err = new FetchError(
      500,
      { additionalInfo: 'camel wins', additional_info: 'snake loses' },
      new Headers(),
    );
    expect(getErrorMessage(err)).toBe('camel wins');
  });

  it('falls back to data.message for non-FLECS error shapes', () => {
    const err = new FetchError(400, { message: 'generic backend error' }, new Headers());
    expect(getErrorMessage(err)).toBe('generic backend error');
  });

  it('falls back to "HTTP <status>" when data has no known reason fields', () => {
    const err = new FetchError(503, { something: 'unexpected' }, new Headers());
    expect(getErrorMessage(err)).toBe('HTTP 503');
  });

  it('falls back to "HTTP <status>" when data is null', () => {
    const err = new FetchError(500, null, new Headers());
    expect(getErrorMessage(err)).toBe('HTTP 500');
  });

  it('ignores non-string values in known fields (defensive against malformed bodies)', () => {
    const err = new FetchError(
      500,
      { additionalInfo: 42, additional_info: { nested: true } },
      new Headers(),
    );
    expect(getErrorMessage(err)).toBe('HTTP 500');
  });

  it('returns message from a plain Error (non-FetchError throws)', () => {
    expect(getErrorMessage(new Error('runtime boom'))).toBe('runtime boom');
  });

  it('stringifies non-Error throws (e.g., a bare string rejection)', () => {
    expect(getErrorMessage('raw string reason')).toBe('raw string reason');
    expect(getErrorMessage(42)).toBe('42');
  });
});
