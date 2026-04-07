/**
 * Service Mesh — integration test.
 */
import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '@test/test-utils';
import ServiceMesh from './ServiceMesh';

describe('Service Mesh', () => {
  it('renders service mesh heading', async () => {
    renderWithProviders(<ServiceMesh />, { route: '/service-mesh' });
    expect(screen.getByText('Service Mesh')).toBeTruthy();
  });
});
