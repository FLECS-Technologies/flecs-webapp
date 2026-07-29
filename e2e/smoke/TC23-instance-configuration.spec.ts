import { expect, test, type Page } from '@playwright/test';
import { mockHappyPath, stubAuth } from '../fixtures/routes';
import { fixtures } from '../fixtures/mocks';

type Audit = {
  writes: string[];
  restarts: string[];
};

async function mockInstanceConfiguration(
  page: Page,
  audit: Audit,
  running = true,
  failEnvironment = false,
) {
  await stubAuth(page);
  await mockHappyPath(page);
  const instance = fixtures.instance({
    status: running ? 'running' : 'stopped',
    desired: running ? 'running' : 'stopped',
  });

  await page.route('**/api/v2/products/apps', (route) =>
    route.fulfill({
      json: {
        statusCode: 200,
        statusText: 'OK',
        data: {
          products: [
            fixtures.product({
              attributes: [
                { id: 1, name: 'archs', options: ['arm64', 'amd64'] },
                { id: 2, name: 'reverse-domain-name', options: ['tech.flecs.fence'] },
                {
                  id: 3,
                  name: 'versions',
                  options: ['0.4.0', '0.3.0-rc.3', '0.2.0'],
                },
              ],
            }),
          ],
        },
      },
      status: 200,
    }),
  );
  await page.route('**/api/v2/instances', (route) =>
    route.fulfill({
      json: [instance],
      status: 200,
    }),
  );
  await page.route('**/api/v2/instances/00000001', (route) =>
    route.fulfill({ json: instance, status: 200 }),
  );
  await page.route('**/api/v2/system/devices/usb', (route) =>
    route.fulfill({
      json: [{ port: '1-1', name: 'Temperature sensor', vendor: 'FLECS Lab' }],
      status: 200,
    }),
  );
  await page.route('**/api/v2/instances/00000001/config/devices/usb', (route) =>
    route.fulfill({ json: [], status: 200 }),
  );
  await page.route('**/api/v2/instances/00000001/config/devices/usb/*', (route) => {
    audit.writes.push(`usb:${route.request().method()}`);
    return route.fulfill({ json: {}, status: 200 });
  });
  await page.route('**/api/v2/instances/00000001/config/environment', async (route) => {
    if (route.request().method() === 'PUT') {
      audit.writes.push('environment:PUT');
      if (failEnvironment) {
        return route.fulfill({
          json: { additionalInfo: 'Configuration rejected' },
          status: 500,
        });
      }
      return route.fulfill({ json: {}, status: 200 });
    }
    return route.fulfill({
      json: [{ name: 'MODE', value: 'production' }],
      status: 200,
    });
  });
  await page.route('**/api/v2/instances/00000001/config/ports', (route) =>
    route.fulfill({
      json: { tcp: [{ host_port: 8080, container_port: 80 }], udp: [], sctp: [] },
      status: 200,
    }),
  );
  await page.route('**/api/v2/instances/00000001/config/ports/*', (route) => {
    const protocol = route.request().url().split('/').pop();
    audit.writes.push(`ports:${protocol}`);
    return route.fulfill({ json: {}, status: 200 });
  });
  await page.route('**/api/v2/instances/00000001/stop', (route) => {
    audit.restarts.push('stop');
    return route.fulfill({ json: { jobId: 71 }, status: 202 });
  });
  await page.route('**/api/v2/instances/00000001/start', (route) => {
    audit.restarts.push('start');
    return route.fulfill({ json: { jobId: 72 }, status: 202 });
  });
  await page.route('**/api/v2/quests/*', (route) => {
    const id = Number(route.request().url().split('/').pop());
    return route.fulfill({
      json: { id, description: 'Instance lifecycle', state: 'success' },
      status: 200,
    });
  });
}

async function openSettings(page: Page) {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /installed apps/i })).toBeVisible();
  await page
    .getByRole('button', { name: /actions/i })
    .first()
    .click();
  await page.getByRole('button', { name: 'Configure' }).click();
  const dialog = page.getByRole('dialog', { name: 'Instance settings' });
  await expect(dialog).toBeVisible();
  return dialog;
}

