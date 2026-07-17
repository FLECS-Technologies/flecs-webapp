import { describe, expect, it, vi, afterEach } from 'vitest';
import { loadTenant, TenantConfigSchema } from './tenant';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('TenantConfigSchema', () => {
  it('defaults to showing the app title', () => {
    const tenant = TenantConfigSchema.parse({});

    expect(tenant.branding.show_app_title).toBe(true);
  });

  it('accepts hidden app title for wordmark logos', () => {
    const tenant = TenantConfigSchema.parse({
      branding: { show_app_title: false },
    });

    expect(tenant.branding.show_app_title).toBe(false);
  });

  it('accepts mode-specific logo assets', () => {
    const tenant = TenantConfigSchema.parse({
      branding: {
        logos: {
          default: 'logo.svg',
          light: 'logo-light.svg',
          dark: 'logo-dark.svg',
        },
      },
    });

    expect(tenant.branding.logos).toEqual({
      default: 'logo.svg',
      light: 'logo-light.svg',
      dark: 'logo-dark.svg',
    });
  });

  it('accepts a tenant-specific documentation link', () => {
    const tenant = TenantConfigSchema.parse({ links: { docs: 'https://docs.example.com/' } });

    expect(tenant.links.docs).toBe('https://docs.example.com/');
  });

  it('rejects unsafe documentation protocols', () => {
    expect(() => TenantConfigSchema.parse({ links: { docs: 'javascript:alert(1)' } })).toThrow();
  });
});

describe('loadTenant', () => {
  it('falls back to defaults for malformed config', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({ branding: { show_app_title: 'nope' } }),
    } as Response);

    await expect(loadTenant()).resolves.toEqual(TenantConfigSchema.parse({}));
  });
});
