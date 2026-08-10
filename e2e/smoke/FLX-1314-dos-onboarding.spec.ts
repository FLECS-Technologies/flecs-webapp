import { expect, test } from '@playwright/test';
import { mockHappyPath, stubAuth } from '../fixtures/routes';

test.describe('@smoke FLX-1314 - D-O-S onboarding', () => {
  test.beforeEach(async ({ page }) => {
    await stubAuth(page);
    await mockHappyPath(page);
  });

  test('guides apps.json from custom deployment to Backup & migration', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByText('Deploy Your Own App', { exact: true })).toBeVisible();
    await expect(page.getByRole('link', { name: /backup.*migration/i })).toBeVisible();

    await page.getByTestId('sideload-dropzone').click();
    const sideloadDialog = page.getByRole('dialog', { name: 'Deploy Your Own App' });
    await expect(sideloadDialog).toContainText(
      'Install one private or custom Docker app from its manifest.json.',
    );
    const onboardingLink = sideloadDialog.getByRole('link', {
      name: 'Import an onboarding file',
    });
    await expect(onboardingLink).toHaveAttribute('href', '#/system?section=backup-migration');
    await onboardingLink.click();

    await expect(page).toHaveURL(/#\/system\?section=backup-migration$/);
    await expect(page.getByRole('region', { name: 'Backup & migration' })).toBeFocused();
    await expect(page.getByRole('dialog', { name: 'Import apps' })).toHaveCount(0);
    await page.getByRole('button', { name: 'Import apps' }).click();
    const importDialog = page.getByRole('dialog', { name: 'Import apps' });
    const panelBox = await importDialog.locator(':scope > div').boundingBox();
    const viewport = page.viewportSize();
    expect(panelBox).not.toBeNull();
    expect(viewport).not.toBeNull();
    if (!panelBox || !viewport) throw new Error('Could not measure the import dialog');
    expect(Math.abs(panelBox.x + panelBox.width / 2 - viewport.width / 2)).toBeLessThan(2);
    await expect(importDialog).toContainText('Device Onboarding Service (D-O-S)');
    await expect(importDialog).toContainText('.tar or .tar.gz backup');
    await expect(importDialog.locator('input[type="file"]')).toHaveAttribute(
      'accept',
      '.tar.gz, .tar, .json',
    );
    await expect(
      importDialog.getByRole('link', { name: 'How to create apps.json' }),
    ).toHaveAttribute('target', '_blank');
  });

  test('sends apps.json to Core device onboarding', async ({ page }) => {
    let onboardingBody: unknown;
    await page.route('**/api/v2/device/onboarding', async (route) => {
      onboardingBody = await route.request().postDataJSON();
      await route.fulfill({ json: { jobId: 1314 }, status: 202 });
    });

    await page.goto('/');
    await page.getByTestId('sideload-dropzone').click();
    await page.getByRole('link', { name: 'Import an onboarding file' }).click();
    await page.getByRole('button', { name: 'Import apps' }).click();
    const importDialog = page.getByRole('dialog', { name: 'Import apps' });
    await importDialog.locator('input[type="file"]').setInputFiles({
      name: 'apps.json',
      mimeType: 'application/json',
      buffer: Buffer.from('{"apps":[]}'),
    });

    await expect.poll(() => onboardingBody).toEqual({ apps: [] });
  });
});
