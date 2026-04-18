/**
 * TC17 — WSTG-CLNT-05 — every external target="_blank" anchor has
 * rel="noopener noreferrer".
 *
 * Lint rule (react/jsx-no-target-blank) catches this at build time, but this
 * runtime check provides defense-in-depth: if the rule is ever disabled per-file
 * with eslint-disable, or if a rel is set dynamically and drops the flags,
 * this test fails.
 *
 * Regression-locks commit da0a679.
 */
import { test, expect } from '@playwright/test';
import { stubAuth, mockHappyPath } from '../fixtures/routes';

test.describe('@smoke TC17 — target blank rel hygiene', () => {
  test('every anchor with target="_blank" has both noopener and noreferrer', async ({ page }) => {
    await stubAuth(page);
    await mockHappyPath(page);

    // Visit the routes where external links live
    for (const route of ['/', '/#/marketplace', '/#/system']) {
      await page.goto(route);
      await expect(page.getByText('FLECS').first()).toBeVisible();

      const offenders = await page.$$eval('a[target="_blank"]', (anchors) =>
        anchors
          .map((a) => ({
            href: a.getAttribute('href') ?? '',
            rel: a.getAttribute('rel') ?? '',
          }))
          .filter(({ rel }) => !rel.includes('noopener') || !rel.includes('noreferrer'))
          .map(({ href, rel }) => `${href} rel="${rel}"`),
      );

      expect(offenders, `route ${route}: anchors missing rel:\n${offenders.join('\n')}`).toEqual([]);
    }
  });
});
