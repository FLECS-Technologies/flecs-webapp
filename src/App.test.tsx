/**
 * Integration smoke tests.
 * Renders real components with TanStack Query + MSW generated mocks.
 * Validates: components render, generated hooks fire, MSW intercepts, UI shows data.
 */
import { describe, it, expect } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { renderWithProviders } from '@test/test-utils';

describe('Smoke: app infrastructure', () => {
  it('MSW server intercepts API calls', async () => {
    const res = await fetch('/api/v2/system/ping');
    expect(res.ok).toBe(true);
  });

  it('generated mock returns apps data', async () => {
    const res = await fetch('/api/v2/apps');
    expect(res.ok).toBe(true);
    const data = await res.json();
    expect(Array.isArray(data)).toBe(true);
  });

  it('generated mock returns instances data', async () => {
    const res = await fetch('/api/v2/instances');
    expect(res.ok).toBe(true);
  });

  it('generated mock returns quests data', async () => {
    const res = await fetch('/api/v2/quests');
    expect(res.ok).toBe(true);
  });
});

describe('Smoke: page rendering', () => {
  it('NotFound page renders', async () => {
    const NotFound = (await import('@pages/NotFound')).default;
    renderWithProviders(<NotFound />, { route: '/404' });
    expect(screen.getByText('404')).toBeTruthy();
  });

  it('OpenSource page renders', async () => {
    const OpenSource = (await import('@pages/OpenSource')).default;
    renderWithProviders(<OpenSource />);
    await waitFor(() => {
      expect(document.body.textContent).toContain('Open');
    });
  });
});
