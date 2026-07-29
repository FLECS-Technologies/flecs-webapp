import { test, expect } from '@playwright/test';
import { mockHappyPath, stubAuth } from '../fixtures/routes';

test.describe('default brand logo', () => {
  test.beforeEach(async ({ page }) => {
    await stubAuth(page);
    await mockHappyPath(page);
  });

  test('cold load renders the built-in logo without requesting a missing themed asset', async ({
    page,
  }) => {
    const defaultLogoRequests: string[] = [];
    page.on('request', (request) => {
      if (new URL(request.url()).pathname.endsWith('/theming/logo.svg')) {
        defaultLogoRequests.push(request.url());
      }
    });

    await page.goto('/');
    const sidebar = page.locator('aside');
    await expect(sidebar.getByText('FLECS', { exact: true })).toBeVisible();

    expect(defaultLogoRequests).toEqual([]);
    await expect(sidebar.locator('img[src$="/theming/logo.svg"]')).toHaveCount(0);
    await expect
      .poll(() =>
        sidebar
          .locator('img')
          .evaluateAll((images) =>
            images
              .filter((image) => image.complete && image.naturalWidth === 0)
              .map((image) => image.currentSrc || image.src),
          ),
      )
      .toEqual([]);
  });
});
