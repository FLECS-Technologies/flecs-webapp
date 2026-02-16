import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import PoweredByFLECS from '../PoweredBy';

// Mock FLECSLogo to avoid rendering SVGs or images
vi.mock('../FLECSLogo', () => ({
  default: () => <div data-testid="flecs-logo" />,
}));

// Mock react-router-dom's useSearchParams
const setSearchParamsMock = vi.fn();
let params = new URLSearchParams();

vi.mock('react-router-dom', async () => {
  const actual = await import('react-router-dom');
  return {
    ...actual,
    useSearchParams: () => [params, setSearchParamsMock],
  };
});

describe('PoweredByFLECS', () => {
  beforeEach(() => {
    params = new URLSearchParams();
    setSearchParamsMock.mockReset();
  });

  it('renders the powered by link and logo when visible', () => {
    params.set('hideappbar', 'true');
    render(<PoweredByFLECS />);
    expect(screen.getByRole('link', { name: /powered-by-link/i })).toBeInTheDocument();
    expect(screen.getByText(/powered by FLECS/i)).toBeInTheDocument();
    expect(screen.getByTestId('flecs-logo')).toBeInTheDocument();
  });

  it('does not render the powered by link when not visible', () => {
    params.set('hideappbar', 'false');
    render(<PoweredByFLECS />);
    expect(screen.queryByRole('link', { name: /powered-by-link/i })).not.toBeInTheDocument();
    expect(screen.queryByText(/powered by FLECS/i)).not.toBeInTheDocument();
  });

  it('does not render the powered by link when hideappbar param is missing', () => {
    params = new URLSearchParams();
    render(<PoweredByFLECS />);
    expect(screen.queryByRole('link', { name: /powered-by-link/i })).not.toBeInTheDocument();
  });
});