test.describe('@smoke TC23 - instance configuration', () => {
  test('dismiss never saves or restarts and protects a local draft', async ({ page }) => {
    const audit: Audit = { writes: [], restarts: [] };
    await mockInstanceConfiguration(page, audit);
    const dialog = await openSettings(page);

    await dialog.getByRole('button', { name: 'Environment' }).click();
    await dialog.getByLabel('Value for MODE').fill('staging');
    await expect(dialog.getByText('1 unsaved change')).toBeVisible();
    expect(audit.writes).toEqual([]);

    await dialog.getByRole('button', { name: 'Close instance settings' }).click();
    const discard = page.getByRole('dialog', { name: 'Discard changes?' });
    await expect(discard).toBeVisible();
    await discard.getByRole('button', { name: 'Keep editing' }).click();
    await expect(dialog).toBeVisible();
    expect(audit.writes).toEqual([]);
    expect(audit.restarts).toEqual([]);
  });

  test('preserves drafts across sections and applies before an explicit restart', async ({
    page,
  }) => {
    const audit: Audit = { writes: [], restarts: [] };
    await mockInstanceConfiguration(page, audit);
    const dialog = await openSettings(page);

    await dialog.getByRole('button', { name: 'Environment' }).click();
    await dialog.getByLabel('Value for MODE').fill('staging');
    await dialog.getByRole('button', { name: 'USB Devices' }).click();
    await dialog.getByRole('switch', { name: /temperature sensor/i }).click();
    await dialog.getByRole('button', { name: 'Ports' }).click();
    await dialog.getByLabel('Host port').fill('9090');

    await expect(dialog.getByText('3 unsaved changes')).toBeVisible();
    expect(audit.writes).toEqual([]);
    await dialog.getByRole('button', { name: 'Apply & restart' }).click();

    await expect(dialog).toBeHidden();
    await expect(page.getByText('default settings applied and instance restarting')).toBeVisible();
    expect(audit.writes).toEqual(['environment:PUT', 'ports:tcp', 'usb:PUT']);
    expect(audit.restarts).toEqual(['stop', 'start']);
  });

  test('keeps a staged USB choice when server queries refresh in the background', async ({
    page,
  }) => {
    const audit: Audit = { writes: [], restarts: [] };
    let usbReads = 0;
    let serverReportsEnabled = false;
    await mockInstanceConfiguration(page, audit);
    await page.route('**/api/v2/instances/00000001/config/devices/usb', (route) => {
      usbReads += 1;
      return route.fulfill({
        json: serverReportsEnabled
          ? [
              {
                port: '1-1',
                name: 'Temperature sensor',
                vendor: 'FLECS Lab',
                device_connected: true,
              },
            ]
          : [],
        status: 200,
      });
    });
    const dialog = await openSettings(page);
    const usbSwitch = dialog.getByRole('switch', { name: /temperature sensor/i });

    await usbSwitch.click();
    await expect(usbSwitch).toBeChecked();
    await expect(dialog.getByText('1 unsaved change')).toBeVisible();
    const readsBeforeRefresh = usbReads;
    serverReportsEnabled = true;
    await page.evaluate(() => {
      const afterStaleTime = Date.now() + 31_000;
      Date.now = () => afterStaleTime;
      window.dispatchEvent(new Event('visibilitychange'));
    });

    await expect.poll(() => usbReads).toBeGreaterThan(readsBeforeRefresh);
    await expect(usbSwitch).toBeChecked();
    await expect(dialog.getByText('1 unsaved change')).toBeVisible();
  });

  test('applies configuration without starting an instance that was stopped', async ({ page }) => {
    const audit: Audit = { writes: [], restarts: [] };
    await mockInstanceConfiguration(page, audit, false);
    const dialog = await openSettings(page);

    await dialog.getByRole('button', { name: 'Environment' }).click();
    await dialog.getByLabel('Value for MODE').fill('staging');
    await expect(dialog.getByRole('button', { name: 'Apply changes' })).toBeVisible();
    await dialog.getByRole('button', { name: 'Apply changes' }).click();

    await expect(dialog).toBeHidden();
    expect(audit.writes).toEqual(['environment:PUT']);
    expect(audit.restarts).toEqual([]);
  });

  test('preserves the draft and does not restart after a failed write', async ({ page }) => {
    const audit: Audit = { writes: [], restarts: [] };
    await mockInstanceConfiguration(page, audit, true, true);
    const dialog = await openSettings(page);

    await dialog.getByRole('button', { name: 'Environment' }).click();
    await dialog.getByLabel('Value for MODE').fill('staging');
    await dialog.getByRole('button', { name: 'Apply & restart' }).click();

    await expect(dialog).toBeVisible();
    await expect(dialog.getByText('Configuration rejected')).toBeVisible();
    await expect(dialog.getByLabel('Value for MODE')).toHaveValue('staging');
    expect(audit.writes).toEqual(['environment:PUT']);
    expect(audit.restarts).toEqual([]);
  });

  test('makes version updates and downgrades explicit before any operation starts', async ({
    page,
  }) => {
    const audit: Audit = { writes: [], restarts: [] };
    await mockInstanceConfiguration(page, audit);
    const dialog = await openSettings(page);

    await dialog.getByRole('button', { name: 'Version' }).click();
    await expect(dialog.getByText('Current version')).toBeVisible();
    await expect(dialog.getByText('0.3.0-rc.3', { exact: true })).toBeVisible();
    await expect(dialog.getByRole('button', { name: 'Done' })).toBeVisible();
    await expect(dialog.getByRole('button', { name: 'Apply & restart' })).toHaveCount(0);

    const targetVersion = dialog.getByRole('combobox', { name: 'Target version' });
    await targetVersion.selectOption('0.2.0');
    await expect(dialog.getByRole('button', { name: 'Downgrade to 0.2.0' })).toBeVisible();
    await expect(dialog.getByText(/older version/i)).toBeVisible();

    await targetVersion.selectOption('0.4.0');
    await expect(dialog.getByRole('button', { name: 'Update to 0.4.0' })).toBeVisible();
    await expect(dialog.getByText(/newer version/i)).toBeVisible();
  });

  test('reuses a downloaded version when downgrading', async ({ page }) => {
    const audit: Audit = { writes: [], restarts: [] };
    const operations: string[] = [];
    await mockInstanceConfiguration(page, audit);
    await page.route('**/api/v2/apps', (route) =>
      route.fulfill({
        json: [
          fixtures.installedApp(),
          fixtures.installedApp({
            appKey: { name: 'tech.flecs.fence', version: '0.2.0' },
          }),
        ],
        status: 200,
      }),
    );
    await page.route('**/api/v2/apps/install', (route) => {
      operations.push('install');
      return route.fulfill({ json: { jobId: 80 }, status: 202 });
    });
    await page.route('**/api/v2/instances/00000001', (route) => {
      if (route.request().method() === 'PATCH') {
        const body = route.request().postDataJSON() as { to: string };
        operations.push(`migrate:${body.to}`);
        return route.fulfill({ json: { jobId: 81 }, status: 202 });
      }
      return route.fulfill({ json: fixtures.instance(), status: 200 });
    });
    await page.route('**/api/v2/apps/tech.flecs.fence?*', (route) => {
      const version = new URL(route.request().url()).searchParams.get('version');
      operations.push(`remove:${version}`);
      return route.fulfill({ json: { jobId: 82 }, status: 202 });
    });

    const dialog = await openSettings(page);
    await dialog.getByRole('button', { name: 'Version' }).click();
    await dialog.getByRole('combobox', { name: 'Target version' }).selectOption('0.2.0');
    await dialog.getByRole('button', { name: 'Downgrade to 0.2.0' }).click();

    const progress = page.getByRole('dialog', { name: /downgrade test app to 0.2.0/i });
    await expect(progress.getByText('Version changed!')).toBeVisible();
    expect(operations).toEqual(['migrate:0.2.0', 'remove:0.3.0-rc.3']);
  });
});
