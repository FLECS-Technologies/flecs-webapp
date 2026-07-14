/**
 * TC21 - Multi-instance apps are managed as first-class Installed Apps rows.
 *
 * Regression-locks the Installed Apps row model: a multi-instance app must not
 * collapse `instances[]` to the first entry. Menus must operate on the row's
 * concrete instance id, and Duplicate app must appear when the manifest marks
 * the app as multi-instance capable.
 */
import { test, expect } from '@playwright/test';
import { stubAuth, mockHappyPath } from '../fixtures/routes';
import { fixtures } from '../fixtures/mocks';

test.describe('@smoke TC21 - multi-instance management', () => {
  test('duplicates multi-instance apps and scopes lifecycle actions to the row instance', async ({
    page,
  }) => {
    await stubAuth(page);
    await mockHappyPath(page);

    const appKey = { name: 'tech.flecs.node-red', version: '1.0.0' };
    const createBodies: unknown[] = [];
    const startedInstances: string[] = [];
    const stoppedInstances: string[] = [];

    await page.route('**/api/v2/apps', (route) =>
      route.fulfill({
        json: [fixtures.installedApp({ appKey, multiInstance: true })],
        status: 200,
      }),
    );
    await page.route('**/api/v2/manifests', (route) =>
      route.fulfill({
        json: [
          fixtures.manifest({
            app: appKey.name,
            version: appKey.version,
            image: 'node-red:latest',
            multiInstance: true,
          }),
        ],
        status: 200,
      }),
    );
    await page.route('**/api/v2/manifests/*/*', (route) =>
      route.fulfill({
        json: fixtures.manifest({
          app: appKey.name,
          version: appKey.version,
          image: 'node-red:latest',
          multiInstance: true,
        }),
        status: 200,
      }),
    );
    await page.route('**/api/v2/instances', (route) =>
      route.fulfill({
        json: [
          fixtures.instance({
            instanceId: 'abc12345',
            instanceName: 'production',
            appKey,
            status: 'running',
            desired: 'running',
          }),
          fixtures.instance({
            instanceId: 'def67890',
            instanceName: 'staging',
            appKey,
            status: 'running',
            desired: 'running',
          }),
        ],
        status: 200,
      }),
    );
    await page.route('**/api/v2/quests/*', (route) => {
      const jobId = Number(route.request().url().split('/').pop());
      return route.fulfill({
        json: {
          id: jobId,
          description: 'multi-instance quest',
          result: jobId === 101 ? 'new-instance-id' : undefined,
          state: 'success',
        },
        status: 200,
      });
    });
    await page.route('**/api/v2/instances/create', async (route) => {
      createBodies.push(await route.request().postDataJSON());
      return route.fulfill({ json: { jobId: 101 }, status: 202 });
    });
    await page.route('**/api/v2/instances/*/start', (route) => {
      startedInstances.push(
        route
          .request()
          .url()
          .match(/instances\/([^/]+)\/start/)?.[1] ?? '',
      );
      return route.fulfill({ json: { jobId: 102 }, status: 202 });
    });
    await page.route('**/api/v2/instances/*/stop', (route) => {
      stoppedInstances.push(
        route
          .request()
          .url()
          .match(/instances\/([^/]+)\/stop/)?.[1] ?? '',
      );
      return route.fulfill({ json: { jobId: 103 }, status: 202 });
    });

    await page.goto('/');
    await expect(page.getByRole('heading', { name: /installed apps/i })).toBeVisible();
    await expect(page.getByText('tech.flecs.node-red (production)')).toBeVisible();
    await expect(page.getByText('tech.flecs.node-red (staging)')).toBeVisible();

    await page.getByRole('button', { name: /staging actions/i }).click();
    await page.getByRole('button', { name: /^stop$/i }).click();
    await expect.poll(() => stoppedInstances).toEqual(['def67890']);

    await page.getByRole('button', { name: /production actions/i }).click();
    await page.getByRole('button', { name: /duplicate app/i }).click();
    await expect(page.getByRole('heading', { name: /name this instance/i })).toBeVisible();
    await page.getByLabel(/instance name/i).fill('main-controller');
    await page.getByRole('button', { name: /create "main-controller"/i }).click();
    await expect.poll(() => createBodies).toEqual([{ appKey, instanceName: 'main-controller' }]);
    await expect.poll(() => startedInstances).toEqual(['new-instance-id']);
  });
});
