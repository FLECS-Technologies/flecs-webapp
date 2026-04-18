import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  // Discover nested specs (e2e/smoke/**, e2e/regression/**)
  testMatch: '**/*.spec.ts',
  timeout: 30_000,
  // Fail the test run on any test.only — prevents accidental single-test commits.
  forbidOnly: !!process.env.CI,
  // No default retries — flaky tests should be fixed, not retried.
  retries: 0,
  // Parallel execution — smoke is small, keep it fast.
  fullyParallel: true,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: 'http://localhost:5173',
    ignoreHTTPSErrors: true,
    // Block Service Workers: page.route() does NOT intercept requests handled
    // by a Service Worker. If we ever install one (MSW browser worker, PWA
    // caching, etc.), it would silently bypass our test mocks and reach the
    // Vite proxy → local VM. Block keeps the in-browser interception guarantee
    // explicit. See https://playwright.dev/docs/service-workers
    serviceWorkers: 'block',
    // Capture traces on first retry — browsable with `npx playwright show-report`.
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    ignoreHTTPSErrors: true,
    timeout: 120_000,
  },
});
