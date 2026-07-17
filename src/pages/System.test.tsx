/**
 * System page - integration test.
 * MSW returns mock system info + license status. Verify rendering.
 */
import { describe, it, expect } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@test/test-utils';
import System from './System';

describe('System page', () => {
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
      expect(screen.getByRole('heading', { name: 'FLECS' })).toBeTruthy();
      expect(screen.getByText('Web app')).toBeTruthy();
    });
  });

  it('opens an accessible SBOM export dialog', async () => {
    const user = userEvent.setup();
    renderWithProviders(<System />, { route: '/system' });
    await user.click(await screen.findByRole('button', { name: 'Export' }));
    expect(screen.getByRole('dialog', { name: 'Export software bill of materials' })).toBeTruthy();
    expect(screen.getByText('SPDX')).toBeTruthy();
    expect(screen.getByText('CycloneDX')).toBeTruthy();
    expect(screen.getByRole('checkbox', { name: /Core/ })).toBeTruthy();
    expect(screen.getByRole('checkbox', { name: /Web app/ })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Export 4 files' })).toBeTruthy();
  });

  it('groups migration actions and export history', async () => {
    renderWithProviders(<System />, { route: '/system' });
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Backup & migration' })).toBeTruthy();
      expect(screen.getByText('Export this device')).toBeTruthy();
      expect(screen.getByText('Import to this device')).toBeTruthy();
      expect(screen.getByText('Recent exports')).toBeTruthy();
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

  it('opens focused backup and restore dialogs', async () => {
    const user = userEvent.setup();
    renderWithProviders(<System />, { route: '/system' });

    await user.click(await screen.findByRole('button', { name: 'Create backup' }));
    expect(screen.getByText('Create a device backup')).toBeTruthy();
    expect(screen.getByText('Included in this backup')).toBeTruthy();
    expect(screen.getAllByRole('button', { name: 'Create backup' })).toHaveLength(2);
    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    await user.click(screen.getByRole('button', { name: 'Restore backup' }));
    expect(screen.getByText('Restore from a backup')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Drop a backup here or browse' })).toBeTruthy();
    expect(screen.getByText(/Restoring may replace configuration/)).toBeTruthy();
  });
});
