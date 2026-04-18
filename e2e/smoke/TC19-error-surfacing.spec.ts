/**
 * TC19 — WSTG-ERRH-01 — server error reason surfaces in UI, not raw HTTP code.
 * Regression-locks commits b7e00f5 + 020b479: getErrorMessage() reads
 * FetchError.data.additionalInfo (or additional_info) before falling back to
 * "HTTP ${status}".
 */
import { test, expect } from '@playwright/test';
import { stubAuth, mockHappyPath } from '../fixtures/routes';

test.describe('@smoke TC19 — error toast shows server reason', () => {
  test('import 400 shows additionalInfo, not "HTTP 400"', async ({ page }) => {
    await stubAuth(page);
    await mockHappyPath(page);

    await page.route('**/api/v2/imports', (route) =>
      route.fulfill({
        status: 400,
        json: { additionalInfo: 'Corrupt tar archive: unexpected EOF' },
      }),
    );

    await page.goto('/');
    await page.getByRole('button', { name: /import config/i }).click();
    await page.setInputFiles('input[type="file"][accept*=".tar"]', {
      name: 'bad.tar',
      mimeType: 'application/x-tar',
      buffer: Buffer.from('bad-bytes'),
    });

    // The UI should surface the backend reason, not the raw "HTTP 400" message.
    await expect(page.getByText('Corrupt tar archive: unexpected EOF')).toBeVisible();
    await expect(page.getByText(/^HTTP 400$/)).not.toBeVisible();
  });
});
