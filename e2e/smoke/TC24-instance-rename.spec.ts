import { expect, test } from '@playwright/test';
import { mockHappyPath, stubAuth } from '../fixtures/routes';
import { fixtures } from '../fixtures/mocks';

test.describe('@smoke TC24 - instance rename', () => {
  test('keeps direct instance actions anchored near the viewport edge', async ({ page }) => {
    await page.setViewportSize({ width: 640, height: 700 });
    await stubAuth(page);
    await mockHappyPath(page);

    await page.route('**/api/v2/apps', (route) =>
      route.fulfill({ json: [fixtures.installedApp({ multiInstance: true })], status: 200 }),
    );
    await page.route('**/api/v2/manifests/*/*', (route) =>
      route.fulfill({ json: fixtures.manifest({ multiInstance: true }), status: 200 }),
    );
    await page.route('**/api/v2/products/apps', (route) =>
      route.fulfill({
        json: {
          statusCode: 200,
          statusText: 'OK',
          data: {
            products: [
              fixtures.product({
                attributes: [{ id: 1, name: 'reverse-domain-name', options: ['tech.flecs.fence'] }],
              }),
            ],
          },
        },
        status: 200,
      }),
    );
    await page.route('**/api/v2/instances', (route) =>
      route.fulfill({
        json: Array.from({ length: 5 }, (_, index) =>
          fixtures.instance({
            instanceId: `0000000${index + 1}`,
            instanceName: ['first', 'second', 'third', 'fourth', 'fifth'][index],
          }),
        ),
        status: 200,
      }),
    );

    await page.goto('/');
    const trigger = page.getByRole('button', { name: /test app third actions/i });
    await trigger.focus();
    await page.keyboard.press('Enter');

    const expectAboveTrigger = async (popup: ReturnType<typeof page.getByRole>) => {
      const [popupBox, triggerBox] = await Promise.all([
        popup.boundingBox(),
        trigger.boundingBox(),
      ]);
      expect(popupBox).not.toBeNull();
      expect(triggerBox).not.toBeNull();
      if (!popupBox || !triggerBox) throw new Error('Popup positioning elements are not visible');
      expect(popupBox.y + popupBox.height).toBeLessThan(triggerBox.y);
      return popupBox;
    };

    const menu = page.getByRole('dialog', { name: /test app third actions/i });
    const parentBox = await expectAboveTrigger(menu);
    expect((await menu.getByRole('button').allTextContents()).map((text) => text.trim())).toEqual([
      'Edit name',
      'Duplicate app',
      'Stop',
      'Configure',
      'Info & Logs',
      'Delete instance',
    ]);
    await expect(page.getByRole('button', { name: 'Manage instance' })).toHaveCount(0);
    const [duplicateBox, firstSeparatorBox, stopBox] = await Promise.all([
      menu.getByRole('button', { name: 'Duplicate app' }).boundingBox(),
      menu.locator('hr').first().boundingBox(),
      menu.getByRole('button', { name: 'Stop' }).boundingBox(),
    ]);
    expect(duplicateBox).not.toBeNull();
    expect(firstSeparatorBox).not.toBeNull();
    expect(stopBox).not.toBeNull();
    expect(firstSeparatorBox!.y).toBeGreaterThan(duplicateBox!.y + duplicateBox!.height);
    expect(stopBox!.y).toBeGreaterThan(firstSeparatorBox!.y);

    await page.keyboard.press('Escape');
    await expect(menu).toBeHidden();
    await expect(trigger).toBeFocused();
    await page.keyboard.press('Enter');
    const reopenedBox = await expectAboveTrigger(
      page.getByRole('dialog', { name: /test app third actions/i }),
    );
    expect(reopenedBox.y).toBe(parentBox.y);
    expect(reopenedBox.height).toBe(parentBox.height);
  });

  test('renames an instance from its row and refreshes the displayed name', async ({ page }) => {
    await stubAuth(page);
    await mockHappyPath(page);

    let instanceName = 'default';
    const renameBodies: unknown[] = [];

    await page.route('**/api/v2/apps', (route) =>
      route.fulfill({ json: [fixtures.installedApp({ multiInstance: true })], status: 200 }),
    );
    await page.route('**/api/v2/manifests/*/*', (route) =>
      route.fulfill({ json: fixtures.manifest({ multiInstance: true }), status: 200 }),
    );
    await page.route('**/api/v2/products/apps', (route) =>
      route.fulfill({
        json: {
          statusCode: 200,
          statusText: 'OK',
          data: {
            products: [
              fixtures.product({
                attributes: [{ id: 1, name: 'reverse-domain-name', options: ['tech.flecs.fence'] }],
              }),
            ],
          },
        },
        status: 200,
      }),
    );
    await page.route('**/api/v2/instances', (route) =>
      route.fulfill({ json: [fixtures.instance({ instanceName })], status: 200 }),
    );
    await page.route('**/api/v2/instances/00000001/name', async (route) => {
      const body = route.request().postDataJSON() as { name: string };
      renameBodies.push(body);
      instanceName = body.name;
      return route.fulfill({ status: 200 });
    });

    await page.goto('/');
    await expect(page.getByText('Test App (default)', { exact: true })).toBeVisible();

    await page.getByRole('button', { name: /test app default actions/i }).click();
    await page.getByRole('button', { name: 'Edit name' }).click();

    const dialog = page.getByRole('dialog', { name: 'Edit name' });
    const panelBox = await dialog.locator(':scope > div').boundingBox();
    const viewport = page.viewportSize();
    expect(panelBox).not.toBeNull();
    expect(viewport).not.toBeNull();
    if (!panelBox || !viewport) throw new Error('Rename dialog is not visible');
    expect(Math.abs(panelBox.x + panelBox.width / 2 - viewport.width / 2)).toBeLessThanOrEqual(1);

    const nameInput = dialog.getByLabel('Name', { exact: true });
    await expect(nameInput).toHaveValue('default');
    await expect(dialog.getByRole('button', { name: 'Save name' })).toBeDisabled();

    await nameInput.fill('  production floor  ');
    await expect(dialog.getByText('Test App (production floor)', { exact: true })).toBeVisible();
    await dialog.getByRole('button', { name: 'Save name' }).click();

    await expect(dialog).toBeHidden();
    await expect(page.getByText('Name updated to "production floor"')).toBeVisible();
    await expect(page.getByText('Test App (production floor)', { exact: true })).toBeVisible();
    expect(renameBodies).toEqual([{ name: 'production floor' }]);
  });
});
