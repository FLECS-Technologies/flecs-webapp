/*
 * Copyright (c) 2025 FLECS Technologies GmbH
 *
 * Created on Nov 11 2025
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AuthGuard } from '../AuthGuard';
import { AuthContextValue } from '../../providers/oauth/types';

// Mock DeviceLogin component
vi.mock('../../../pages/DeviceLogin', () => ({
  default: () => <div data-testid="device-login">Device Login</div>,
}));

// Mock Material-UI components to simplify testing
vi.mock('@mui/material', () => ({
  Box: ({ children, ...props }: any) => (
    <div data-testid="box" {...props}>
      {children}
    </div>
  ),
  CircularProgress: () => <div data-testid="circular-progress">Loading...</div>,
  Typography: ({ children, ...props }: any) => (
    <div data-testid="typography" {...props}>
      {children}
    </div>
  ),
}));

describe('AuthGuard', () => {
  let mockAuth: AuthContextValue;
  const mockChildren = <div data-testid="protected-content">Protected Content</div>;

  // Mock window.location properly
  const mockLocation = {
    pathname: '/dashboard',
    hash: '#/dashboard',
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock window.location with hash property
    Object.defineProperty(window, 'location', {
      value: mockLocation,
      writable: true,
    });

    // Default mock auth state
    mockAuth = {
      isAuthenticated: false,
      isLoading: false,
      user: null,
      error: null,
      signIn: vi.fn(),
      signOut: vi.fn(),
      clearError: vi.fn(),
      handleOAuthCallback: vi.fn(),
      refreshAuthState: vi.fn(),
      isConfigReady: true,
    };
  });

  it('renders children when user is authenticated', () => {
    mockAuth.isAuthenticated = true;

    render(<AuthGuard auth={mockAuth}>{mockChildren}</AuthGuard>);

    expect(screen.getByTestId('protected-content')).toBeInTheDocument();
    expect(screen.queryByTestId('device-login')).not.toBeInTheDocument();
    expect(screen.queryByTestId('circular-progress')).not.toBeInTheDocument();
  });

  it('renders DeviceLogin when user is not authenticated', () => {
    mockAuth.isAuthenticated = false;

    render(<AuthGuard auth={mockAuth}>{mockChildren}</AuthGuard>);

    expect(screen.getByTestId('device-login')).toBeInTheDocument();
    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
  });

  it('renders loading state when authentication is loading', () => {
    mockAuth.isLoading = true;

    render(<AuthGuard auth={mockAuth}>{mockChildren}</AuthGuard>);

    expect(screen.getByTestId('circular-progress')).toBeInTheDocument();
    expect(screen.getByText('Loading authentication...')).toBeInTheDocument();
    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
    expect(screen.queryByTestId('device-login')).not.toBeInTheDocument();
  });

  it('renders error state when authentication has an error', () => {
    mockAuth.error = new Error('Authentication failed');

    render(<AuthGuard auth={mockAuth}>{mockChildren}</AuthGuard>);

    expect(screen.getByText('Authentication Error')).toBeInTheDocument();
    expect(screen.getByText('Authentication failed')).toBeInTheDocument();
    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
    expect(screen.queryByTestId('device-login')).not.toBeInTheDocument();
  });

  it('bypasses auth guard for OAuth callback route', () => {
    mockLocation.hash = '#/oauth/callback';
    mockAuth.isAuthenticated = false;

    render(<AuthGuard auth={mockAuth}>{mockChildren}</AuthGuard>);

    expect(screen.getByTestId('protected-content')).toBeInTheDocument();
    expect(screen.queryByTestId('device-login')).not.toBeInTheDocument();
  });

  it('bypasses auth guard for UI OAuth callback route', () => {
    mockLocation.hash = '#/ui/oauth/callback';
    mockAuth.isAuthenticated = false;

    render(<AuthGuard auth={mockAuth}>{mockChildren}</AuthGuard>);

    expect(screen.getByTestId('protected-content')).toBeInTheDocument();
    expect(screen.queryByTestId('device-login')).not.toBeInTheDocument();
  });

  it('handles multiple children elements', () => {
    mockAuth.isAuthenticated = true;
    const multipleChildren = (
      <>
        <div data-testid="child-1">Child 1</div>
        <div data-testid="child-2">Child 2</div>
      </>
    );

    render(<AuthGuard auth={mockAuth}>{multipleChildren}</AuthGuard>);

    expect(screen.getByTestId('child-1')).toBeInTheDocument();
    expect(screen.getByTestId('child-2')).toBeInTheDocument();
  });

  it('prioritizes error state over loading state', () => {
    mockLocation.hash = '#/dashboard'; // Reset to non-callback route
    mockAuth.isLoading = true;
    mockAuth.error = new Error('Some error');

    render(<AuthGuard auth={mockAuth}>{mockChildren}</AuthGuard>);

    expect(screen.getByText('Authentication Error')).toBeInTheDocument();
    expect(screen.getByText('Some error')).toBeInTheDocument();
    expect(screen.queryByTestId('circular-progress')).not.toBeInTheDocument();
  });

  it('prioritizes error state over unauthenticated state', () => {
    mockLocation.hash = '#/dashboard'; // Reset to non-callback route
    mockAuth.isAuthenticated = false;
    mockAuth.error = new Error('Auth error');

    render(<AuthGuard auth={mockAuth}>{mockChildren}</AuthGuard>);

    expect(screen.getByText('Authentication Error')).toBeInTheDocument();
    expect(screen.getByText('Auth error')).toBeInTheDocument();
    expect(screen.queryByTestId('device-login')).not.toBeInTheDocument();
  });

  it('handles callback route with nested path', () => {
    mockLocation.hash = '#/app/ui/oauth/callback';
    mockAuth.isAuthenticated = false;

    render(<AuthGuard auth={mockAuth}>{mockChildren}</AuthGuard>);

    expect(screen.getByTestId('protected-content')).toBeInTheDocument();
    expect(screen.queryByTestId('device-login')).not.toBeInTheDocument();
  });

  it('does not bypass auth for routes that only contain callback in path', () => {
    mockLocation.hash = '#/dashboard/callback/settings';
    mockAuth.isAuthenticated = false;

    render(<AuthGuard auth={mockAuth}>{mockChildren}</AuthGuard>);

    expect(screen.getByTestId('device-login')).toBeInTheDocument();
    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
  });
});
