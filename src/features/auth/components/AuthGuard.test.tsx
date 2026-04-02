import { render, screen } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AuthGuard } from '../AuthGuard';
import { AuthContextValue } from '@features/auth/providers/oauth/types';

vi.mock('@pages/DeviceLogin', () => ({
  default: () => <div data-testid="device-login">Device Login</div>,
}));

describe('AuthGuard', () => {
  let mockAuth: AuthContextValue;
  const mockChildren = <div data-testid="protected-content">Protected Content</div>;
  const mockLocation = { pathname: '/dashboard', hash: '#/dashboard' };

  beforeEach(() => {
    vi.clearAllMocks();
    Object.defineProperty(window, 'location', { value: mockLocation, writable: true });
    mockAuth = { isAuthenticated: false, isLoading: false, user: null, error: null, signIn: vi.fn(), signOut: vi.fn(), clearError: vi.fn(), handleOAuthCallback: vi.fn(), refreshAuthState: vi.fn(), isConfigReady: true };
  });

  it('renders children when user is authenticated', () => {
    mockAuth.isAuthenticated = true;
    render(<AuthGuard auth={mockAuth}>{mockChildren}</AuthGuard>);
    expect(screen.getByTestId('protected-content')).toBeInTheDocument();
  });

  it('renders DeviceLogin when user is not authenticated', () => {
    render(<AuthGuard auth={mockAuth}>{mockChildren}</AuthGuard>);
    expect(screen.getByTestId('device-login')).toBeInTheDocument();
  });

  it('renders loading state when authentication is loading', () => {
    mockAuth.isLoading = true;
    render(<AuthGuard auth={mockAuth}>{mockChildren}</AuthGuard>);
    expect(screen.getByText('Loading authentication...')).toBeInTheDocument();
  });

  it('renders error state when authentication has an error', () => {
    mockAuth.error = new Error('Authentication failed');
    render(<AuthGuard auth={mockAuth}>{mockChildren}</AuthGuard>);
    expect(screen.getByText('Authentication Error')).toBeInTheDocument();
    expect(screen.getByText('Authentication failed')).toBeInTheDocument();
  });

  it('bypasses auth guard for OAuth callback route', () => {
    mockLocation.hash = '#/oauth/callback';
    render(<AuthGuard auth={mockAuth}>{mockChildren}</AuthGuard>);
    expect(screen.getByTestId('protected-content')).toBeInTheDocument();
  });

  it('bypasses auth guard for UI OAuth callback route', () => {
    mockLocation.hash = '#/ui/oauth/callback';
    render(<AuthGuard auth={mockAuth}>{mockChildren}</AuthGuard>);
    expect(screen.getByTestId('protected-content')).toBeInTheDocument();
  });

  it('prioritizes error state over loading state', () => {
    mockLocation.hash = '#/dashboard';
    mockAuth.isLoading = true;
    mockAuth.error = new Error('Some error');
    render(<AuthGuard auth={mockAuth}>{mockChildren}</AuthGuard>);
    expect(screen.getByText('Authentication Error')).toBeInTheDocument();
  });

  it('does not bypass auth for routes that only contain callback in path', () => {
    mockLocation.hash = '#/dashboard/callback/settings';
    render(<AuthGuard auth={mockAuth}>{mockChildren}</AuthGuard>);
    expect(screen.getByTestId('device-login')).toBeInTheDocument();
  });
});
