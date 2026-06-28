import { describe, expect, it } from 'vitest';
import { extractCoreProviderId, getOAuthCallbackParameters } from './AuthProvider';
import type { AuthProvidersAndDefaults } from '@generated/core/schemas';

describe('extractCoreProviderId', () => {
  it('uses the configured core provider when present', () => {
    const data = {
      core: { Provider: 'core-provider' },
      providers: {
        'core-provider': {},
        fallback: {},
      },
    } as unknown as AuthProvidersAndDefaults;

    expect(extractCoreProviderId(data)).toBe('core-provider');
  });

  it('returns null when no core provider is configured yet', () => {
    const data = {
      core: null,
      providers: {},
    } as unknown as AuthProvidersAndDefaults;

    expect(extractCoreProviderId(data)).toBeNull();
  });
});

describe('getOAuthCallbackParameters', () => {
  it('reads OAuth parameters from the URL search params', () => {
    const params = getOAuthCallbackParameters({
      search: '?code=from-search',
      hash: '#/oauth/callback?code=from-hash',
    });

    expect(params.get('code')).toBe('from-search');
  });

  it('reads OAuth parameters from the hash route query params', () => {
    const params = getOAuthCallbackParameters({
      search: '',
      hash: '#/oauth/callback?code=from-hash',
    });

    expect(params.get('code')).toBe('from-hash');
  });

  it('reads OAuth errors from the hash route query params', () => {
    const params = getOAuthCallbackParameters({
      search: '',
      hash: '#/oauth/callback?error=access_denied',
    });

    expect(params.get('error')).toBe('access_denied');
  });
});
