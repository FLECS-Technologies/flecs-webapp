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
import { render, renderHook } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock the createApi function
vi.mock('../../../api/auth-provider-client/api-client', () => ({
  createApi: vi.fn(),
}));

// Mock the Configuration class
vi.mock('@flecs/auth-provider-client-ts', () => ({
  Configuration: vi.fn(),
}));

// Mock the ApiProvider module for getBaseURL function
vi.mock('../ApiProvider', () => ({
  getBaseURL: vi.fn(),
}));

// Import the modules after mocking
import { createApi } from '../../../api/auth-provider-client/api-client';
import { Configuration } from '@flecs/auth-provider-client-ts';
import { getBaseURL } from '../ApiProvider';
import {
  PublicAuthProviderApiProvider,
  usePublicAuthProviderApi,
} from '../AuthProviderApiProvider';

// Type the mocked functions
const mockCreateApi = createApi as any;
const mockConfiguration = Configuration as any;
const mockGetBaseURL = getBaseURL as any;

describe('AuthProviderApiProvider', () => {
  const mockApiInstance = {
    AuthApi: {
      getIssuer: vi.fn(),
      getJwk: vi.fn(),
      getSuperAdmin: vi.fn(),
      postSuperAdmin: vi.fn(),
    },
  };

  const mockBaseURL = 'http://localhost:8080';
  const expectedAuthURL = 'http://localhost:8080/providers/auth/core';

  beforeEach(() => {
    vi.clearAllMocks();
    mockCreateApi.mockReturnValue(mockApiInstance);
    mockConfiguration.mockImplementation((config: any) => config);
    mockGetBaseURL.mockReturnValue(mockBaseURL);
  });

  describe('URL Construction', () => {
    it('constructs correct auth URL from base URL', () => {
      render(
        <PublicAuthProviderApiProvider>
          <div>test</div>
        </PublicAuthProviderApiProvider>,
      );

      expect(mockGetBaseURL).toHaveBeenCalled();
      expect(mockConfiguration).toHaveBeenCalledWith({
        basePath: expectedAuthURL,
      });
    });

    it('handles different base URLs correctly', () => {
      const customBaseURL = 'https://api.example.com:3000';
      const expectedCustomAuthURL = 'https://api.example.com:3000/providers/auth/core';

      mockGetBaseURL.mockReturnValue(customBaseURL);

      render(
        <PublicAuthProviderApiProvider>
          <div>test</div>
        </PublicAuthProviderApiProvider>,
      );

      expect(mockConfiguration).toHaveBeenCalledWith({
        basePath: expectedCustomAuthURL,
      });
    });

    it('handles base URL with trailing slash', () => {
      const baseURLWithSlash = 'http://localhost:8080/';
      const expectedAuthURL = 'http://localhost:8080//providers/auth/core';

      mockGetBaseURL.mockReturnValue(baseURLWithSlash);

      render(
        <PublicAuthProviderApiProvider>
          <div>test</div>
        </PublicAuthProviderApiProvider>,
      );

      expect(mockConfiguration).toHaveBeenCalledWith({
        basePath: expectedAuthURL,
      });
    });
  });

  describe('PublicAuthProviderApiProvider', () => {
    it('provides auth provider API context', () => {
      const TestComponent = () => {
        const api = usePublicAuthProviderApi();
        return <div data-testid="api-available">{api ? 'Available' : 'Not Available'}</div>;
      };

      const { getByTestId } = render(
        <PublicAuthProviderApiProvider>
          <TestComponent />
        </PublicAuthProviderApiProvider>,
      );

      expect(getByTestId('api-available')).toHaveTextContent('Available');
    });

    it('creates API with correct configuration', () => {
      render(
        <PublicAuthProviderApiProvider>
          <div>test</div>
        </PublicAuthProviderApiProvider>,
      );

      expect(mockConfiguration).toHaveBeenCalledWith({
        basePath: expectedAuthURL,
      });
      expect(mockCreateApi).toHaveBeenCalledWith(expect.any(Object));
    });

    it('passes configuration object to createApi', () => {
      render(
        <PublicAuthProviderApiProvider>
          <div>test</div>
        </PublicAuthProviderApiProvider>,
      );

      const configurationInstance = mockConfiguration.mock.results[0].value;
      expect(mockCreateApi).toHaveBeenCalledWith(configurationInstance);
    });

    it('throws error when usePublicAuthProviderApi is used outside provider', () => {
      const TestComponent = () => {
        usePublicAuthProviderApi(); // This should throw
        return <div>test</div>;
      };

      // Suppress console.error for this test
      const originalError = console.error;
      console.error = vi.fn();

      expect(() => render(<TestComponent />)).toThrow(
        'usePublicAuthProviderApi must be used within PublicApiProvider',
      );

      console.error = originalError;
    });

    it('provides the same API instance to multiple consumers', () => {
      let api1: any, api2: any;

      const TestComponent1 = () => {
        api1 = usePublicAuthProviderApi();
        return <div>test1</div>;
      };

      const TestComponent2 = () => {
        api2 = usePublicAuthProviderApi();
        return <div>test2</div>;
      };

      render(
        <PublicAuthProviderApiProvider>
          <TestComponent1 />
          <TestComponent2 />
        </PublicAuthProviderApiProvider>,
      );

      expect(api1).toBe(api2);
      expect(api1).toBe(mockApiInstance);
    });
  });

  describe('Hook Integration', () => {
    it('usePublicAuthProviderApi hook returns the API instance', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <PublicAuthProviderApiProvider>{children}</PublicAuthProviderApiProvider>
      );

      const { result } = renderHook(() => usePublicAuthProviderApi(), { wrapper });

      expect(result.current).toBeDefined();
      expect(result.current).toBe(mockApiInstance);
    });

    it('hook returns object with AuthApi property', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <PublicAuthProviderApiProvider>{children}</PublicAuthProviderApiProvider>
      );

      const { result } = renderHook(() => usePublicAuthProviderApi(), { wrapper });

      expect(result.current).toHaveProperty('AuthApi');
      expect(result.current.AuthApi).toBeDefined();
    });

    it('AuthApi has expected methods', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <PublicAuthProviderApiProvider>{children}</PublicAuthProviderApiProvider>
      );

      const { result } = renderHook(() => usePublicAuthProviderApi(), { wrapper });

      expect(result.current.AuthApi).toHaveProperty('getIssuer');
      expect(result.current.AuthApi).toHaveProperty('getJwk');
      expect(result.current.AuthApi).toHaveProperty('getSuperAdmin');
      expect(result.current.AuthApi).toHaveProperty('postSuperAdmin');
    });
  });

  describe('Memoization', () => {
    it('memoizes API instance and does not recreate on re-renders', () => {
      const { rerender } = render(
        <PublicAuthProviderApiProvider>
          <div>test</div>
        </PublicAuthProviderApiProvider>,
      );

      const firstCallCount = mockCreateApi.mock.calls.length;
      const firstConfigCallCount = mockConfiguration.mock.calls.length;

      // Re-render the provider
      rerender(
        <PublicAuthProviderApiProvider>
          <div>test updated</div>
        </PublicAuthProviderApiProvider>,
      );

      // Should not create new instances
      expect(mockCreateApi.mock.calls.length).toBe(firstCallCount);
      expect(mockConfiguration.mock.calls.length).toBe(firstConfigCallCount);
    });

    it('maintains same API instance across multiple hook calls', () => {
      let firstApiInstance: any;
      let secondApiInstance: any;

      const TestComponent = () => {
        firstApiInstance = usePublicAuthProviderApi();
        secondApiInstance = usePublicAuthProviderApi();
        return <div>test</div>;
      };

      render(
        <PublicAuthProviderApiProvider>
          <TestComponent />
        </PublicAuthProviderApiProvider>,
      );

      expect(firstApiInstance).toBe(secondApiInstance);
    });
  });

  describe('API Instance Structure', () => {
    it('creates API instance with expected structure', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <PublicAuthProviderApiProvider>{children}</PublicAuthProviderApiProvider>
      );

      const { result } = renderHook(() => usePublicAuthProviderApi(), { wrapper });
      const api = result.current;

      expect(api).toEqual({
        AuthApi: expect.objectContaining({
          getIssuer: expect.any(Function),
          getJwk: expect.any(Function),
          getSuperAdmin: expect.any(Function),
          postSuperAdmin: expect.any(Function),
        }),
      });
    });

    it('API methods are callable', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <PublicAuthProviderApiProvider>{children}</PublicAuthProviderApiProvider>
      );

      const { result } = renderHook(() => usePublicAuthProviderApi(), { wrapper });
      const api = result.current;

      // These shouldn't throw
      expect(() => api.AuthApi.getIssuer).not.toThrow();
      expect(() => api.AuthApi.getJwk).not.toThrow();
      expect(() => api.AuthApi.getSuperAdmin).not.toThrow();
      expect(() => api.AuthApi.postSuperAdmin).not.toThrow();
    });
  });

  describe('Configuration Details', () => {
    it('creates Configuration with only basePath (no authentication)', () => {
      render(
        <PublicAuthProviderApiProvider>
          <div>test</div>
        </PublicAuthProviderApiProvider>,
      );

      expect(mockConfiguration).toHaveBeenCalledWith({
        basePath: expectedAuthURL,
      });

      // Verify no authentication-related properties are passed
      const configCall = mockConfiguration.mock.calls[0][0];
      expect(configCall).not.toHaveProperty('accessToken');
      expect(configCall).not.toHaveProperty('apiKey');
      expect(configCall).not.toHaveProperty('username');
      expect(configCall).not.toHaveProperty('password');
    });

    it('Configuration instance is passed to createApi', () => {
      render(
        <PublicAuthProviderApiProvider>
          <div>test</div>
        </PublicAuthProviderApiProvider>,
      );

      const configInstance = mockConfiguration.mock.results[0].value;
      expect(mockCreateApi).toHaveBeenCalledWith(configInstance);
      expect(mockCreateApi).toHaveBeenCalledTimes(1);
    });
  });

  describe('Provider Nesting', () => {
    it('works when nested inside other providers', () => {
      const ParentProvider = ({ children }: { children: React.ReactNode }) => (
        <div data-testid="parent">{children}</div>
      );

      render(
        <ParentProvider>
          <PublicAuthProviderApiProvider>
            <div data-testid="child">test</div>
          </PublicAuthProviderApiProvider>
        </ParentProvider>,
      );

      expect(mockConfiguration).toHaveBeenCalledWith({
        basePath: expectedAuthURL,
      });
      expect(mockCreateApi).toHaveBeenCalled();
    });

    it('can have multiple nested children using the API', () => {
      const ChildComponent1 = () => {
        const api = usePublicAuthProviderApi();
        return <div data-testid="child1">{api ? 'API1' : 'No API1'}</div>;
      };

      const ChildComponent2 = () => {
        const api = usePublicAuthProviderApi();
        return <div data-testid="child2">{api ? 'API2' : 'No API2'}</div>;
      };

      const { getByTestId } = render(
        <PublicAuthProviderApiProvider>
          <div>
            <ChildComponent1 />
            <ChildComponent2 />
          </div>
        </PublicAuthProviderApiProvider>,
      );

      expect(getByTestId('child1')).toHaveTextContent('API1');
      expect(getByTestId('child2')).toHaveTextContent('API2');
    });
  });

  describe('Error Handling', () => {
    it('handles createApi throwing an error gracefully', () => {
      const mockError = new Error('API creation failed');
      mockCreateApi.mockImplementation(() => {
        throw mockError;
      });

      // Suppress console.error for this test
      const originalError = console.error;
      console.error = vi.fn();

      expect(() =>
        render(
          <PublicAuthProviderApiProvider>
            <div>test</div>
          </PublicAuthProviderApiProvider>,
        ),
      ).toThrow('API creation failed');

      console.error = originalError;
    });

    it('handles Configuration constructor throwing an error gracefully', () => {
      const mockError = new Error('Configuration creation failed');
      mockConfiguration.mockImplementation(() => {
        throw mockError;
      });

      // Suppress console.error for this test
      const originalError = console.error;
      console.error = vi.fn();

      expect(() =>
        render(
          <PublicAuthProviderApiProvider>
            <div>test</div>
          </PublicAuthProviderApiProvider>,
        ),
      ).toThrow('Configuration creation failed');

      console.error = originalError;
    });

    it('handles getBaseURL throwing an error gracefully', () => {
      const mockError = new Error('Base URL retrieval failed');
      mockGetBaseURL.mockImplementation(() => {
        throw mockError;
      });

      // Suppress console.error for this test
      const originalError = console.error;
      console.error = vi.fn();

      expect(() =>
        render(
          <PublicAuthProviderApiProvider>
            <div>test</div>
          </PublicAuthProviderApiProvider>,
        ),
      ).toThrow('Base URL retrieval failed');

      console.error = originalError;
    });
  });

  describe('Integration with ApiProvider', () => {
    it('uses getBaseURL from ApiProvider', () => {
      render(
        <PublicAuthProviderApiProvider>
          <div>test</div>
        </PublicAuthProviderApiProvider>,
      );

      expect(mockGetBaseURL).toHaveBeenCalled();
      expect(mockGetBaseURL).toHaveBeenCalledWith(); // No arguments
    });

    it('maintains independence from ApiProvider authentication state', () => {
      // This test ensures that the AuthProviderApiProvider doesn't
      // depend on any authentication state from the main ApiProvider
      render(
        <PublicAuthProviderApiProvider>
          <div>test</div>
        </PublicAuthProviderApiProvider>,
      );

      const configCall = mockConfiguration.mock.calls[0][0];
      expect(configCall).toEqual({
        basePath: expectedAuthURL,
      });

      // Should only have basePath, no auth-related properties
      expect(Object.keys(configCall)).toEqual(['basePath']);
    });
  });
});
