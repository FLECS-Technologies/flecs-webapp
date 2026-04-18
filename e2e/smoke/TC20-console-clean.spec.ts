/**
 * TC20 — No console errors/warnings on cold happy-path navigation.
 *
 * The broadest safety net in the suite. Catches:
 *  - React "Encountered two children with the same key" (wider net than TC04's specific mock)
 *  - React "each child in a list should have a unique key" prop warnings
 *  - Unhandled promise rejections
 *  - Uncaught exceptions on any route
 *  - TanStack Query stable-query-client violations at runtime
 *  - Hydration-style warnings
 *
 * Pattern: page.on('console') for logged messages + page.on('pageerror') for
 * uncaught exceptions. Navigate every top-level route, fail if anything emits.
 *
 * Allowlist: known noise we deliberately tolerate (React DevTools prompts,
 * Vite HMR chatter, third-party lib warnings we can't suppress) — keep tight.
 */
import { test, expect } from '@playwright/test';
import { stubAuth, mockHappyPath } from '../fixtures/routes';

const ROUTES = ['/', '/#/marketplace', '/#/system'];

// Messages we explicitly tolerate. Keep this list short — expanding it silently
// weakens the safety net.
const ALLOWED = [
  /Download the React DevTools/, // React dev-mode dev-tools nag
  /Warning: Received .* for a non-boolean attribute/, // MUI/legacy boolean prop leak; will die with tailwind migration
];

test.describe('@smoke TC20 — console cleanliness', () => {
  test('cold navigation across /, /marketplace, /system emits zero console errors or warnings', async ({
    page,
  }) => {
    await stubAuth(page);
    await mockHappyPath(page);

    const offenders: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() !== 'error' && msg.type() !== 'warning') return;
      const text = msg.text();
      if (ALLOWED.some((re) => re.test(text))) return;
      offenders.push(`[${msg.type()}] ${text}`);
    });
    page.on('pageerror', (err) => {
      offenders.push(`[uncaught] ${err.message}`);
    });

    for (const route of ROUTES) {
      await page.goto(route);
      // Wait for the app chrome to be present before moving on — ensures all
      // effects have fired for this route, not just the navigation promise.
      await expect(page.getByText('FLECS').first()).toBeVisible();
    }

    expect(offenders, `console offenders:\n${offenders.join('\n')}`).toEqual([]);
  });
});
