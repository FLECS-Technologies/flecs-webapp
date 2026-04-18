/**
 * TC01–TC03 — app boots. The minimum viable reachability smoke.
 *
 * Rewritten from the legacy e2e/smoke.spec.ts to:
 *  - Use deterministic mocks via page.route() (no waitForTimeout).
 *  - Assert on concrete DOM landmarks, not raw body text.
 *  - Run under the @smoke tag.
 */
import { test, expect } from '@playwright/test';
import { mockHappyPath, stubAuth } from '../fixtures/routes';

test.describe('@smoke TC01-TC03 — app boot', () => {
  test.beforeEach(async ({ page }) => {
    await stubAuth(page);
    await mockHappyPath(page);
  });

  test('TC01 — root renders without crashing', async ({ page }) => {
    await page.goto('/');
    // The app chrome — sidebar "FLECS" text — is always rendered once providers settle
    await expect(page.getByText('FLECS').first()).toBeVisible();
  });

  test('TC02 — system page reachable', async ({ page }) => {
    await page.goto('/#/system');
    await expect(page.getByRole('heading', { name: /system/i })).toBeVisible();
  });

  test('TC03 — marketplace page reachable', async ({ page }) => {
    await page.goto('/#/marketplace');
    await expect(page.getByRole('heading', { name: /marketplace/i })).toBeVisible();
  });
});
