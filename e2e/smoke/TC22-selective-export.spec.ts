/**
 * TC22 - App backup management lives on System and exports only selected instances.
 */
import { test, expect } from '@playwright/test';
import type { ExportRequest } from '@generated/core/schemas';
import { stubAuth, mockHappyPath } from '../fixtures/routes';
import { fixtures } from '../fixtures/mocks';

test.describe('@smoke TC22 - selective app export', () => {
  test('shows familiar instance rows and includes required app packages automatically', async ({
    page,
  }) => {
    await stubAuth(page);
    await mockHappyPath(page);

    const firstAppKey = { name: 'tech.flecs.node-red', version: '4.0.2' };
    const secondAppKey = { name: 'com.example.dashboard', version: '1.3.0' };
    let exportRequest: ExportRequest | undefined;

    await page.route('**/api/v2/apps', (route) =>
      route.fulfill({
        json: [
          fixtures.installedApp({ appKey: firstAppKey }),
          fixtures.installedApp({ appKey: secondAppKey }),
        ],
        status: 200,
      }),
    );
    await page.route('**/api/v2/instances', (route) =>
      route.fulfill({
        json: [
          fixtures.instance({
            instanceId: '11111111',
            instanceName: 'production',
            appKey: firstAppKey,
          }),
          fixtures.instance({
            instanceId: '11111112',
            instanceName: 'staging',
            appKey: firstAppKey,
            status: 'stopped',
            desired: 'stopped',
          }),
          fixtures.instance({
            instanceId: '22222222',
            instanceName: 'dashboard',
            appKey: secondAppKey,
          }),
        ],
        status: 200,
      }),
    );
    await page.route('**/api/v2/products/apps', (route) =>
      route.fulfill({
        json: {
          statusCode: 200,
          statusText: 'OK',
          data: {
            products: [
              fixtures.product({
                id: 1,
                name: 'Node-RED',
                attributes: [{ id: 1, name: 'reverse-domain-name', options: [firstAppKey.name] }],
              }),
              fixtures.product({
                id: 2,
                name: 'Dashboard',
                attributes: [{ id: 2, name: 'reverse-domain-name', options: [secondAppKey.name] }],
              }),
            ],
          },
        },
        status: 200,
      }),
    );
    await page.route('**/api/v2/exports', async (route) => {
      if (route.request().method() !== 'POST') {
        await route.fallback();
        return;
      }
      exportRequest = await route.request().postDataJSON();
      await route.fulfill({ json: { jobId: 220 }, status: 202 });
    });
    await page.route('**/api/v2/quests/220', (route) =>
      route.fulfill({
        json: fixtures.quest({
          id: 220,
          description: 'Create selective export',
          result: 'selected-apps-export',
        }),
        status: 200,
      }),
    );
    await page.route('**/api/v2/exports/selected-apps-export', (route) =>
      route.fulfill({
        body: 'export archive',
        contentType: 'application/x-tar',
        status: 200,
      }),
    );

    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'Installed Apps' })).toBeVisible();
    await expect(page.getByRole('button', { name: /import apps/i })).toHaveCount(0);
    await expect(page.getByRole('button', { name: /export apps/i })).toHaveCount(0);

    await page.getByRole('link', { name: /backup.*migration/i }).click();
    await expect(page).toHaveURL(/#\/system\?section=backup-migration$/);
    await expect(page.getByRole('region', { name: 'Backup & migration' })).toBeFocused();

    await page.getByRole('button', { name: 'Create backup' }).click();
    await expect(page.getByRole('dialog', { name: 'Create backup' })).toBeVisible();
    await expect(page.getByRole('checkbox', { name: 'Select all instances' })).toBeChecked();
    await expect(page.getByText('2 apps and 3 instances selected')).toBeVisible();
    await expect(page.getByText('Node-RED (production)')).toBeVisible();
    await expect(page.getByText('Node-RED (staging)')).toBeVisible();
    await expect(page.getByText('Dashboard (dashboard)')).toHaveCount(0);

    await page.getByRole('checkbox', { name: 'Include Node-RED production instance' }).uncheck();
    await page.getByRole('checkbox', { name: 'Include Dashboard dashboard instance' }).uncheck();
    await expect(page.getByText('1 app and 1 instance selected')).toBeVisible();

    await page
      .getByRole('dialog', { name: 'Create backup' })
      .getByRole('button', { name: 'Create backup', exact: true })
      .click();

    await expect
      .poll(() => exportRequest)
      .toEqual({
        apps: [firstAppKey],
        instances: ['11111112'],
      });
  });
});
