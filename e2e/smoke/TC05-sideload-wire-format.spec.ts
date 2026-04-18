/**
 * TC05 — Sideload wire format.
 * Regression-locks commit e592b9a — the POST /apps/sideload body must be
 * exactly {"manifest":"<raw text>"}, not an EnrichedApp dump.
 */
import { test, expect } from '@playwright/test';
import { stubAuth, mockHappyPath } from '../fixtures/routes';

test.describe('@smoke TC05 — sideload wire format', () => {
  test('POST /apps/sideload body is { manifest: "<raw>" }', async ({ page }) => {
    await stubAuth(page);
    await mockHappyPath(page);

    let capturedBody: unknown = null;
    await page.route('**/api/v2/apps/sideload', (route) => {
      capturedBody = route.request().postDataJSON();
      return route.fulfill({ json: { jobId: 42 }, status: 202 });
    });
    await page.route('**/api/v2/quests', (route) =>
      route.fulfill({
        json: [{ id: 42, description: 'Sideloading', state: 'finished-ok' }],
        status: 200,
      }),
    );

    // InstalledApps is the root route (see ui-routes.tsx).
    await page.goto('/');
    await page.getByRole('button', { name: /upload manifest/i }).first().click();

    const manifestText = JSON.stringify({
      $schema: 'https://raw.githubusercontent.com/FLECS-Technologies/app-sdk/main/manifest.schema.json',
      _schemaVersion: '2.0.0',
      app: 'tech.flecs.wire',
      version: '1.0.0',
      image: 'nginx',
      multiInstance: false,
    });

    await page.setInputFiles('input[type="file"][accept=".json"]', {
      name: 'manifest.json',
      mimeType: 'application/json',
      buffer: Buffer.from(manifestText, 'utf-8'),
    });

    // Wait for the POST to land.
    await expect.poll(() => capturedBody).not.toBeNull();

    // The body shape is the entire regression target.
    expect(capturedBody).toEqual({ manifest: manifestText });
    expect(Object.keys(capturedBody as object)).toEqual(['manifest']);
  });
});
