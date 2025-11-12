/**
 * Comprehensive mock for @flecs/auth-provider-client-ts
 * This provides a centralized way to mock all auth provider API calls
 * Using Vitest mocking functions
 * Based on the actual API implementation from auth-provider-client
 */
import { vi } from 'vitest';

// Mock SuperAdmin interface matching the actual API
export interface SuperAdmin {
  full_name: string;
  name: string;
  password: string;
}

// Mock API responses based on the actual API implementation
export const createMockSuperAdmin = (overrides: Partial<SuperAdmin> = {}): SuperAdmin => ({
  full_name: 'Administrator',
  name: 'admin',
  password: 'password123',
  ...overrides,
});

export const createMockJwk = (overrides = {}) => ({
  keys: [
    {
      kty: 'RSA',
      kid: 'mock-key-id',
      use: 'sig',
      alg: 'RS256',
      n: 'mock-modulus',
      e: 'AQAB',
    },
  ],
  ...overrides,
});

// Mock API classes and methods based on the actual ExperimentalApi class
export const createMockAuthProviderApi = (customMocks = {}) => {
  const defaultMocks = {
    // Method names that match the actual generated client
    getIssuer: vi.fn(() =>
      Promise.resolve({
        status: 200,
        data: 'http://localhost:8080/auth',
      }),
    ),

    getJwk: vi.fn(() =>
      Promise.resolve({
        status: 200,
        data: createMockJwk(),
      }),
    ),

    getSuperAdmin: vi.fn(() => Promise.resolve({ status: 204 })), // 204 = exists, 404 = doesn't exist
    postSuperAdmin: vi.fn((superAdmin: SuperAdmin) =>
      Promise.resolve({
        status: 200,
        data: {},
      }),
    ),
  };

  // Deep merge custom mocks with defaults
  const mergeDeep = (target: any, source: any): any => {
    for (const key in source) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        target[key] = target[key] || {};
        mergeDeep(target[key], source[key]);
      } else {
        target[key] = source[key];
      }
    }
    return target;
  };

  return mergeDeep(defaultMocks, customMocks);
};

// Mock the entire @flecs/auth-provider-client-ts module
export const mockAuthProviderClientTs = () => ({
  Configuration: vi.fn(() => ({
    basePath: 'http://localhost:8080/providers/auth/core',
  })),

  // API Classes - matching the actual implementation
  ExperimentalApi: vi.fn(() => createMockAuthProviderApi()),

  // Types from the actual implementation
  SuperAdmin: {},
});

// Helper to reset all auth provider mocks
export const resetAllAuthProviderMocks = (api: any) => {
  if (api) {
    Object.values(api).forEach((fn) => {
      if (vi.isMockFunction(fn)) {
        vi.clearAllMocks();
      }
    });
  }
};

// Helper to setup super admin scenarios based on the actual API behavior
export const setupSuperAdminExists = (api: any, exists = true) => {
  if (exists) {
    // 204 = Super admin exists (void response)
    api.getSuperAdmin.mockResolvedValue({ status: 204 });
  } else {
    // 404 = Super admin does not exist
    const error = new Error('Super admin does not exist');
    (error as any).response = { status: 404 };
    api.getSuperAdmin.mockRejectedValue(error);
  }
};

// Helper to setup super admin creation scenarios
export const setupSuperAdminCreation = (api: any, shouldSucceed = true, errorMessage?: string) => {
  if (shouldSucceed) {
    // Void response for successful creation
    api.postSuperAdmin.mockResolvedValue({
      status: 200,
      data: {},
    });
  } else {
    const error = new Error(errorMessage || 'Failed to create super admin');
    api.postSuperAdmin.mockRejectedValue(error);
  }
};

// Helper to setup issuer endpoint
export const setupIssuer = (api: any, issuerUri = 'http://localhost:8080/auth') => {
  api.getIssuer.mockResolvedValue({
    status: 200,
    data: issuerUri,
  });
};

// Helper to setup JWK endpoint
export const setupJwk = (api: any, jwkData?: any) => {
  api.getJwk.mockResolvedValue({
    status: 200,
    data: jwkData || createMockJwk(),
  });
};

export default mockAuthProviderClientTs;
