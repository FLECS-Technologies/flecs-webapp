/**
 * Installed Apps - integration test.
 */
import { describe, it, expect, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { renderWithProviders } from '@test/test-utils';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { server } from '@test/msw-setup';
import { getGetManifestsAppNameVersionMockHandler } from '@generated/core/manifests/manifests.msw';

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

import InstalledApps from './InstalledApps';
import { fireEvent } from '@testing-library/react';

const MULTI_APP = {
  appKey: { name: 'tech.flecs.node-red', version: '1.0.0' },
  status: 'installed',
  desired: 'installed',
  installedSize: 1024,
  multiInstance: false,
};

const SINGLE_APP = {
  appKey: { name: 'tech.flecs.single', version: '1.0.0' },
  status: 'installed',
  desired: 'installed',
  installedSize: 1024,
  multiInstance: false,
};

const INSTANCE_A = {
  instanceId: 'abc12345',
  instanceName: 'production',
  appKey: MULTI_APP.appKey,
  status: 'running',
  desired: 'running',
  editors: [],
};

const INSTANCE_B = {
  instanceId: 'def67890',
  instanceName: 'staging',
  appKey: MULTI_APP.appKey,
  status: 'stopped',
  desired: 'stopped',
  editors: [],
};

const MULTI_MANIFEST = {
  _schemaVersion: '3.0.0',
  app: MULTI_APP.appKey.name,
  version: MULTI_APP.appKey.version,
  image: 'node-red:latest',
  multiInstance: true,
};

const SINGLE_MANIFEST = {
  _schemaVersion: '3.0.0',
  app: SINGLE_APP.appKey.name,
  version: SINGLE_APP.appKey.version,
  image: 'single:latest',
  multiInstance: false,
};

function mockInstalledApps(overrides?: {
  apps?: unknown[];
  instances?: unknown[];
  onCreate?: (body: unknown) => void;
  onStart?: (instanceId: string) => void;
  onDeleteApp?: (app: string) => void;
  onDeleteInstance?: (instanceId: string) => void;
}) {
  const manifests = [MULTI_MANIFEST, SINGLE_MANIFEST];
  server.use(
    http.get('*/apps', () => HttpResponse.json(overrides?.apps ?? [MULTI_APP])),
    http.get('*/instances', () =>
      HttpResponse.json(overrides?.instances ?? [INSTANCE_A, INSTANCE_B]),
    ),
    getGetManifestsAppNameVersionMockHandler(
      ({ params }) =>
        manifests.find(
          (manifest) => manifest.app === params.appName && manifest.version === params.version,
        ) ?? {
          _schemaVersion: '3.0.0',
          app: String(params.appName),
          version: String(params.version),
          image: 'unknown:latest',
          multiInstance: false,
        },
    ),
    http.get('*/quests/:id', ({ params }) =>
      HttpResponse.json({
        id: Number(params.id),
        description: 'quest',
        result: params.id === '101' ? 'new-instance-id' : undefined,
        state: 'success',
      }),
    ),
    http.post('*/instances/create', async ({ request }) => {
      const body = await request.json();
      overrides?.onCreate?.(body);
      return HttpResponse.json({ jobId: 101 }, { status: 202 });
    }),
    http.post('*/instances/:instanceId/start', ({ params }) => {
      overrides?.onStart?.(String(params.instanceId));
      return HttpResponse.json({ jobId: 102 }, { status: 202 });
    }),
    http.delete('*/apps/:app', ({ params }) => {
      overrides?.onDeleteApp?.(String(params.app));
      return HttpResponse.json({ jobId: 201 }, { status: 202 });
    }),
    http.delete('*/instances/:instanceId', ({ params }) => {
      overrides?.onDeleteInstance?.(String(params.instanceId));
      return HttpResponse.json({ jobId: 202 }, { status: 202 });
    }),
  );
}

async function findInstalledRowTitle(appName: string, instanceName: string) {
  const title = `${appName} (${instanceName})`;
  await waitFor(() => {
    expect(
      screen
        .getAllByText((_, element) => element?.textContent === title)
        .some((element) => element.className === 'text-sm truncate'),
    ).toBe(true);
  });
}

describe('Installed Apps', () => {
  it('renders installed apps heading', async () => {
    renderWithProviders(<InstalledApps />, { route: '/' });
    await waitFor(() => {
      expect(screen.getByText(/installed apps/i)).toBeTruthy();
    });
  });

  it('shows the skeleton while loading, never the "not ready" flash, then the data', async () => {
    // Regression: ping/app-list are in-flight on first render. The page must show
    // the skeleton - not "FLECS services are not ready" - so a reload goes straight
    // from skeleton to data with nothing flashing in between.
    const { container } = renderWithProviders(<InstalledApps />, { route: '/' });

    expect(screen.queryByText(/not ready/i)).toBeNull();
    expect(container.querySelector('.animate-pulse')).toBeTruthy();

    await waitFor(() => {
      expect(screen.getByText(/installed apps/i)).toBeTruthy();
    });
    expect(screen.queryByText(/not ready/i)).toBeNull();
  });

  it('starts the sideload stepper when a manifest is dropped on the deploy card', async () => {
    renderWithProviders(<InstalledApps />, { route: '/' });
    const card = await screen.findByTestId('sideload-dropzone');

    const manifest = new File(['{"app":"tech.flecs.test","version":"1.0.0"}'], 'manifest.json', {
      type: 'application/json',
    });
    fireEvent.drop(card, { dataTransfer: { files: [manifest] } });

    await waitFor(() => {
      expect(screen.getByText('Installing Sideloaded App')).toBeInTheDocument();
    });
  });

  it('does not start the stepper for a non-json drop', async () => {
    renderWithProviders(<InstalledApps />, { route: '/' });
    const card = await screen.findByTestId('sideload-dropzone');

    const png = new File(['x'], 'image.png', { type: 'image/png' });
    fireEvent.drop(card, { dataTransfer: { files: [png] } });

    await waitFor(() => {
      expect(screen.queryByText('Installing Sideloaded App')).not.toBeInTheDocument();
    });
  });

  it('renders each app instance as its own installed app row', async () => {
    mockInstalledApps();
    renderWithProviders(<InstalledApps />, { route: '/' });

    await findInstalledRowTitle('tech.flecs.node-red', 'production');
    await findInstalledRowTitle('tech.flecs.node-red', 'staging');
  });

  it('shows Duplicate app when the generated manifests response marks the app multi-instance capable', async () => {
    mockInstalledApps({
      apps: [MULTI_APP, SINGLE_APP],
      instances: [INSTANCE_A],
    });
    renderWithProviders(<InstalledApps />, { route: '/' });

    await findInstalledRowTitle('tech.flecs.node-red', 'production');
    const actionButtons = await screen.findAllByRole('button', { name: /actions/i });
    await userEvent.click(actionButtons[0]);

    expect(screen.getByRole('button', { name: /duplicate app/i })).toBeInTheDocument();
  });

  it('hides Duplicate app when the generated manifest does not claim multi-instance capability', async () => {
    mockInstalledApps({
      apps: [SINGLE_APP],
      instances: [{ ...INSTANCE_A, appKey: SINGLE_APP.appKey }],
    });
    renderWithProviders(<InstalledApps />, { route: '/' });

    await screen.findByText('tech.flecs.single');
    expect(screen.queryByText('production')).not.toBeInTheDocument();
    const actionButtons = await screen.findAllByRole('button', { name: /actions/i });
    await userEvent.click(actionButtons[0]);

    expect(screen.queryByRole('button', { name: /duplicate app/i })).not.toBeInTheDocument();
  });

  it('duplicates a multi-instance app with the generated create body and starts the new instance', async () => {
    const onCreate = vi.fn();
    const onStart = vi.fn();
    mockInstalledApps({ onCreate, onStart });
    renderWithProviders(<InstalledApps />, { route: '/' });

    await findInstalledRowTitle('tech.flecs.node-red', 'production');
    const actionButtons = await screen.findAllByRole('button', { name: /actions/i });
    await userEvent.click(actionButtons[0]);
    await userEvent.click(screen.getByRole('button', { name: /duplicate app/i }));
    await userEvent.type(screen.getByLabelText(/instance name/i), 'main-controller');
    await userEvent.click(screen.getByRole('button', { name: /create "main-controller"/i }));

    await waitFor(() =>
      expect(onCreate).toHaveBeenCalledWith({
        appKey: { name: 'tech.flecs.node-red', version: '1.0.0' },
        instanceName: 'main-controller',
      }),
    );
    await waitFor(() => expect(onStart).toHaveBeenCalledWith('new-instance-id'));
  });

  it('allows creating a duplicate without an instance name', async () => {
    const onCreate = vi.fn();
    mockInstalledApps({ onCreate });
    renderWithProviders(<InstalledApps />, { route: '/' });

    await findInstalledRowTitle('tech.flecs.node-red', 'production');
    const actionButtons = await screen.findAllByRole('button', { name: /actions/i });
    await userEvent.click(actionButtons[0]);
    await userEvent.click(screen.getByRole('button', { name: /duplicate app/i }));
    expect(
      screen.getByText(/cannot be changed after the instance is created/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/Instance abcd1234/)).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /^skip name$/i }));

    await waitFor(() =>
      expect(onCreate).toHaveBeenCalledWith({
        appKey: { name: 'tech.flecs.node-red', version: '1.0.0' },
      }),
    );
  });

  it('deletes the row instance instead of uninstalling the whole multi-instance app', async () => {
    const onDeleteApp = vi.fn();
    const onDeleteInstance = vi.fn();
    mockInstalledApps({ onDeleteApp, onDeleteInstance });
    renderWithProviders(<InstalledApps />, { route: '/' });

    await findInstalledRowTitle('tech.flecs.node-red', 'staging');
    await userEvent.click(screen.getByRole('button', { name: /staging actions/i }));

    expect(screen.queryByRole('button', { name: /uninstall app/i })).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /delete instance/i }));
    await userEvent.click(screen.getByRole('button', { name: /^delete instance$/i }));

    await waitFor(() => expect(onDeleteInstance).toHaveBeenCalledWith('def67890'));
    expect(onDeleteApp).not.toHaveBeenCalled();
  });

  it('uninstalls the app when deleting the only remaining multi-instance app instance', async () => {
    const onDeleteApp = vi.fn();
    const onDeleteInstance = vi.fn();
    mockInstalledApps({
      instances: [INSTANCE_A],
      onDeleteApp,
      onDeleteInstance,
    });
    renderWithProviders(<InstalledApps />, { route: '/' });

    await findInstalledRowTitle('tech.flecs.node-red', 'production');
    await userEvent.click(screen.getByRole('button', { name: /production actions/i }));

    expect(screen.queryByRole('button', { name: /delete instance/i })).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /uninstall app/i }));
    await userEvent.click(screen.getByRole('button', { name: /^uninstall app$/i }));

    await waitFor(() => expect(onDeleteApp).toHaveBeenCalledWith('tech.flecs.node-red'));
    expect(onDeleteInstance).not.toHaveBeenCalled();
  });
});
