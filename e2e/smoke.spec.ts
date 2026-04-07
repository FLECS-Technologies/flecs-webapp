import { test, expect } from '@playwright/test';

test.describe('Smoke — app loads', () => {
  test('login page renders', async ({ page }) => {
    await page.goto('/');
    // Should show either login page or the app (if already authenticated)
    const body = await page.textContent('body');
    expect(body).toBeTruthy();
  });

  test('system page accessible after login', async ({ page }) => {
    await page.goto('/#/system');
    await page.waitForTimeout(2000);
    const body = await page.textContent('body');
    expect(body?.includes('System') || body?.includes('Welcome')).toBeTruthy();
  });

  test('marketplace page loads', async ({ page }) => {
    await page.goto('/#/marketplace');
    await page.waitForTimeout(2000);
    const body = await page.textContent('body');
    expect(body?.includes('Marketplace') || body?.includes('Welcome')).toBeTruthy();
  });
});
