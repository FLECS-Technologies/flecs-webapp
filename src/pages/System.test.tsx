/**
 * System page - integration test.
 * MSW returns mock system info + license status. Verify rendering.
 */
import { beforeEach, describe, it, expect, onTestFinished, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { renderWithProviders } from '@test/test-utils';
import { server } from '@test/msw-setup';
import System from './System';

describe('System page', () => {
  beforeEach(() => {
    server.use(
      http.get('*/apps', () =>
        HttpResponse.json([
          {
            appKey: { name: 'tech.flecs.node-red', version: '4.0.2' },
            status: 'installed',
            desired: 'installed',
            installedSize: 1024,
            multiInstance: false,
          },
          {
            appKey: { name: 'com.example.dashboard', version: '1.3.0' },
            status: 'installed',
            desired: 'installed',
            installedSize: 2048,
            multiInstance: false,
          },
        ]),
      ),
      http.get('*/instances', () => HttpResponse.json([])),
      http.get('*/providers/auth', () =>
        HttpResponse.json({
          core: '00000001',
          default: '00000001',
          providers: {},
        }),
      ),
    );
  });

  it('renders system heading', async () => {
    renderWithProviders(<System />, { route: '/system' });
    expect(screen.getByRole('heading', { level: 1, name: 'System' })).toBeTruthy();
    expect(screen.getByRole('status', { name: 'Loading system information' })).toBeTruthy();
  });

  it('shows the live device overview and license details', async () => {
    renderWithProviders(<System />, { route: '/system' });
    await waitFor(() => {
      expect(screen.getByRole('region', { name: 'Device overview' })).toBeTruthy();
      expect(screen.getByRole('heading', { name: 'License' })).toBeTruthy();
      expect(screen.getByRole('heading', { name: 'System details' })).toBeTruthy();
      expect(screen.getByText('Architecture')).toBeTruthy();
      expect(screen.getByText('Kernel build')).toBeTruthy();
      expect(screen.getByText('Core connected')).toBeTruthy();
    });
  });

  it('shows FLECS component versions', async () => {
    renderWithProviders(<System />, { route: '/system' });
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'FLECS Version' })).toBeTruthy();
      expect(screen.getByText('Web app')).toBeTruthy();
    });
  });

  it('opens an accessible SBOM export dialog', async () => {
    const user = userEvent.setup();
    renderWithProviders(<System />, { route: '/system' });
    await user.click(await screen.findByRole('button', { name: 'Export SBOM' }));
    expect(screen.getByRole('dialog', { name: 'Export software bill of materials' })).toBeTruthy();
    expect(screen.getByText('SPDX')).toBeTruthy();
    expect(screen.getByText('CycloneDX')).toBeTruthy();
    expect(screen.getByRole('checkbox', { name: /Core/ })).toBeTruthy();
    expect(screen.getByRole('checkbox', { name: /Web app/ })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Export 4 files' })).toBeTruthy();
  });

  it('exports the web app CycloneDX SBOM', async () => {
    const user = userEvent.setup();

    // Downloads go through a synthetic <a download>, and jsdom implements no
    // navigation, so record the click instead of letting it warn.
    const downloads: string[] = [];
    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (
      this: HTMLAnchorElement,
    ) {
      downloads.push(this.download);
    });
    onTestFinished(() => clickSpy.mockRestore());

    renderWithProviders(<System />, { route: '/system' });
    await user.click(await screen.findByRole('button', { name: 'Export SBOM' }));

    await user.click(screen.getByRole('checkbox', { name: /Core/ }));
    await user.click(screen.getByRole('checkbox', { name: /SPDX/ }));
    expect(screen.getByRole('checkbox', { name: /CycloneDX/ })).toHaveAttribute(
      'aria-checked',
      'true',
    );

    await user.click(screen.getByRole('button', { name: 'Export 1 file' }));

    await waitFor(() => expect(downloads).toEqual(['webapp.sbom.cyclonedx.json']));
    // The dialog closes only after every selected file reached the browser.
    expect(screen.queryByRole('dialog', { name: 'Export software bill of materials' })).toBeNull();
  });

  it('groups migration actions and export history', async () => {
    renderWithProviders(<System />, { route: '/system' });
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Backup & migration' })).toBeTruthy();
      expect(screen.getByText('Create a backup')).toBeTruthy();
      expect(screen.getAllByText('Import apps')).toHaveLength(2);
      expect(screen.getByText('Recent backups')).toBeTruthy();
      const openSourceLink = screen.getByRole('link', { name: /Open-source licenses/ });
      expect(openSourceLink).toHaveAttribute('target', '_blank');
      expect(openSourceLink).toHaveAttribute('href', '/open-source');
      expect(screen.getByRole('link', { name: /Docs/ })).toHaveAttribute(
        'href',
        'https://docs.flecs.tech/',
      );
      expect(screen.getByRole('link', { name: /Docs/ })).toHaveAttribute('target', '_blank');
    });
  });

  it('opens focused backup and import dialogs', async () => {
    const user = userEvent.setup();
    renderWithProviders(<System />, { route: '/system' });

    await user.click(await screen.findByRole('button', { name: 'Create backup' }));
    expect(screen.getByRole('dialog', { name: 'Create backup' })).toBeTruthy();
    expect(screen.getByText('Choose apps')).toBeTruthy();
    expect(await screen.findByText('No apps available to back up.')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Select at least one app' })).toBeDisabled();
    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    await user.click(screen.getByRole('button', { name: 'Import apps' }));
    const importDialog = screen.getByRole('dialog', { name: 'Import apps' });
    expect(importDialog).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Drop apps.json or a backup here' })).toBeTruthy();
    expect(screen.getByText(/Device Onboarding Service \(D-O-S\)/)).toBeTruthy();
    expect(screen.getByRole('link', { name: 'How to create apps.json' })).toHaveAttribute(
      'href',
      'https://docs.flecs.tech/flecs-marketplace/device-onboarding-service-d-o-s/',
    );
  });
});
