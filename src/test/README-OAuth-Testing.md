# OAuth4WebApiAuthProvider Testing Guide

This directory contains comprehensive mocking utilities for testing components that use the `OAuth4WebApiAuthProvider`. The mock system prevents the common error: `useOAuth4WebApiAuth must be used within OAuth4WebApiAuthProvider` during testing.

## Files Overview

### 1. `__mocks__/OAuth4WebApiAuthProvider.tsx`

The core mock implementation that replaces the real OAuth provider during tests.

### 2. `oauth-setup.ts`

Global setup utilities for Vitest configuration.

### 3. `oauth-test-utils.tsx`

Helper functions and utilities for writing OAuth-related tests.

## Quick Start

### Option 1: Global Mock Setup (Recommended)

The test setup is configured in `vite.config.ts`:

```typescript
// vite.config.ts
test: {
  setupFiles: ['src/test/setup.ts'],
}
```

### Option 2: Per-Test File Setup

```typescript
// YourComponent.test.tsx
import { renderWithOAuthProvider, mockScenarios } from '../test/oauth-test-utils';
import YourComponent from '../YourComponent';

// Mock the provider before importing
vi.mock('@contexts/auth/OAuth4WebApiAuthProvider');

describe('YourComponent', () => {
  test('renders for authenticated user', () => {
    mockScenarios.authenticatedUser();

    const { getByText } = renderWithOAuthProvider(<YourComponent />);
    expect(getByText('Welcome, testuser!')).toBeInTheDocument();
  });
});
```

## Available Test Scenarios

The mock provides several pre-configured scenarios:

```typescript
import { mockScenarios } from '../test/oauth-test-utils';

// Authenticated user with full permissions
mockScenarios.authenticatedUser();

// Unauthenticated user
mockScenarios.unauthenticatedUser();

// Loading state
mockScenarios.loading();

// Error state
mockScenarios.error('Custom error message');

// Config not ready
mockScenarios.configNotReady();

// Limited user (minimal permissions)
mockScenarios.limitedUser();

// Admin user (elevated permissions)
mockScenarios.adminUser();

// Expired token
mockScenarios.expiredToken();

// Sign out in progress
mockScenarios.signingOut();
```

## Custom Configuration

For advanced scenarios, use the `mockOAuth4WebApiAuth` utilities:

```typescript
import { mockOAuth4WebApiAuth, renderWithOAuthProvider } from '../test/oauth-test-utils';

test('custom user configuration', () => {
  // Set custom authenticated state
  mockOAuth4WebApiAuth.setAuthenticated(true, {
    sub: 'custom-user-123',
    preferred_username: 'customuser',
    email: 'custom@example.com',
    realm_access: { roles: ['custom-role'] }
  });

  const { getByText } = renderWithOAuthProvider(<YourComponent />);
  expect(getByText('Welcome, customuser!')).toBeInTheDocument();
});
```

## Testing OAuth Functions

```typescript
import { mockOAuth4WebApiAuth } from '../test/oauth-test-utils';

test('sign out functionality', async () => {
  const mockSignOut = vi.fn().mockResolvedValue(undefined);
  mockOAuth4WebApiAuth.mockSignOut(mockSignOut);

  const { getByText } = renderWithOAuthProvider(<YourComponent />);

  fireEvent.click(getByText('Sign Out'));
  expect(mockSignOut).toHaveBeenCalled();
});
```

## Mock User Data

The default mock user has the following structure:

```typescript
{
  sub: 'test-user-123',
  email: 'test@example.com',
  name: 'Test User',
  preferred_username: 'testuser',
  exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour from now
  realm_access: {
    roles: ['user', 'admin']
  },
  resource_access: {
    'test-client': {
      roles: ['manage-account', 'view-profile']
    }
  },
  access_token: 'mock-access-token'
}
```

## Complete Test Example

```typescript
import { render, fireEvent, waitFor } from '@testing-library/react';
import { mockScenarios, mockOAuth4WebApiAuth, renderWithOAuthProvider } from '../test/oauth-test-utils';
import Profile from '../pages/Profile';

// Mock the OAuth provider
vi.mock('@contexts/auth/OAuth4WebApiAuthProvider');

describe('Profile Component', () => {
  beforeEach(() => {
    mockOAuth4WebApiAuth.reset();
  });

  test('displays user information when authenticated', () => {
    mockScenarios.authenticatedUser();

    const { getByText } = renderWithOAuthProvider(<Profile />);

    expect(getByText('testuser')).toBeInTheDocument();
    expect(getByText('test@example.com')).toBeInTheDocument();
  });

  test('shows loading state', () => {
    mockScenarios.loading();

    const { getByTestId } = renderWithOAuthProvider(<Profile />);

    expect(getByTestId('loading')).toBeInTheDocument();
  });

  test('handles sign out', async () => {
    mockScenarios.authenticatedUser();
    const mockSignOut = vi.fn().mockResolvedValue(undefined);
    mockOAuth4WebApiAuth.mockSignOut(mockSignOut);

    const { getByText } = renderWithOAuthProvider(<Profile />);

    fireEvent.click(getByText('Sign Out'));

    await waitFor(() => {
      expect(mockSignOut).toHaveBeenCalled();
    });
  });

  test('displays error message', () => {
    mockScenarios.error('Authentication failed');

    const { getByText } = renderWithOAuthProvider(<Profile />);

    expect(getByText('Authentication failed')).toBeInTheDocument();
  });

  test('shows admin features for admin users', () => {
    mockScenarios.adminUser();

    const { getByText } = renderWithOAuthProvider(<Profile />);

    expect(getByText('super-admin')).toBeInTheDocument();
  });
});
```

## Best Practices

1. **Always reset mocks** between tests using `mockOAuth4WebApiAuth.reset()`
2. **Use scenarios** for common test cases instead of manual configuration
3. **Mock specific functions** when testing interactions (signIn, signOut, etc.)
4. **Test all auth states** - authenticated, unauthenticated, loading, error
5. **Test role-based functionality** using different user scenarios
6. **Use renderWithOAuthProvider** for components that need OAuth context

## Common Patterns

### Testing Protected Routes

```typescript
test('redirects unauthenticated users', () => {
  mockScenarios.unauthenticatedUser();
  // Test redirect logic
});

test('allows authenticated users', () => {
  mockScenarios.authenticatedUser();
  // Test access granted
});
```

### Testing Role-Based Features

```typescript
test('admin features visible to admin', () => {
  mockScenarios.adminUser();
  // Test admin UI
});

test('admin features hidden from regular users', () => {
  mockScenarios.limitedUser();
  // Test limited UI
});
```

### Testing Async Operations

```typescript
test('handles sign in process', async () => {
  mockOAuth4WebApiAuth.mockSignIn(async () => {
    mockOAuth4WebApiAuth.setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 100));
    mockOAuth4WebApiAuth.setAuthenticated(true);
  });

  // Test the sign in flow
});
```

This comprehensive mock system ensures that all your OAuth-related components can be tested without context provider errors, while providing realistic authentication scenarios.
