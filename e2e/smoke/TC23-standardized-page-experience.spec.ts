import { test, expect } from '@playwright/test';
import { fixtures } from '../fixtures/mocks';
import { mockHappyPath, stubAuth } from '../fixtures/routes';

test.describe('@smoke TC23 - standardized page experience', () => {
  test.beforeEach(async ({ page }) => {
    await stubAuth(page);
    await mockHappyPath(page);
  });

  for (const pageCase of [
    { path: '/#/marketplace', title: 'Marketplace', eyebrow: null },
    { path: '/', title: 'Installed Apps', eyebrow: 'APPS' },
    { path: '/#/system', title: 'System', eyebrow: 'Device' },
  ]) {
    test(`${pageCase.title} uses the standard page header`, async ({ page }) => {
      await page.goto(pageCase.path);

      await expect(page.locator('main').getByRole('heading', { level: 1 })).toHaveText(
        pageCase.title,
      );
      if (pageCase.eyebrow) {
        await expect(page.locator('main').getByText(pageCase.eyebrow, { exact: true })).toHaveCount(
          0,
        );
      }
    });
  }

  test('sidebar reserves dynamic app counts while they load', async ({ page }) => {
    let releaseInstances = () => {};
    const instancesReady = new Promise<void>((resolve) => {
      releaseInstances = resolve;
    });

    await page.route('**/api/v2/instances', async (route) => {
      await instancesReady;
      await route.fulfill({
        json: [
          fixtures.instance({
            editors: [
              {
                name: 'Flow Editor',
                port: 1880,
                url: '/v2/instances/00000001/editor/1880',
              },
            ],
          }),
        ],
        status: 200,
      });
    });

    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('status', { name: 'Loading Installed count' })).toBeVisible();

    releaseInstances();

    await expect(page.getByRole('status', { name: 'Loading Installed count' })).toBeHidden();
    await expect(page.getByText('Flow Editor')).toBeVisible();
  });
});
