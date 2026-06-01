/**
 * TC18 — WSTG-INPV-02 — stored XSS guard on marketplace product descriptions.
 *
 * The marketplace API is FLECS-curated but nothing stops it from returning an
 * HTML payload. If the description pipeline (product-service.getDescription →
 * sanitizeHtml → html-react-parser in FullCard) regresses, a malicious or
 * accidentally-authored listing executes script in every user's browser.
 *
 * This is the defense-in-depth runtime assertion that pairs with:
 *   - ESLint react/no-danger (build-time ban on raw dangerouslySetInnerHTML)
 *   - src/app/html-utils.test.ts (sanitizeHtml unit coverage)
 *
 * The test: mock a malicious description, open FullCard, assert no script
 * executes and no event-handler attributes survive in the DOM.
 */
import { test, expect } from '@playwright/test';
import { stubAuth, mockHappyPath } from '../fixtures/routes';
import { fixtures } from '../fixtures/mocks';

const XSS_PAYLOAD = [
  '<script>window.__xss_executed__ = true; alert("xss")</script>',
  '<img src=x onerror="window.__xss_executed__ = true; alert(\'xss-img\')">',
  '<a href="javascript:alert(\'xss-link\')">click</a>',
].join('');

test.describe('@smoke TC18 — stored XSS guard on marketplace description', () => {
  test('malicious description does not execute script or leave event handlers in DOM', async ({
    page,
  }) => {
    const dialogs: string[] = [];
    page.on('dialog', (d) => {
      dialogs.push(d.message());
      void d.dismiss();
    });

    await stubAuth(page);
    await mockHappyPath(page);

    // Override products with a payload that would execute if sanitization failed.
    await page.route('**/api/v2/products/apps', (route) =>
      route.fulfill({
        json: {
          statusCode: 200,
          statusText: 'OK',
          data: {
            products: [
              fixtures.product({
                id: 999,
                name: 'XSS Target',
                short_description: `safe <p>intro</p>${XSS_PAYLOAD}`,
                description: `safe <p>intro</p>${XSS_PAYLOAD}`,
              }),
            ],
          },
        },
      }),
    );

    await page.goto('/#/marketplace');
    await expect(page.getByRole('heading', { name: /marketplace/i })).toBeVisible();

    // Click the card to open FullCard — this is where the description gets parsed + rendered.
    await page.getByTestId('app-card').click();
    await expect(page.getByRole('heading', { name: 'XSS Target' })).toBeVisible();

    // Assertion 1 — no alert dialog fired.
    expect(dialogs, `unexpected dialogs: ${dialogs.join(', ')}`).toEqual([]);

    // Assertion 2 — window-global sentinel never assigned (catches scripts that
    // ran silently without dialogs).
    const executed = await page.evaluate(
      () => (window as unknown as { __xss_executed__?: boolean }).__xss_executed__,
    );
    expect(executed).toBeUndefined();

    // Assertion 3 — no onerror/onclick/onload attributes survived in the DOM.
    const handlersPresent = await page.evaluate(() => {
      const all = document.querySelectorAll('*');
      for (const el of Array.from(all)) {
        for (const attr of Array.from(el.attributes)) {
          if (/^on[a-z]+/i.test(attr.name)) return `${el.tagName}.${attr.name}`;
        }
      }
      return null;
    });
    expect(handlersPresent, `event handler leaked into DOM: ${handlersPresent}`).toBeNull();

    // Assertion 4 — no <script> tag rendered.
    const scriptCount = await page.locator('main script').count();
    expect(scriptCount).toBe(0);
  });
});
