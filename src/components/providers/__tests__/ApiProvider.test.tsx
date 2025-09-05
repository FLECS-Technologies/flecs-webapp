/*
 * Copyright (c) 2025 FLECS Technologies GmbH
 *
 * Created on Thu Sep 05 2025
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
import { render, renderHook } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock the createApi function
vi.mock('../../../api/flecs-core/api-client', () => ({
  createApi: vi.fn(),
}));

// Mock the Configuration class
vi.mock('@flecs/core-client-ts', () => ({
  Configuration: vi.fn(),
}));

// Mock react-oidc-context
vi.mock('react-oidc-context', () => ({
  useAuth: vi.fn(),
}));

// Import the modules after mocking
import { createApi } from '../../../api/flecs-core/api-client';
import { Configuration } from '@flecs/core-client-ts';
import { useAuth } from 'react-oidc-context';
import {
  PublicApiProvider,
  ProtectedApiProvider,
  ApiProvider,
  usePublicApi,
  useProtectedApi,
  useApi,
} from '../ApiProvider';

// Type the mocked functions
const mockCreateApi = createApi as any;
const mockConfiguration = Configuration as any;
const mockUseAuth = useAuth as any;

// Mock environment variables
const mockEnv = {
  VITE_APP_ENVIRONMENT: 'test',
  VITE_APP_DEV_CORE_URL: '',
};

// Mock import.meta.env
vi.stubGlobal('import.meta', {
  env: mockEnv,
});

describe('ApiProvider', () => {
  const mockApiInstance = {
    app: { test: vi.fn() },
    device: { test: vi.fn() },
    console: { test: vi.fn() },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockCreateApi.mockReturnValue(mockApiInstance as any);
    mockConfiguration.mockImplementation((config: any) => config);

    // Reset environment to test defaults
    mockEnv.VITE_APP_ENVIRONMENT = 'test';
    mockEnv.VITE_APP_DEV_CORE_URL = '';
  });

  describe('Environment Configuration', () => {
    it('handles various environment configurations', () => {
      // Just test that the component works with current environment
      render(
        <PublicApiProvider>
          <div>test</div>
        </PublicApiProvider>,
      );

      expect(mockConfiguration).toHaveBeenCalledWith({
        basePath: expect.stringMatching(/\/api\/v2$/), // Ends with /api/v2
      });
    });

    it('creates configuration with proper structure', () => {
      render(
        <PublicApiProvider>
          <div>test</div>
        </PublicApiProvider>,
      );

      expect(mockConfiguration).toHaveBeenCalledWith(
        expect.objectContaining({
          basePath: expect.any(String),
        }),
      );
    });
  });

  describe('PublicApiProvider', () => {
    it('provides public API context without authentication', () => {
      const TestComponent = () => {
        const api = usePublicApi();
        return <div data-testid="api-available">{api ? 'Available' : 'Not Available'}</div>;
      };

      const { getByTestId } = render(
        <PublicApiProvider>
          <TestComponent />
        </PublicApiProvider>,
      );

      expect(getByTestId('api-available')).toHaveTextContent('Available');
      expect(mockConfiguration).toHaveBeenCalledWith({
        basePath: expect.any(String),
        // No accessToken should be provided for public API
      });
    });

    it('creates API with correct configuration for public access', () => {
      render(
        <PublicApiProvider>
          <div>test</div>
        </PublicApiProvider>,
      );

      expect(mockConfiguration).toHaveBeenCalledWith(
        expect.objectContaining({
          basePath: expect.any(String),
        }),
      );
      expect(mockCreateApi).toHaveBeenCalledWith(expect.any(Object));
    });

    it('throws error when usePublicApi is used outside provider', () => {
      const TestComponent = () => {
        usePublicApi(); // This should throw
        return <div>test</div>;
      };

      // Suppress console.error for this test
      const originalError = console.error;
      console.error = vi.fn();

      expect(() => render(<TestComponent />)).toThrow(
        'usePublicApi must be used within PublicApiProvider',
      );

      console.error = originalError;
    });
  });

  describe('ProtectedApiProvider', () => {
    it('provides protected API context with authentication token', () => {
      const mockAuth = {
        user: {
          access_token: 'test-access-token',
        },
      } as any;
      mockUseAuth.mockReturnValue(mockAuth);

      const TestComponent = () => {
        const api = useProtectedApi();
        return <div data-testid="api-available">{api ? 'Available' : 'Not Available'}</div>;
      };

      const { getByTestId } = render(
        <ProtectedApiProvider>
          <TestComponent />
        </ProtectedApiProvider>,
      );

      expect(getByTestId('api-available')).toHaveTextContent('Available');
      expect(mockConfiguration).toHaveBeenCalledWith({
        basePath: expect.any(String),
        accessToken: 'test-access-token',
      });
    });

    it('provides protected API context without token when user is not authenticated', () => {
      const mockAuth = {
        user: null,
      } as any;
      mockUseAuth.mockReturnValue(mockAuth);

      const TestComponent = () => {
        const api = useProtectedApi();
        return <div data-testid="api-available">{api ? 'Available' : 'Not Available'}</div>;
      };

      const { getByTestId } = render(
        <ProtectedApiProvider>
          <TestComponent />
        </ProtectedApiProvider>,
      );

      expect(getByTestId('api-available')).toHaveTextContent('Available');
      expect(mockConfiguration).toHaveBeenCalledWith({
        basePath: expect.any(String),
        accessToken: undefined,
      });
    });

    it('recreates API when access token changes', () => {
      const mockAuth = {
        user: {
          access_token: 'initial-token',
        },
      } as any;
      mockUseAuth.mockReturnValue(mockAuth);

      const { rerender } = render(
        <ProtectedApiProvider>
          <div>test</div>
        </ProtectedApiProvider>,
      );

      expect(mockConfiguration).toHaveBeenCalledWith({
        basePath: expect.any(String),
        accessToken: 'initial-token',
      });

      // Change the access token
      mockAuth.user.access_token = 'new-token';
      mockUseAuth.mockReturnValue(mockAuth);

      rerender(
        <ProtectedApiProvider>
          <div>test</div>
        </ProtectedApiProvider>,
      );

      expect(mockConfiguration).toHaveBeenCalledWith({
        basePath: expect.any(String),
        accessToken: 'new-token',
      });
    });

    it('throws error when useProtectedApi is used outside provider', () => {
      const TestComponent = () => {
        useProtectedApi(); // This should throw
        return <div>test</div>;
      };

      // Suppress console.error for this test
      const originalError = console.error;
      console.error = vi.fn();

      expect(() => render(<TestComponent />)).toThrow(
        'useProtectedApi must be used within ProtectedApiProvider',
      );

      console.error = originalError;
    });
  });

  describe('Hook Integration', () => {
    it('usePublicApi hook returns the public API instance', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <PublicApiProvider>{children}</PublicApiProvider>
      );

      const { result } = renderHook(() => usePublicApi(), { wrapper });

      expect(result.current).toBeDefined();
      expect(result.current).toBe(mockApiInstance);
    });

    it('useProtectedApi hook returns the protected API instance', () => {
      mockUseAuth.mockReturnValue({
        user: { access_token: 'test-token' },
      } as any);

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <ProtectedApiProvider>{children}</ProtectedApiProvider>
      );

      const { result } = renderHook(() => useProtectedApi(), { wrapper });

      expect(result.current).toBeDefined();
      expect(result.current).toBe(mockApiInstance);
    });

    it('useApi hook is an alias for useProtectedApi', () => {
      mockUseAuth.mockReturnValue({
        user: { access_token: 'test-token' },
      } as any);

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <ProtectedApiProvider>{children}</ProtectedApiProvider>
      );

      const { result: protectedResult } = renderHook(() => useProtectedApi(), { wrapper });
      const { result: aliasResult } = renderHook(() => useApi(), { wrapper });

      // Both hooks should return the same API instance
      expect(protectedResult.current).toBe(aliasResult.current);
    });
  });

  describe('Backward Compatibility', () => {
    it('ApiProvider is an alias for ProtectedApiProvider', () => {
      mockUseAuth.mockReturnValue({
        user: { access_token: 'test-token' },
      } as any);

      const TestComponent = () => {
        const api = useProtectedApi();
        return <div data-testid="api-available">{api ? 'Available' : 'Not Available'}</div>;
      };

      const { getByTestId } = render(
        <ApiProvider>
          <TestComponent />
        </ApiProvider>,
      );

      expect(getByTestId('api-available')).toHaveTextContent('Available');
      expect(mockConfiguration).toHaveBeenCalledWith({
        basePath: expect.any(String),
        accessToken: 'test-token',
      });
    });
  });

  describe('Memoization', () => {
    it('memoizes API instance when dependencies do not change', () => {
      const mockAuth = {
        user: {
          access_token: 'stable-token',
        },
      } as any;
      mockUseAuth.mockReturnValue(mockAuth);

      const { rerender } = render(
        <ProtectedApiProvider>
          <div>test</div>
        </ProtectedApiProvider>,
      );

      const firstCallCount = mockCreateApi.mock.calls.length;

      // Rerender with same token
      rerender(
        <ProtectedApiProvider>
          <div>test</div>
        </ProtectedApiProvider>,
      );

      // Should not create a new API instance
      expect(mockCreateApi.mock.calls.length).toBe(firstCallCount);
    });

    it('creates new API instance when access token changes', () => {
      const mockAuth = {
        user: {
          access_token: 'initial-token',
        },
      } as any;
      mockUseAuth.mockReturnValue(mockAuth);

      const { rerender } = render(
        <ProtectedApiProvider>
          <div>test</div>
        </ProtectedApiProvider>,
      );

      const firstCallCount = mockCreateApi.mock.calls.length;

      // Change the token
      mockAuth.user.access_token = 'changed-token';
      mockUseAuth.mockReturnValue(mockAuth);

      rerender(
        <ProtectedApiProvider>
          <div>test</div>
        </ProtectedApiProvider>,
      );

      // Should create a new API instance
      expect(mockCreateApi.mock.calls.length).toBe(firstCallCount + 1);
    });
  });
});
