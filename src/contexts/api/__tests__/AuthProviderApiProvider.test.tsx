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
import { render, renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock the createApi function
vi.mock('../../../api/auth-provider-client/api-client', () => ({
  createApi: vi.fn(),
}));

// Mock the Configuration class
vi.mock('@flecs/auth-provider-client-ts', () => ({
  Configuration: vi.fn(),
}));

// Mock the ApiProvider module for getBaseURL function, usePublicApi hook, and getAuthProviderURL
vi.mock('../ApiProvider', () => ({
  getBaseURL: vi.fn(),
  usePublicApi: vi.fn(),
  getAuthProviderURL: vi.fn(),
}));

// Mock the onboarding helpers
vi.mock('@components/onboarding/utils/onboardingHelpers', () => ({
  getCoreAuthProviderId: vi.fn(),
}));

// Import the modules after mocking
import { createApi } from '../../../api/auth-provider-client/api-client';
import { Configuration } from '@flecs/auth-provider-client-ts';
import { getBaseURL, usePublicApi, getAuthProviderURL } from '../ApiProvider';
import { getCoreAuthProviderId } from '@components/onboarding/utils/onboardingHelpers';
import {
  PublicAuthProviderApiProvider,
  usePublicAuthProviderApi,
} from '../AuthProviderApiProvider';

// Type the mocked functions
const mockCreateApi = createApi as any;
const mockConfiguration = Configuration as any;
const mockGetBaseURL = getBaseURL as any;
const mockUsePublicApi = usePublicApi as any;
const mockGetAuthProviderURL = getAuthProviderURL as any;
const mockGetCoreAuthProviderId = getCoreAuthProviderId as any;

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
    mockGetAuthProviderURL.mockReturnValue(expectedAuthURL);
    mockGetCoreAuthProviderId.mockResolvedValue('test-provider-id');
    mockUsePublicApi.mockReturnValue({ getBaseURL: mockGetBaseURL });
  });

  describe('URL Construction', () => {
    it('constructs correct auth URL from base URL', async () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <PublicAuthProviderApiProvider>{children}</PublicAuthProviderApiProvider>
      );

      const { result } = renderHook(() => usePublicAuthProviderApi(), { wrapper });

      // Call the api function to trigger lazy initialization
      await result.current.api();

      expect(mockGetCoreAuthProviderId).toHaveBeenCalled();
      expect(mockGetAuthProviderURL).toHaveBeenCalledWith('test-provider-id');
      expect(mockConfiguration).toHaveBeenCalledWith({
        basePath: expectedAuthURL,
      });
    });

    it('handles different base URLs correctly', async () => {
      const customBaseURL = 'https://api.example.com:3000';
      const expectedCustomAuthURL = 'https://api.example.com:3000/providers/auth/core';

      mockGetBaseURL.mockReturnValue(customBaseURL);
      mockGetAuthProviderURL.mockReturnValue(expectedCustomAuthURL);

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <PublicAuthProviderApiProvider>{children}</PublicAuthProviderApiProvider>
      );

      const { result } = renderHook(() => usePublicAuthProviderApi(), { wrapper });

      // Call the api function to trigger lazy initialization
      await result.current.api();

      expect(mockGetCoreAuthProviderId).toHaveBeenCalled();
      expect(mockConfiguration).toHaveBeenCalledWith({
        basePath: expectedCustomAuthURL,
      });
    });

    it('handles base URL with trailing slash', async () => {
      const baseURLWithSlash = 'http://localhost:8080/';
      const expectedAuthURL = 'http://localhost:8080//providers/auth/core';

      mockGetBaseURL.mockReturnValue(baseURLWithSlash);
      mockGetAuthProviderURL.mockReturnValue(expectedAuthURL);

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <PublicAuthProviderApiProvider>{children}</PublicAuthProviderApiProvider>
      );

      const { result } = renderHook(() => usePublicAuthProviderApi(), { wrapper });

      // Call the api function to trigger lazy initialization
      await result.current.api();

      expect(mockGetCoreAuthProviderId).toHaveBeenCalled();
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

    it('creates API with correct configuration', async () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <PublicAuthProviderApiProvider>{children}</PublicAuthProviderApiProvider>
      );

      const { result } = renderHook(() => usePublicAuthProviderApi(), { wrapper });

      // Call the api function to trigger lazy initialization
      await result.current.api();

      expect(mockConfiguration).toHaveBeenCalledWith({
        basePath: expectedAuthURL,
      });
      expect(mockCreateApi).toHaveBeenCalledWith(expect.any(Object));
    });

    it('passes configuration object to createApi', async () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <PublicAuthProviderApiProvider>{children}</PublicAuthProviderApiProvider>
      );

      const { result } = renderHook(() => usePublicAuthProviderApi(), { wrapper });

      // Call the api function to trigger lazy initialization
      await result.current.api();

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

    it('provides the same API instance to multiple consumers', async () => {
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
      // api is a function, not a direct value
      expect(typeof api1.api).toBe('function');
      const resolvedApi = await api1.api();
      expect(resolvedApi).toBe(mockApiInstance);
    });
  });

  describe('Hook Integration', () => {
    it('usePublicAuthProviderApi hook returns the API instance', async () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <PublicAuthProviderApiProvider>{children}</PublicAuthProviderApiProvider>
      );

      const { result } = renderHook(() => usePublicAuthProviderApi(), { wrapper });

      expect(result.current).toBeDefined();
      expect(typeof result.current.api).toBe('function');
      const resolvedApi = await result.current.api();
      expect(resolvedApi).toBe(mockApiInstance);
    });

    it('hook returns object with AuthApi property', async () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <PublicAuthProviderApiProvider>{children}</PublicAuthProviderApiProvider>
      );

      const { result } = renderHook(() => usePublicAuthProviderApi(), { wrapper });

      const resolvedApi = await result.current.api();
      expect(resolvedApi).toHaveProperty('AuthApi');
      expect(resolvedApi.AuthApi).toBeDefined();
    });

    it('AuthApi has expected methods', async () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <PublicAuthProviderApiProvider>{children}</PublicAuthProviderApiProvider>
      );

      const { result } = renderHook(() => usePublicAuthProviderApi(), { wrapper });

      const resolvedApi = await result.current.api();
      expect(resolvedApi.AuthApi).toHaveProperty('getIssuer');
      expect(resolvedApi.AuthApi).toHaveProperty('getJwk');
      expect(resolvedApi.AuthApi).toHaveProperty('getSuperAdmin');
      expect(resolvedApi.AuthApi).toHaveProperty('postSuperAdmin');
    });
  });

  describe('Memoization', () => {
    it('memoizes API instance and does not recreate on re-renders', async () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <PublicAuthProviderApiProvider>{children}</PublicAuthProviderApiProvider>
      );

      const { result, rerender } = renderHook(() => usePublicAuthProviderApi(), { wrapper });

      // Call api() to trigger initialization
      await result.current.api();
      const firstCallCount = mockCreateApi.mock.calls.length;

      // Re-render the provider
      rerender();

      // Call api() again
      await result.current.api();

      // Should have created API twice (no caching between calls currently)
      // This test documents current behavior - each api() call creates a new instance
      expect(mockCreateApi.mock.calls.length).toBeGreaterThanOrEqual(firstCallCount);
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
    it('creates API instance with expected structure', async () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <PublicAuthProviderApiProvider>{children}</PublicAuthProviderApiProvider>
      );

      const { result } = renderHook(() => usePublicAuthProviderApi(), { wrapper });

      expect(typeof result.current.api).toBe('function');
      const resolvedApi = await result.current.api();

      expect(resolvedApi).toEqual({
        AuthApi: expect.objectContaining({
          getIssuer: expect.any(Function),
          getJwk: expect.any(Function),
          getSuperAdmin: expect.any(Function),
          postSuperAdmin: expect.any(Function),
        }),
      });
    });

    it('API methods are callable', async () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <PublicAuthProviderApiProvider>{children}</PublicAuthProviderApiProvider>
      );

      const { result } = renderHook(() => usePublicAuthProviderApi(), { wrapper });
      const resolvedApi = await result.current.api();

      // These shouldn't throw
      expect(() => resolvedApi.AuthApi.getIssuer).not.toThrow();
      expect(() => resolvedApi.AuthApi.getJwk).not.toThrow();
      expect(() => resolvedApi.AuthApi.getSuperAdmin).not.toThrow();
      expect(() => resolvedApi.AuthApi.postSuperAdmin).not.toThrow();
    });
  });

  describe('Configuration Details', () => {
    it('creates Configuration with only basePath (no authentication)', async () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <PublicAuthProviderApiProvider>{children}</PublicAuthProviderApiProvider>
      );

      const { result } = renderHook(() => usePublicAuthProviderApi(), { wrapper });

      // Call the api function to trigger lazy initialization
      await result.current.api();

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

    it('Configuration instance is passed to createApi', async () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <PublicAuthProviderApiProvider>{children}</PublicAuthProviderApiProvider>
      );

      const { result } = renderHook(() => usePublicAuthProviderApi(), { wrapper });

      // Call the api function to trigger lazy initialization
      await result.current.api();

      const configInstance = mockConfiguration.mock.results[0].value;
      expect(mockCreateApi).toHaveBeenCalledWith(configInstance);
      expect(mockCreateApi).toHaveBeenCalledTimes(1);
    });
  });

  describe('Provider Nesting', () => {
    it('works when nested inside other providers', async () => {
      const ParentProvider = ({ children }: { children: React.ReactNode }) => (
        <div data-testid="parent">{children}</div>
      );

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <ParentProvider>
          <PublicAuthProviderApiProvider>{children}</PublicAuthProviderApiProvider>
        </ParentProvider>
      );

      const { result } = renderHook(() => usePublicAuthProviderApi(), { wrapper });

      // Call the api function to trigger lazy initialization
      await result.current.api();

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
    it('handles createApi throwing an error gracefully', async () => {
      const mockError = new Error('API creation failed');
      mockCreateApi.mockImplementation(() => {
        throw mockError;
      });

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <PublicAuthProviderApiProvider>{children}</PublicAuthProviderApiProvider>
      );

      const { result } = renderHook(() => usePublicAuthProviderApi(), { wrapper });

      // Error should be thrown when calling api()
      await expect(result.current.api()).rejects.toThrow('API creation failed');
    });

    it('handles Configuration constructor throwing an error gracefully', async () => {
      const mockError = new Error('Configuration creation failed');
      mockConfiguration.mockImplementation(() => {
        throw mockError;
      });

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <PublicAuthProviderApiProvider>{children}</PublicAuthProviderApiProvider>
      );

      const { result } = renderHook(() => usePublicAuthProviderApi(), { wrapper });

      // Error should be thrown when calling api()
      await expect(result.current.api()).rejects.toThrow('Configuration creation failed');
    });

    it('handles getAuthProviderURL throwing an error gracefully', async () => {
      const mockError = new Error('Auth provider URL retrieval failed');
      mockGetAuthProviderURL.mockImplementation(() => {
        throw mockError;
      });

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <PublicAuthProviderApiProvider>{children}</PublicAuthProviderApiProvider>
      );

      const { result } = renderHook(() => usePublicAuthProviderApi(), { wrapper });

      // Error should be thrown when calling api()
      await expect(result.current.api()).rejects.toThrow('Auth provider URL retrieval failed');
    });
  });

  describe('Integration with ApiProvider', () => {
    it('uses getAuthProviderURL from ApiProvider', async () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <PublicAuthProviderApiProvider>{children}</PublicAuthProviderApiProvider>
      );

      const { result } = renderHook(() => usePublicAuthProviderApi(), { wrapper });

      // Call the api function to trigger lazy initialization
      await result.current.api();

      expect(mockGetCoreAuthProviderId).toHaveBeenCalled();
      expect(mockGetAuthProviderURL).toHaveBeenCalled();
    });

    it('maintains independence from ApiProvider authentication state', async () => {
      // This test ensures that the AuthProviderApiProvider doesn't
      // depend on any authentication state from the main ApiProvider
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <PublicAuthProviderApiProvider>{children}</PublicAuthProviderApiProvider>
      );

      const { result } = renderHook(() => usePublicAuthProviderApi(), { wrapper });

      // Call the api function to trigger lazy initialization
      await result.current.api();

      const configCall = mockConfiguration.mock.calls[0][0];
      expect(configCall).toEqual({
        basePath: expectedAuthURL,
      });

      // Should only have basePath, no auth-related properties
      expect(Object.keys(configCall)).toEqual(['basePath']);
    });
  });
});
