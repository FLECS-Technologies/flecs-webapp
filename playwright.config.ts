import { defineConfig } from '@playwright/test';

// Gate the smoke-prod project + its Docker webServer behind an env var.
// Most developers run smoke-dev on every save; smoke-prod requires a built
// bundle + Docker and is only meaningful on PRs that touch nginx / build /
// production config. CI opts in with PW_SMOKE_PROD=true.
const PROD_ENABLED = process.env.PW_SMOKE_PROD === 'true';

export default defineConfig({
  testDir: './e2e',
  testMatch: '**/*.spec.ts',
  timeout: 30_000,
  forbidOnly: !!process.env.CI,
  retries: 0,
  fullyParallel: true,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: {
    ignoreHTTPSErrors: true,
    // Block Service Workers: page.route() does NOT intercept requests handled
    // by a Service Worker. Keeps the in-browser interception guarantee
    // explicit. See https://playwright.dev/docs/service-workers
    serviceWorkers: 'block',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    // Tier 2 — mocked smoke against Vite dev. Runs on every PR.
    {
      name: 'smoke-dev',
      testDir: 'e2e/smoke',
      use: { baseURL: 'http://localhost:5173' },
    },
    // Tier 3 — production nginx image + built bundle. Catches security-header
    // regressions (WSTG CONF-12/14) that the dev tier cannot observe because
    // Vite does not set response headers. Opt-in via PW_SMOKE_PROD=true.
    ...(PROD_ENABLED
      ? [
          {
            name: 'smoke-prod',
            testDir: 'e2e/smoke-prod',
            use: { baseURL: 'http://localhost:8080' },
          },
        ]
      : []),
  ],

  webServer: [
    {
      command: 'npm run dev',
      url: 'http://localhost:5173',
      reuseExistingServer: !process.env.CI,
      ignoreHTTPSErrors: true,
      timeout: 120_000,
    },
    ...(PROD_ENABLED
      ? [
          {
            command: 'docker compose -f docker-compose.test.yml up --wait',
            url: 'http://localhost:8080/health',
            reuseExistingServer: !process.env.CI,
            timeout: 120_000,
          },
        ]
      : []),
  ],
});
