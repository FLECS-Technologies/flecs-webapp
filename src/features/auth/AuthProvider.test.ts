import { describe, expect, it } from 'vitest';
import {
  extractCoreProviderId,
  getOAuthCallbackParameters,
  hasConfiguredCoreProvider,
  hasConfiguredDefaultProvider,
} from './AuthProvider';
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

  it('uses string core provider ids returned by flecs-core', () => {
    const data = {
      core: '000fe4ce',
      providers: {
        '000fe4ce': {},
      },
    } as unknown as AuthProvidersAndDefaults;

    expect(extractCoreProviderId(data)).toBe('000fe4ce');
  });

  it('falls back to the first available provider after initial setup', () => {
    const data = {
      core: null,
      providers: {
        '000fe4ce': {},
      },
    } as unknown as AuthProvidersAndDefaults;

    expect(extractCoreProviderId(data)).toBe('000fe4ce');
  });

  it('uses the default provider when core references Default', () => {
    const data = {
      core: 'Default',
      default: '000fe4ce',
      providers: {
        '000fe4ce': {},
        secondary: {},
      },
    } as unknown as AuthProvidersAndDefaults;

    expect(extractCoreProviderId(data)).toBe('000fe4ce');
  });

  it('does not guess a provider when multiple providers exist without a core/default reference', () => {
    const data = {
      core: null,
      providers: {
        first: {},
        second: {},
      },
    } as unknown as AuthProvidersAndDefaults;

    expect(extractCoreProviderId(data)).toBeNull();
  });

  it('returns null when no provider is available yet', () => {
    const data = {
      core: null,
      providers: {},
    } as unknown as AuthProvidersAndDefaults;

    expect(extractCoreProviderId(data)).toBeNull();
  });
});

describe('hasConfiguredCoreProvider', () => {
  it('is true when core points at a concrete provider', () => {
    const data = {
      core: { Provider: '000fe4ce' },
      providers: { '000fe4ce': {} },
    } as unknown as AuthProvidersAndDefaults;

    expect(hasConfiguredCoreProvider(data)).toBe(true);
  });

  it('is true when core returns a concrete provider id string', () => {
    const data = {
      core: '000fe4ce',
      providers: { '000fe4ce': {} },
    } as unknown as AuthProvidersAndDefaults;

    expect(hasConfiguredCoreProvider(data)).toBe(true);
  });

  it('is true when core references a configured default provider', () => {
    const data = {
      core: 'Default',
      default: '000fe4ce',
      providers: { '000fe4ce': {} },
    } as unknown as AuthProvidersAndDefaults;

    expect(hasConfiguredCoreProvider(data)).toBe(true);
  });

  it('is false while core has not registered an auth provider yet', () => {
    const data = {
      core: null,
      providers: { '000fe4ce': {} },
    } as unknown as AuthProvidersAndDefaults;

    expect(hasConfiguredCoreProvider(data)).toBe(false);
  });

  it('is false when core references Default but no default provider is configured', () => {
    const data = {
      core: 'Default',
      default: null,
      providers: { '000fe4ce': {} },
    } as unknown as AuthProvidersAndDefaults;

    expect(hasConfiguredCoreProvider(data)).toBe(false);
  });
});

describe('hasConfiguredDefaultProvider', () => {
  it('is true when a default provider id is configured', () => {
    const data = {
      core: { Provider: '000fe4ce' },
      default: '000fe4ce',
      providers: { '000fe4ce': {} },
    } as unknown as AuthProvidersAndDefaults;

    expect(hasConfiguredDefaultProvider(data)).toBe(true);
  });

  it('is false while the default provider is not configured', () => {
    const data = {
      core: { Provider: '000fe4ce' },
      default: null,
      providers: { '000fe4ce': {} },
    } as unknown as AuthProvidersAndDefaults;

    expect(hasConfiguredDefaultProvider(data)).toBe(false);
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
