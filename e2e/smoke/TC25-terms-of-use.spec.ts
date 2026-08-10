import { expect, test } from '@playwright/test';
import { fixtures } from '../fixtures/mocks';
import { mockHappyPath, stubAuth } from '../fixtures/routes';

test.describe('@smoke TC25 - app terms of use', () => {
  test('scrolls long App Details content inside the modal', async ({ page }) => {
    await page.setViewportSize({ width: 900, height: 500 });
    await stubAuth(page);
    await mockHappyPath(page);

    await page.route('**/api/v2/products/apps', (route) =>
      route.fulfill({
        json: {
          statusCode: 200,
          statusText: 'OK',
          data: {
            products: [
              fixtures.product({
                id: 126,
                name: 'Long Details App',
                description: `<p>${'Long app details. '.repeat(120)}</p>`,
              }),
            ],
          },
        },
        status: 200,
      }),
    );

    await page.goto('/#/marketplace');
    await page.getByTestId('app-card').click();

    const scrollArea = page.getByRole('heading', { name: 'About' }).locator('../..');
    const dimensions = await scrollArea.evaluate((element) => ({
      clientHeight: element.clientHeight,
      scrollHeight: element.scrollHeight,
    }));
    expect(dimensions.scrollHeight).toBeGreaterThan(dimensions.clientHeight);

    await scrollArea.hover();
    await page.mouse.wheel(0, 500);
    await expect.poll(() => scrollArea.evaluate((element) => element.scrollTop)).toBeGreaterThan(0);
  });

  test('keeps App Details unchanged when Console has no terms URL', async ({ page }) => {
    await stubAuth(page);
    await mockHappyPath(page);

    await page.goto('/#/marketplace');
    await page.getByTestId('app-card').click();

    await expect(page.getByRole('link', { name: 'Terms of use' })).toHaveCount(0);
  });

  test('shows the Console terms URL in App Details', async ({ page }) => {
    await stubAuth(page);
    await mockHappyPath(page);

    await page.route('**/api/v2/products/apps', (route) =>
      route.fulfill({
        json: {
          statusCode: 200,
          statusText: 'OK',
          data: {
            products: [
              {
                ...fixtures.product({ id: 125, name: 'Licensed App' }),
                meta_data: [
                  {
                    id: 1,
                    key: '_flecs_license_url',
                    value: 'https://example.com/terms',
                  },
                ],
              },
            ],
          },
        },
        status: 200,
      }),
    );

    await page.goto('/#/marketplace');
    await page.getByTestId('app-card').click();

    const terms = page.getByRole('link', { name: 'Terms of use' });
    await expect(terms).toBeVisible();
    await expect(terms).toHaveAttribute('href', 'https://example.com/terms');
    await expect(terms).toHaveAttribute('target', '_blank');
    await expect(terms).toHaveAttribute('rel', 'noopener noreferrer');
  });
});
