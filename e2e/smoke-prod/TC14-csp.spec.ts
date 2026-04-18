/**
 * TC14 — WSTG-CONF-12 — Content Security Policy is present and restrictive.
 *
 * Per the OWASP CSP Cheat Sheet, a meaningful CSP must:
 *   - Set default-src to a narrow source list ('self')
 *   - NOT allow 'unsafe-eval' (blocks runtime eval / new Function)
 *   - NOT allow 'unsafe-inline' in script-src (inline scripts)
 *   - Set frame-ancestors to prevent clickjacking (even with X-Frame-Options)
 *   - Whitelist only the backends the app legitimately contacts
 *
 * Note: style-src 'unsafe-inline' is permitted in our current config because
 * Tailwind v4 + sonner inject <style> at runtime. Script-side inline is still
 * blocked. Tightening styles would need CSS nonces — separate work.
 */
import { test, expect } from '@playwright/test';

test.describe('@smoke-prod TC14 — CSP restrictiveness', () => {
  test('CSP header is present and restricts scripts + framing', async ({ page }) => {
    const res = await page.goto('/');
    const csp = res!.headers()['content-security-policy'];

    expect(csp, 'Content-Security-Policy header must be set').toBeTruthy();

    // Core doctrine — the critical "no runtime eval" and "no inline scripts".
    expect(csp).toMatch(/default-src 'self'/);
    expect(csp).toMatch(/script-src 'self'(?!\s+'unsafe)/);
    expect(csp).not.toMatch(/'unsafe-eval'/);

    // Clickjacking defense-in-depth (paired with X-Frame-Options: DENY).
    expect(csp).toMatch(/frame-ancestors 'none'/);

    // Base + form action locked — prevents CSS injection hijack of <base> tags
    // and form-action exfiltration.
    expect(csp).toMatch(/base-uri 'self'/);
    expect(csp).toMatch(/form-action 'self'/);
    expect(csp).toMatch(/object-src 'none'/);
  });

  test('CSP whitelists only the expected backend origins', async ({ page }) => {
    const res = await page.goto('/');
    const csp = res!.headers()['content-security-policy'] ?? '';

    // connect-src must allow same-origin + the three known marketplace hosts.
    // Any new origin needs a deliberate CSP update — this test is the reminder.
    expect(csp).toMatch(/connect-src[^;]*'self'/);
    expect(csp).toMatch(/connect-src[^;]*console\.flecs\.tech/);
    expect(csp).toMatch(/connect-src[^;]*console-dev\.flecs\.tech/);
  });
});
