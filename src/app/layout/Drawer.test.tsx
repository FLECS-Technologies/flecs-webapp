/**
 * Drawer — Editors section integration test.
 * MSW overrides GET /apps + GET /instances with concrete data; the section
 * must list editors of running instances and hide itself otherwise.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { renderWithProviders } from '@test/test-utils';
import { server } from '@test/msw-setup';
import { ThemeHandler } from '@app/theme/ThemeHandler';

vi.mock('@features/auth/AuthProvider', () => ({
  useOAuth4WebApiAuth: () => ({
    isAuthenticated: true,
    isLoading: false,
    user: { sub: 'test', access_token: 'test-token' },
    signIn: vi.fn(),
    signOut: vi.fn(),
    isConfigReady: true,
    handleOAuthCallback: vi.fn(),
    clearError: vi.fn(),
    refreshAuthState: vi.fn(),
    error: null,
  }),
}));

import Drawer from './Drawer';

// jsdom has no matchMedia — stub for the mobile breakpoint + theme listeners
beforeEach(() => {
  window.matchMedia = (query: string): MediaQueryList => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  });
});

const APPS = [
  {
    appKey: { name: 'tech.flecs.node-red', version: '1.0.0' },
    status: 'installed',
  },
];

const RUNNING_INSTANCE = {
  instanceId: 'abc123',
  instanceName: 'Instance 1',
  appKey: { name: 'tech.flecs.node-red', version: '1.0.0' },
  status: 'running',
  desired: 'running',
  editors: [{ name: 'Flow Editor', port: 1880, url: '/v2/instances/abc123/editor/1880' }],
};

function mockDevice(instances: unknown[]) {
  server.use(
    http.get('*/apps', () => HttpResponse.json(APPS)),
    http.get('*/instances', () => HttpResponse.json(instances)),
  );
}

function renderDrawer() {
  return renderWithProviders(
    <ThemeHandler>
      <Drawer />
    </ThemeHandler>,
  );
}

describe('Drawer editors section', () => {
  it('lists editors of running instances and opens them in a new tab', async () => {
    mockDevice([RUNNING_INSTANCE]);
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null);
    renderDrawer();

    await waitFor(() => expect(screen.getByText('Editors')).toBeInTheDocument());
    // Manifest editor name is the row label
    const row = screen.getByText('Flow Editor');

    await userEvent.click(row);
    expect(openSpy).toHaveBeenCalledWith(
      expect.stringContaining('/api/v2/instances/abc123/editor/1880'),
    );
    openSpy.mockRestore();
  });

  it('hides the section when no instance is running', async () => {
    mockDevice([{ ...RUNNING_INSTANCE, status: 'stopped' }]);
    renderDrawer();

    // Wait until data has rendered (installed badge appears), then assert no section
    await waitFor(() => expect(screen.getByText('Installed')).toBeInTheDocument());
    await waitFor(() => expect(screen.queryByText('Editors')).not.toBeInTheDocument());
  });
});
