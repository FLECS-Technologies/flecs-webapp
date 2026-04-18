/**
 * TC04 — Marketplace "Compatible" filter.
 * Regression-locks three bugs fixed this session:
 *   - e52d47e  derive finalProducts in render (no zustand mirror)
 *   - b522be9  unified arch compatibility check
 *   - abf40c6  use product.id as React key (no duplicate keys)
 *
 * Assertions:
 *   1. Toggling Compatible reduces visible card count instantly (no refresh).
 *   2. Count of [data-testid="app-card"] === filtered count.
 *   3. No React "duplicate key" console warnings over the whole flow.
 */
import { test, expect } from '@playwright/test';
import { stubAuth, mockHappyPath } from '../fixtures/routes';
import { fixtures } from '../fixtures/mocks';

test.describe('@smoke TC04 — compat filter deterministic', () => {
  test('filter narrows visible cards and emits no duplicate-key warnings', async ({ page }) => {
    await stubAuth(page);
    await mockHappyPath(page);

    // Two compatible products (arm64) + one incompatible (amd64 only) + a
    // second copy sharing a reverse-domain-name (the duplicate-key pre-fix bug).
    await page.route('**/api/v2/products/apps', (route) =>
      route.fulfill({
        json: {
          statusCode: 200,
          statusText: 'OK',
          data: {
            products: [
              fixtures.product({ id: 1, name: 'Compat A' }),
              fixtures.product({
                id: 2,
                name: 'Compat B',
                attributes: [
                  { id: 1, name: 'archs', options: ['arm64'] },
                  { id: 2, name: 'reverse-domain-name', options: ['tech.flecs.compatb'] },
                ],
              }),
              fixtures.product({
                id: 3,
                name: 'Incompat amd64',
                attributes: [
                  { id: 1, name: 'archs', options: ['amd64'] },
                  { id: 2, name: 'reverse-domain-name', options: ['tech.flecs.amd'] },
                ],
              }),
              // Deliberate duplicate reverse-domain-name — different id. Pre-fix this caused
              // "Encountered two children with the same key" warnings.
              fixtures.product({
                id: 4,
                name: 'Compat A Clone',
                attributes: [
                  { id: 1, name: 'archs', options: ['arm64'] },
                  { id: 2, name: 'reverse-domain-name', options: ['tech.flecs.testapp'] },
                ],
              }),
            ],
          },
        },
      }),
    );

    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error' || msg.type() === 'warning') consoleErrors.push(msg.text());
    });

    await page.goto('/#/marketplace');
    await expect(page.getByRole('heading', { name: /marketplace/i })).toBeVisible();

    // With the filter OFF, all 4 products render.
    await expect(page.getByTestId('app-card')).toHaveCount(4);

    // Toggle Compatible — filter should narrow to 3 (the amd64-only product disappears).
    await page.getByRole('button', { name: 'Compatible', exact: true }).click();
    await expect(page.getByTestId('app-card')).toHaveCount(3);

    // React duplicate-key warning regression guard.
    const duplicateKeyWarnings = consoleErrors.filter((m) =>
      m.includes('Encountered two children with the same key'),
    );
    expect(duplicateKeyWarnings).toEqual([]);
  });
});
