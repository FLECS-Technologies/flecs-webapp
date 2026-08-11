import { expect, test, type Page } from '@playwright/test';
import { mockHappyPath, stubAuth } from '../fixtures/routes';
import { fixtures } from '../fixtures/mocks';

async function openInfoDialog(page: Page) {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Installed Apps' })).toBeVisible();
  await page
    .getByRole('button', { name: /actions/i })
    .first()
    .click();
  await page.getByRole('button', { name: 'Info & Logs' }).click();
  const dialog = page.getByRole('dialog', { name: 'Info & logs' });
  await expect(dialog).toBeVisible();
  return dialog;
}

async function openLogDialog(page: Page) {
  const dialog = await openInfoDialog(page);
  await dialog.getByRole('tab', { name: 'Log' }).click();
  return dialog;
}

test.describe('@smoke TC24 - instance log dialog', () => {
  test.beforeEach(async ({ page }) => {
    await stubAuth(page);
    await mockHappyPath(page);
    await page.route('**/api/v2/instances/00000001', (route) =>
      route.fulfill({
        json: {
          ...fixtures.instance(),
          ipAddress: '172.21.0.2',
          hostname: 'flecs-00000001',
          ports: [],
          volumes: [{ name: 'app-data', path: '/var/lib/app' }],
          configFiles: [{ host: '/etc/flecs/app.conf', container: '/app/app.conf' }],
        },
        status: 200,
      }),
    );
  });

  test('keeps light-mode layout stable through disclosure and repeated refresh flows', async ({
    page,
  }) => {
    await page.addInitScript(() => localStorage.setItem('preferred-theme', 'light'));
    let logRequests = 0;
    let finishRefresh = () => {};
    const refreshGate = new Promise<void>((resolve) => {
      finishRefresh = resolve;
    });
    await page.route('**/api/v2/instances/00000001/logs', async (route) => {
      logRequests += 1;
      if (logRequests === 2) await refreshGate;
      const stdout =
        logRequests === 1
          ? 'Service started'
          : logRequests === 2
            ? 'Service refreshed'
            : 'Service refreshed again';
      await route.fulfill({ json: { stdout, stderr: '' }, status: 200 });
    });

    const dialog = await openInfoDialog(page);
    const generalDialogBox = await dialog.boundingBox();
    const volumes = dialog.getByRole('button', { name: 'Volumes' });
    const [volumeLabelBox, volumeChevronBox] = await Promise.all([
      volumes.locator('span').boundingBox(),
      volumes.locator('svg').boundingBox(),
    ]);
    expect(volumeLabelBox).not.toBeNull();
    expect(volumeChevronBox).not.toBeNull();
    expect(volumeChevronBox!.x).toBeGreaterThan(volumeLabelBox!.x + volumeLabelBox!.width);
    await expect(volumes).toHaveAttribute('aria-expanded', 'false');
    await volumes.click();
    await expect(volumes).toHaveAttribute('aria-expanded', 'true');
    await expect(dialog.getByText('app-data')).toBeVisible();

    const logTab = dialog.getByRole('tab', { name: 'Log' });
    await logTab.click();
    await expect(logTab).toHaveAttribute('aria-selected', 'true');
    await expect(logTab).toHaveCSS('color', 'rgb(11, 11, 24)');
    await expect(dialog.getByText('Service started')).toBeVisible();

    const logOutput = dialog.getByRole('log');
    const refresh = dialog.getByRole('button', { name: 'Refresh log' });
    const footerClose = dialog.getByRole('button', { name: 'Close', exact: true });
    const headerClose = dialog.getByRole('button', { name: 'Close dialog' });
    await expect(refresh).toBeVisible();
    await expect(footerClose).toBeVisible();
    await expect(headerClose).toBeVisible();

    const [outputBox, refreshBox] = await Promise.all([
      logOutput.boundingBox(),
      refresh.boundingBox(),
    ]);
    const logDialogBox = await dialog.boundingBox();
    expect(generalDialogBox).not.toBeNull();
    expect(logDialogBox).not.toBeNull();
    expect(Math.abs(logDialogBox!.width - generalDialogBox!.width)).toBeLessThanOrEqual(1);
    expect(Math.abs(logDialogBox!.height - generalDialogBox!.height)).toBeLessThanOrEqual(1);
    expect(outputBox).not.toBeNull();
    expect(refreshBox).not.toBeNull();
    expect(refreshBox!.y).toBeGreaterThan(outputBox!.y + outputBox!.height);
    expect(Math.abs(refreshBox!.x - outputBox!.x)).toBeLessThanOrEqual(1);

    await logOutput.hover();
    expect(await dialog.boundingBox()).toEqual(logDialogBox);

    await refresh.click();
    const refreshing = dialog.getByRole('button', { name: 'Refreshing log' });
    await expect(refreshing).toBeDisabled();
    await expect
      .poll(() =>
        refreshing.locator('svg').evaluate((icon) => getComputedStyle(icon).animationName),
      )
      .not.toBe('none');
    finishRefresh();
    await expect(dialog.getByText('Service refreshed')).toBeVisible();
    await expect(dialog.getByRole('button', { name: 'Refresh log' })).toBeEnabled();
    await expect(dialog.getByRole('status', { name: 'Log refreshed successfully' })).toHaveText(
      'Updated',
    );

    await dialog.getByRole('button', { name: 'Refresh log' }).click();
    await expect(dialog.getByRole('button', { name: 'Refreshing log' })).toBeDisabled();
    await expect(dialog.getByText('Service refreshed again')).toBeVisible();
    await expect(dialog.getByRole('button', { name: 'Refresh log' })).toBeEnabled();
    expect(logRequests).toBe(3);

    await headerClose.click();
    await expect(dialog).toBeHidden();
  });

  test('preserves the previous log and explains a refresh failure', async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('preferred-theme', 'light'));
    let logRequests = 0;
    await page.route('**/api/v2/instances/00000001/logs', (route) => {
      logRequests += 1;
      return logRequests === 1
        ? route.fulfill({ json: { stdout: 'Last known output', stderr: '' }, status: 200 })
        : route.fulfill({
            json: { additionalInfo: 'Core is temporarily unavailable' },
            status: 500,
          });
    });

    const dialog = await openLogDialog(page);
    await expect(dialog.getByText('Last known output')).toBeVisible();
    await dialog.getByRole('button', { name: 'Refresh log' }).click();

    await expect(dialog.getByRole('alert')).toContainText('Core is temporarily unavailable');
    await expect(dialog.getByText('Last known output')).toBeVisible();
    await expect(dialog.getByRole('button', { name: 'Refresh log' })).toBeEnabled();
    await expect(dialog.getByRole('status')).toHaveCount(0);
  });

  test('supports dark mode, empty logs, keyboard tabs, and footer dismissal', async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('preferred-theme', 'dark'));
    await page.route('**/api/v2/instances/00000001/logs', (route) =>
      route.fulfill({ json: { stdout: '', stderr: '' }, status: 200 }),
    );

    const dialog = await openInfoDialog(page);
    const generalTab = dialog.getByRole('tab', { name: 'General' });
    await generalTab.focus();
    await generalTab.press('ArrowRight');

    const logTab = dialog.getByRole('tab', { name: 'Log' });
    await expect(logTab).toBeFocused();
    await expect(logTab).toHaveAttribute('aria-selected', 'true');
    await expect(logTab).toHaveCSS('color', 'rgb(243, 244, 246)');
    await expect(dialog.getByRole('log')).toHaveText('No log available.');

    await dialog.getByRole('button', { name: 'Close', exact: true }).click();
    await expect(dialog).toBeHidden();
  });
});
