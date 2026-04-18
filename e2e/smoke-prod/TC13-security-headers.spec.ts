/**
 * TC13 — WSTG-CONF-14 — required security headers on every response.
 *
 * Asserts the production nginx config at
 * docker/fs/etc/nginx/conf.d/flecs-webapp.conf ships the headers documented
 * in docs/PRD-security.md.
 *
 * Runs against the built bundle served by real nginx (docker-compose.test.yml),
 * NOT against Vite dev — Vite doesn't set security headers.
 *
 * HSTS is NOT asserted here: it's set by the TLS-terminating edge upstream,
 * not by this container (which listens on plain HTTP). See
 * https://cheatsheetseries.owasp.org/cheatsheets/HTTP_Strict_Transport_Security_Cheat_Sheet.html
 */
import { test, expect } from '@playwright/test';

test.describe('@smoke-prod TC13 — security headers', () => {
  test('root response carries the required WSTG-CONF-14 headers', async ({ page }) => {
    const res = await page.goto('/');
    expect(res).not.toBeNull();
    const headers = res!.headers();

    expect(headers['x-content-type-options']).toBe('nosniff');
    expect(headers['x-frame-options']).toBe('DENY');
    expect(headers['referrer-policy']).toBe('strict-origin-when-cross-origin');
    expect(headers['permissions-policy']).toMatch(/geolocation=\(\)/);
    expect(headers['permissions-policy']).toMatch(/camera=\(\)/);
  });

  test('static asset response also carries headers (nginx `always` flag)', async ({ request }) => {
    // Fetch the index directly via request context — bypasses any SPA routing.
    const res = await request.get('/index.html');
    expect(res.status()).toBe(200);
    expect(res.headers()['x-content-type-options']).toBe('nosniff');
    expect(res.headers()['x-frame-options']).toBe('DENY');
  });
});
