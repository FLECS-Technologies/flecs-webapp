/**
 * Reusable route handlers for Playwright smoke tests.
 *
 * Uses Playwright's native page.route() — no msw runtime dependency, first-party,
 * per-test overridable. Returns typed payloads from fixtures.ts.
 */
import type { Page } from '@playwright/test';
import { fixtures } from './mocks';

/** Mock the "happy path" that TC01–TC03 need: auth, apps, marketplace, system info. */
export async function mockHappyPath(page: Page): Promise<void> {
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
