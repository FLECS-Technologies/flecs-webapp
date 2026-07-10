import { describe, expect, it } from 'vitest';
import {
  decodeJwtClaims,
  extractCoreProviderId,
  getOAuthCallbackParameters,
  hasConfiguredCoreProvider,
  hasConfiguredDefaultProvider,
} from './AuthProvider';
import type { AuthProvider, AuthProvidersAndDefaults } from '@generated/core/schemas';

// Build a JWT-shaped token (header.payload.signature) with a base64url payload.
const makeJwt = (claims: Record<string, unknown>) => {
  const b64 = btoa(unescape(encodeURIComponent(JSON.stringify(claims))))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
  return `header.${b64}.signature`;
};

// Minimal spec-valid AuthProvider — these helpers only ever read the provider *keys*, so
// the value shape just has to satisfy the generated type.
const provider = (id: string): AuthProvider => ({
  kind: 'oidc',
  issuer_url: `https://issuer.example/${id}`,
  name: id,
  port: 0,
  properties: {},
});

const providersFrom = (...ids: string[]): AuthProvidersAndDefaults['providers'] =>
  Object.fromEntries(ids.map((id): [string, AuthProvider] => [id, provider(id)]));

describe('extractCoreProviderId', () => {
  it('uses the configured core provider when present', () => {
    const data: AuthProvidersAndDefaults = {
      core: '000fe4ce',
      providers: providersFrom('000fe4ce', 'fallback'),
    };

    expect(extractCoreProviderId(data)).toBe('000fe4ce');
  });

  it('falls back to the first available provider after initial setup', () => {
    const data: AuthProvidersAndDefaults = {
      core: null,
      providers: providersFrom('000fe4ce'),
    };

    expect(extractCoreProviderId(data)).toBe('000fe4ce');
  });

  it("uses the default provider when core is 'Default'", () => {
    const data: AuthProvidersAndDefaults = {
      core: 'Default',
      default: '000fe4ce',
      providers: providersFrom('000fe4ce', 'secondary'),
    };

    expect(extractCoreProviderId(data)).toBe('000fe4ce');
  });

  it('does not guess a provider when multiple providers exist without a core/default reference', () => {
    const data: AuthProvidersAndDefaults = {
      core: null,
      providers: providersFrom('first', 'second'),
    };

    expect(extractCoreProviderId(data)).toBeNull();
  });

  it('returns null when no provider is available yet', () => {
    const data: AuthProvidersAndDefaults = {
      core: null,
      providers: providersFrom(),
    };

    expect(extractCoreProviderId(data)).toBeNull();
  });
});

describe('hasConfiguredCoreProvider', () => {
  it('is true when core points at a concrete provider', () => {
    const data: AuthProvidersAndDefaults = {
      core: '000fe4ce',
      providers: providersFrom('000fe4ce'),
    };

    expect(hasConfiguredCoreProvider(data)).toBe(true);
  });

  it('is true when core references a configured default provider', () => {
    const data: AuthProvidersAndDefaults = {
      core: 'Default',
      default: '000fe4ce',
      providers: providersFrom('000fe4ce'),
    };

    expect(hasConfiguredCoreProvider(data)).toBe(true);
  });

  it('is false while core has not registered an auth provider yet', () => {
    const data: AuthProvidersAndDefaults = {
      core: null,
      providers: providersFrom('000fe4ce'),
    };

    expect(hasConfiguredCoreProvider(data)).toBe(false);
  });

  it("is false when core is 'Default' but no default provider is configured", () => {
    const data: AuthProvidersAndDefaults = {
      core: 'Default',
      default: null,
      providers: providersFrom('000fe4ce'),
    };

    expect(hasConfiguredCoreProvider(data)).toBe(false);
  });
});

describe('hasConfiguredDefaultProvider', () => {
  it('is true when a default provider id is configured', () => {
    const data: AuthProvidersAndDefaults = {
      core: '000fe4ce',
      default: '000fe4ce',
      providers: providersFrom('000fe4ce'),
    };

    expect(hasConfiguredDefaultProvider(data)).toBe(true);
  });

  it('is false while the default provider is not configured', () => {
    const data: AuthProvidersAndDefaults = {
      core: '000fe4ce',
      default: null,
      providers: providersFrom('000fe4ce'),
    };

    expect(hasConfiguredDefaultProvider(data)).toBe(false);
  });
});

describe('decodeJwtClaims', () => {
  it('decodes standard OIDC claims from a JWT access token', () => {
    const token = makeJwt({
      sub: 'b4f0-uuid',
      preferred_username: 'alex',
      exp: 1893456000,
      realm_access: { roles: ['admin'] },
    });

    expect(decodeJwtClaims(token)).toMatchObject({
      sub: 'b4f0-uuid',
      preferred_username: 'alex',
      exp: 1893456000,
      realm_access: { roles: ['admin'] },
    });
  });

  it('decodes UTF-8 claim values', () => {
    expect(decodeJwtClaims(makeJwt({ name: 'Ünal Çağ' })).name).toBe('Ünal Çağ');
  });

  it('returns empty claims for opaque (non-JWT) tokens', () => {
    expect(decodeJwtClaims('opaque-token')).toEqual({});
    expect(decodeJwtClaims('')).toEqual({});
    expect(decodeJwtClaims('header.not-valid-base64-json.sig')).toEqual({});
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
