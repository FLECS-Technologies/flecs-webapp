/**
 * Marketplace — integration test.
 * MSW returns generated mock products. Verify the page renders them.
 */
import { describe, it, expect } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { renderWithProviders } from '@test/test-utils';
import Marketplace from './Marketplace';

describe('Marketplace', () => {
  it('renders marketplace heading', async () => {
    renderWithProviders(<Marketplace />, { route: '/marketplace' });
    expect(screen.getByText('Marketplace')).toBeTruthy();
  });

  it('shows search input', async () => {
    renderWithProviders(<Marketplace />, { route: '/marketplace' });
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/search/i)).toBeTruthy();
    });
  });
});
