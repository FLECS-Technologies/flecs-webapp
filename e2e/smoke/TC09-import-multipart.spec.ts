/**
 * TC09 — Import uses multipart/form-data.
 * Regression-locks commit 1c350d9 — customInstance must not force
 * Content-Type: application/json when the body is FormData (orval's import
 * endpoint builds a FormData body for the tar file).
 */
import { test, expect } from '@playwright/test';
import { stubAuth, mockHappyPath } from '../fixtures/routes';

test.describe('@smoke TC09 — import uses multipart content-type', () => {
  test('POST /imports Content-Type is multipart/form-data (not json)', async ({ page }) => {
    await stubAuth(page);
    await mockHappyPath(page);

    let capturedContentType: string | null = null;
    await page.route('**/api/v2/imports', (route) => {
      capturedContentType = route.request().headers()['content-type'] ?? null;
      return route.fulfill({ json: { jobId: 99 }, status: 202 });
    });
    await page.route('**/api/v2/quests', (route) =>
      route.fulfill({
        json: [{ id: 99, description: 'Import', state: 'finished-ok' }],
        status: 200,
      }),
    );

    // Restore lives on the System page's Backup & migration section.
    await page.goto('/#/system');
    await page.getByRole('button', { name: 'Restore backup' }).click();

    const restoreDialog = page.getByRole('dialog', { name: 'Restore backup' });
    await expect(restoreDialog.locator('input[type="file"]')).toHaveAttribute(
      'accept',
      '.tar.gz, .tar',
    );
    await restoreDialog.locator('input[type="file"]').setInputFiles({
      name: 'export.tar',
      mimeType: 'application/x-tar',
      buffer: Buffer.from('fake-tar-bytes'),
    });

    await expect.poll(() => capturedContentType).not.toBeNull();
    expect(capturedContentType).toMatch(/^multipart\/form-data;\s*boundary=/);
    expect(capturedContentType).not.toContain('application/json');
  });
});
