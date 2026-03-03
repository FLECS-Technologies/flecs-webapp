import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';

// Mock the API provider to avoid complex provider chains
vi.mock('@shared/api/ApiProvider', () => ({
  usePublicApi: () => ({}),
  useProtectedApi: () => ({}),
  useApi: () => ({}),
  PublicApiProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  ProtectedApiProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  ApiProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  getBaseURL: () => 'http://localhost',
  host: () => 'http://localhost',
  baseURL: () => '/api/v2',
}));

// Use the existing mock for the OAuth auth provider
vi.mock('@features/auth/providers/OAuth4WebApiAuthProvider');

// Top-level ESM imports (Vitest resolves aliases for these)
import { useDeviceState } from '@stores/device-state';
import NotFound from '@pages/NotFound';
import OpenSource from '@pages/OpenSource';

// ─── Zustand Store ──────────────────────────────────────────────────────────

describe('Zustand stores', () => {
  it('useDeviceState initializes with correct defaults', () => {
    const state = useDeviceState.getState();

    expect(state.loaded).toBe(false);
    expect(state.onboarded).toBe(false);
    expect(state.authenticated).toBe(false);
    expect(typeof state.setLoaded).toBe('function');
    expect(typeof state.setOnboarded).toBe('function');
    expect(typeof state.setAuthenticated).toBe('function');
  });
});

// ─── Page Components ────────────────────────────────────────────────────────

describe('NotFound page', () => {
  it('renders 404 text', () => {
    render(
      <MemoryRouter>
        <NotFound />
      </MemoryRouter>,
    );

    expect(screen.getByText('404')).toBeInTheDocument();
    expect(screen.getByText(/couldn't find that page/i)).toBeInTheDocument();
  });
});

describe('OpenSource page', () => {
  it('renders the Open Source heading', () => {
    render(
      <MemoryRouter>
        <OpenSource />
      </MemoryRouter>,
    );

    expect(screen.getByText('Open Source')).toBeInTheDocument();
  });
});
