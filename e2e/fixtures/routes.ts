/**
 * Reusable route handlers for Playwright smoke tests.
 *
 * Architecture note — validated against playwright.dev/docs/network:
 * page.route() intercepts requests INSIDE the browser before they leave
 * Chromium. This means:
 *   - Vite's server.proxy config is never consulted by the test
 *   - Your local VM / flecs-core is never contacted
 *   - CI works without any backend reachable
 *
 * LIFO rule: routes run in opposite order of registration. The catch-all
 * below is registered FIRST so specific overrides from mockHappyPath (and
 * test files) take precedence — the catch-all only fires for requests
 * no specific handler matched.
 */
import type { Page } from '@playwright/test';
import { fixtures } from './mocks';

/** Mock the "happy path" that TC01–TC03 need: auth, apps, marketplace, system info. */
export async function mockHappyPath(page: Page): Promise<void> {
  // Catch-all — fail loudly on any unmocked API request. Without this, an
  // unmocked route silently proxies to the VM (locally) or a dead socket (CI),
  // producing non-deterministic test results.
  await page.route('**/api/v2/**', (route) => {
    const req = route.request();
    throw new Error(`Unmocked API call: ${req.method()} ${req.url()}`);
  });

  // Auth provider config — must have a valid `core` provider, otherwise
  // OnboardingGuard redirects to /onboarding and the app never renders.
  await page.route('**/api/v2/providers/auth', (route) =>
    route.fulfill({
      json: {
        core: 'smoke-core-provider',
        default: 'smoke-core-provider',
        providers: {
          'smoke-core-provider': {
            id: 'smoke-core-provider',
            name: 'Smoke Test Provider',
            kind: 'fence',
            issuer_url: 'http://localhost:5173',
            properties: {},
          },
        },
      },
      status: 200,
    }),
  );

  // System info (arch used by compat filter)
  await page.route('**/api/v2/system/info', (route) =>
    route.fulfill({ json: fixtures.systemInfo(), status: 200 }),
  );
  await page.route('**/api/v2/system/ping', (route) =>
    route.fulfill({ json: { status: 'OK', data: {} }, status: 200 }),
  );
  await page.route('**/api/v2/system/version', (route) =>
    route.fulfill({ json: { core: '5.2.0-smoke', api: '2.1.0' }, status: 200 }),
  );

  // Exports list (System page Exports tab + download ribbon)
  await page.route('**/api/v2/exports', (route) =>
    route.fulfill({ json: [], status: 200 }),
  );

  // Installed apps
  await page.route('**/api/v2/apps', (route) =>
    route.fulfill({ json: [fixtures.installedApp()], status: 200 }),
  );

  // Instances
  await page.route('**/api/v2/instances', (route) =>
    route.fulfill({ json: [fixtures.instance()], status: 200 }),
  );

  // Quests
  await page.route('**/api/v2/quests', (route) =>
    route.fulfill({ json: [], status: 200 }),
  );

  // License activation (already active — skips DeviceActivation UI)
  await page.route('**/api/v2/device/license/activation/status', (route) =>
    route.fulfill({ json: { isValid: true }, status: 200 }),
  );

  // License metadata (System page)
  await page.route('**/api/v2/device/license/info', (route) =>
    route.fulfill({
      json: {
        sessionId: 'smoke-session',
        license: 'SMOKE-TEST-0000-0000',
        lastSessionRenewal: 0,
      },
      status: 200,
    }),
  );

  // Quest-by-id — default to immediate finished-ok for any jobId a test polls.
  // Tests that need specific quest states override this before navigating.
  await page.route('**/api/v2/quests/*', (route) => {
    const jobId = Number(route.request().url().split('/').pop());
    return route.fulfill({
      json: { id: jobId, description: 'smoke quest', state: 'finished-ok' },
      status: 200,
    });
  });

  // Marketplace products (console API)
  await page.route('**/api/v2/products/apps', (route) =>
    route.fulfill({
      json: {
        statusCode: 200,
        statusText: 'OK',
        data: { products: [fixtures.product()] },
      },
      status: 200,
    }),
  );
}

/** Seed a valid auth token in localStorage so the SPA skips DeviceLogin. */
export async function stubAuth(page: Page): Promise<void> {
  await page.addInitScript(() => {
    localStorage.setItem('flecs_access_token', 'smoke-test-token');
    localStorage.setItem(
      'flecs_user',
      JSON.stringify({ sub: 'smoke-test', access_token: 'smoke-test-token' }),
    );
  });
}
