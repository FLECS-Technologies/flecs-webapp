/**
 * TC12 — "Not compatible" cards still open the detail view on click.
 *
 * Regression-locks commit b57d5dd. Pre-fix, the action bar called
 * e.stopPropagation() and the "Not compatible" button had no onClick of its
 * own — clicking the bottom ~25% of the card was a dead zone. Post-fix, the
 * button calls setFullCardOpen(true) and the whole card is interactive.
 */
import { test, expect } from '@playwright/test';
import { stubAuth, mockHappyPath } from '../fixtures/routes';
import { fixtures } from '../fixtures/mocks';

test.describe('@smoke TC12 — incompatible cards are clickable', () => {
  test('clicking "Not compatible" opens the FullCard detail dialog', async ({ page }) => {
    await stubAuth(page);
    await mockHappyPath(page);

    // Seed a product whose archs don't match the device arch (arm64 mock).
    // This forces the "Not compatible" button to render.
    await page.route('**/api/v2/products/apps', (route) =>
      route.fulfill({
        json: {
          statusCode: 200,
          statusText: 'OK',
          data: {
            products: [
              fixtures.product({
                id: 101,
                name: 'Incompatible App',
                short_description: 'short desc',
                description: 'A test app for TC12',
                attributes: [
                  { id: 1, name: 'archs', options: ['amd64'] }, // device is arm64
                  { id: 2, name: 'reverse-domain-name', options: ['tech.flecs.tc12'] },
                ],
              }),
            ],
          },
        },
      }),
    );

    await page.goto('/#/marketplace');
    await expect(page.getByRole('heading', { name: /marketplace/i })).toBeVisible();

    // The card should render with a "Not compatible" action button.
    const notCompatButton = page.getByRole('button', { name: /not compatible/i });
    await expect(notCompatButton).toBeVisible();

    // Click the button — pre-fix this was dead; post-fix it opens FullCard.
    await notCompatButton.click();

    // FullCard renders into a portal on document.body with the app title as a heading.
    await expect(page.getByRole('heading', { name: 'Incompatible App' })).toBeVisible();
  });
});
