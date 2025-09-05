# Centralized Auth Mocking for Tests

This directory contains centralized mocks for the AuthProvider system that can be reused across all test files.

## Usage

### Basic Auth Mock (Recommended Pattern)

```javascript
// Use async import to avoid hoisting issues with vi.mock
vi.mock('react-oidc-context', async () => {
  const { createMockAuthContext } = await import('../__mocks__/AuthProvider');
  const authMocks = createMockAuthContext();

  return {
    AuthProvider: authMocks.AuthProvider,
    useAuth: authMocks.useAuth,
  };
});

vi.mock('../components/providers/AuthProvider', async () => {
  const { createMockAuthContext } = await import('../__mocks__/AuthProvider');
  const authMocks = createMockAuthContext();

  return {
    AuthProvider: authMocks.AuthProvider,
    useAuth: authMocks.useAuth,
    useAuthConfig: authMocks.useAuthConfig,
    useAuthActions: authMocks.useAuthActions,
  };
});
```

### Pre-configured Auth States

```javascript
// For unauthenticated user tests
vi.mock('react-oidc-context', async () => {
  const { createUnauthenticatedAuthContext } = await import('../__mocks__/AuthProvider');
  const authMocks = createUnauthenticatedAuthContext();

  return {
    AuthProvider: authMocks.AuthProvider,
    useAuth: authMocks.useAuth,
  };
});

// For loading state tests
vi.mock('react-oidc-context', async () => {
  const { createLoadingAuthContext } = await import('../__mocks__/AuthProvider');
  const authMocks = createLoadingAuthContext();

  return {
    AuthProvider: authMocks.AuthProvider,
    useAuth: authMocks.useAuth,
  };
});

// For error state tests
vi.mock('react-oidc-context', async () => {
  const { createErrorAuthContext } = await import('../__mocks__/AuthProvider');
  const authMocks = createErrorAuthContext('Custom error message');

  return {
    AuthProvider: authMocks.AuthProvider,
    useAuth: authMocks.useAuth,
  };
});
```

### Custom Auth Mock

```javascript
vi.mock('react-oidc-context', async () => {
  const { createMockAuthContext, createMockUser } = await import('../__mocks__/AuthProvider');

  // Custom user
  const customUser = createMockUser({
    profile: {
      name: 'Custom User',
      email: 'custom@example.com',
      role: 'admin',
    },
  });

  // Custom auth state
  const authMocks = createMockAuthContext({
    useAuth: vi.fn(() => ({
      user: customUser,
      isAuthenticated: true,
      isLoading: false,
      // ... other auth properties
    })),
  });

  return {
    AuthProvider: authMocks.AuthProvider,
    useAuth: authMocks.useAuth,
  };
});
```

### Test Setup Pattern

```javascript
describe('Component with Auth', () => {
  let authMocks;

  beforeEach(() => {
    vi.clearAllMocks();
    authMocks = createMockAuthContext();
  });

  it('renders for authenticated user', async () => {
    // Test implementation
  });

  it('shows login for unauthenticated user', async () => {
    const unauthMocks = createUnauthenticatedAuthContext();
    // Override mocks for this specific test
    authMocks.useAuth.mockReturnValue(unauthMocks.useAuth());

    // Test implementation
  });
});
```

## Available Mock Functions

- `createMockAuthContext(customMocks)` - Main factory function
- `createUnauthenticatedAuthContext()` - User not logged in
- `createLoadingAuthContext()` - Auth system loading
- `createErrorAuthContext(error)` - Auth system error state
- `createMockUser(overrides)` - Create mock user object
- `createMockOidcConfig(overrides)` - Create mock OIDC configuration
- `resetAllAuthMocks(authMocks)` - Reset all mocks in auth context

## Integration with Existing Tests

All tests should be updated to use these centralized mocks instead of inline auth mocking to ensure consistency and maintainability.

## Important Notes

1. **Hoisting**: Vitest hoists `vi.mock()` calls to the top of the file, so use async imports to avoid reference errors.

2. **Static Mocks**: Once a module is mocked with `vi.mock()`, the mock configuration is static for that test file. For different auth states, consider separate test files or use dynamic imports within tests.

3. **Provider Hierarchy**: Remember to mock both `react-oidc-context` (for OIDC functionality) and your custom `AuthProvider` (for additional auth actions) as needed.

4. **Test Isolation**: Each test file should set up its mocks independently to ensure proper test isolation.

## Example Test Files

See `auth-mock-examples.test.jsx` for comprehensive examples of all usage patterns.
