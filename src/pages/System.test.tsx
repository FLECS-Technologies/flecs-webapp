/**
 * System page — integration test.
 * MSW returns mock system info + license status. Verify rendering.
 */
import { describe, it, expect } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { renderWithProviders } from '@test/test-utils';
import System from './System';

describe('System page', () => {
  it('renders system heading', async () => {
    renderWithProviders(<System />, { route: '/system' });
    expect(screen.getByText('System')).toBeTruthy();
  });

  it('shows device info section', async () => {
    renderWithProviders(<System />, { route: '/system' });
    await waitFor(() => {
      expect(screen.getByText('Device')).toBeTruthy();
    });
  });

  it('shows license section', async () => {
    renderWithProviders(<System />, { route: '/system' });
    await waitFor(() => {
      expect(screen.getByText('License')).toBeTruthy();
    });
  });

  it('shows version section', async () => {
    renderWithProviders(<System />, { route: '/system' });
    await waitFor(() => {
      expect(screen.getByText(/flecs version/i)).toBeTruthy();
    });
  });
});
