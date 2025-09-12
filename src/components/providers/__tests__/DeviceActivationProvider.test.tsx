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
import { render, renderHook, waitFor, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock the API provider
vi.mock('../ApiProvider', () => ({
  useProtectedApi: vi.fn(),
}));

// Import the modules after mocking
import { useProtectedApi } from '../ApiProvider';
import DeviceActivationProvider from '../DeviceActivationProvider';
import { DeviceActivationContext } from '../DeviceActivationContext';

const mockUseProtectedApi = vi.mocked(useProtectedApi);

// Helper hook to use the context
const useDeviceActivationContext = () => React.useContext(DeviceActivationContext);

describe('DeviceActivationProvider', () => {
  let mockApi: any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockApi = {
      device: {
        deviceLicenseActivationStatusGet: vi.fn(),
        deviceLicenseActivationPost: vi.fn(),
      },
    };
    mockUseProtectedApi.mockReturnValue(mockApi);
  });

  describe('Initial State and Mount Behavior', () => {
    it('provides correct initial context values', async () => {
      // Mock successful validation
      mockApi.device.deviceLicenseActivationStatusGet.mockResolvedValue({
        data: { isValid: false },
      });

      const { result } = renderHook(() => useDeviceActivationContext(), {
        wrapper: ({ children }) => <DeviceActivationProvider>{children}</DeviceActivationProvider>,
      });

      // Since useEffect runs validate() immediately, wait for it to complete
      await waitFor(() => {
        expect(result.current.validating).toBe(false);
      });

      expect(result.current.activated).toBe(false);
      expect(result.current.activating).toBe(false);
      expect(result.current.error).toBe(false);
      expect(result.current.statusText).toBe('Device is not activated!');
      expect(typeof result.current.validate).toBe('function');
      expect(typeof result.current.activate).toBe('function');
    });

    it('automatically validates on mount', async () => {
      mockApi.device.deviceLicenseActivationStatusGet.mockResolvedValue({
        data: { isValid: true },
      });

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <DeviceActivationProvider>{children}</DeviceActivationProvider>
      );

      renderHook(() => useDeviceActivationContext(), { wrapper });

      await waitFor(() => {
        expect(mockApi.device.deviceLicenseActivationStatusGet).toHaveBeenCalledTimes(1);
      });
    });

    it('sets validating state to true initially during mount validation', async () => {
      let resolveValidation: (value: any) => void;
      const validationPromise = new Promise((resolve) => {
        resolveValidation = resolve;
      });
      mockApi.device.deviceLicenseActivationStatusGet.mockReturnValue(validationPromise);

      const { result } = renderHook(() => useDeviceActivationContext(), {
        wrapper: ({ children }) => <DeviceActivationProvider>{children}</DeviceActivationProvider>,
      });

      // Should be validating initially
      expect(result.current.validating).toBe(true);
      expect(result.current.statusText).toBe('Checking the device activation status...');

      // Resolve validation
      act(() => {
        resolveValidation!({ data: { isValid: true } });
      });

      await waitFor(() => {
        expect(result.current.validating).toBe(false);
        expect(result.current.activated).toBe(true);
      });
    });
  });

  describe('Validation Functionality', () => {
    it('handles successful validation for activated device', async () => {
      mockApi.device.deviceLicenseActivationStatusGet.mockResolvedValue({
        data: { isValid: true },
      });

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <DeviceActivationProvider>{children}</DeviceActivationProvider>
      );

      const { result } = renderHook(() => useDeviceActivationContext(), { wrapper });

      await waitFor(() => {
        expect(result.current.activated).toBe(true);
        expect(result.current.statusText).toBe('Device is activated!');
        expect(result.current.error).toBe(false);
        expect(result.current.validating).toBe(false);
      });
    });

    it('handles successful validation for non-activated device', async () => {
      mockApi.device.deviceLicenseActivationStatusGet.mockResolvedValue({
        data: { isValid: false },
      });

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <DeviceActivationProvider>{children}</DeviceActivationProvider>
      );

      const { result } = renderHook(() => useDeviceActivationContext(), { wrapper });

      await waitFor(() => {
        expect(result.current.activated).toBe(false);
        expect(result.current.statusText).toBe('Device is not activated!');
        expect(result.current.error).toBe(false);
        expect(result.current.validating).toBe(false);
      });
    });

    it('handles validation error', async () => {
      mockApi.device.deviceLicenseActivationStatusGet.mockRejectedValue(new Error('Network error'));

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <DeviceActivationProvider>{children}</DeviceActivationProvider>
      );

      const { result } = renderHook(() => useDeviceActivationContext(), { wrapper });

      await waitFor(() => {
        expect(result.current.error).toBe(true);
        expect(result.current.statusText).toBe(
          'Failed to check activation status! Please login with your account and try again.',
        );
        expect(result.current.activated).toBe(false);
        expect(result.current.validating).toBe(false);
      });
    });

    it('allows manual validation call', async () => {
      // First call (automatic on mount)
      mockApi.device.deviceLicenseActivationStatusGet.mockResolvedValueOnce({
        data: { isValid: false },
      });

      // Second call (manual)
      mockApi.device.deviceLicenseActivationStatusGet.mockResolvedValueOnce({
        data: { isValid: true },
      });

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <DeviceActivationProvider>{children}</DeviceActivationProvider>
      );

      const { result } = renderHook(() => useDeviceActivationContext(), { wrapper });

      // Wait for initial validation
      await waitFor(() => {
        expect(result.current.activated).toBe(false);
      });

      // Manual validation
      await act(async () => {
        await result.current.validate();
      });

      expect(result.current.activated).toBe(true);
      expect(mockApi.device.deviceLicenseActivationStatusGet).toHaveBeenCalledTimes(2);
    });

    it('sets validating state during manual validation', async () => {
      // Initial validation (auto on mount)
      mockApi.device.deviceLicenseActivationStatusGet.mockResolvedValueOnce({
        data: { isValid: false },
      });

      let resolveManualValidation: (value: any) => void;
      const manualValidationPromise = new Promise((resolve) => {
        resolveManualValidation = resolve;
      });

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <DeviceActivationProvider>{children}</DeviceActivationProvider>
      );

      const { result } = renderHook(() => useDeviceActivationContext(), { wrapper });

      // Wait for initial validation to complete
      await waitFor(() => {
        expect(result.current.validating).toBe(false);
      });

      // Setup mock for manual validation
      mockApi.device.deviceLicenseActivationStatusGet.mockReturnValue(manualValidationPromise);

      // Start manual validation
      act(() => {
        result.current.validate();
      });

      // Should be validating
      await waitFor(() => {
        expect(result.current.validating).toBe(true);
        expect(result.current.statusText).toBe('Checking the device activation status...');
      });

      // Resolve manual validation
      act(() => {
        resolveManualValidation!({ data: { isValid: true } });
      });

      await waitFor(() => {
        expect(result.current.validating).toBe(false);
        expect(result.current.activated).toBe(true);
      });
    });
  });

  describe('Activation Functionality', () => {
    it('handles successful activation', async () => {
      mockApi.device.deviceLicenseActivationStatusGet.mockResolvedValue({
        data: { isValid: false },
      });

      mockApi.device.deviceLicenseActivationPost.mockResolvedValue({
        data: { success: true },
      });

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <DeviceActivationProvider>{children}</DeviceActivationProvider>
      );

      const { result } = renderHook(() => useDeviceActivationContext(), { wrapper });

      await waitFor(() => {
        expect(result.current.activated).toBe(false);
      });

      await act(async () => {
        await result.current.activate();
      });

      expect(mockApi.device.deviceLicenseActivationPost).toHaveBeenCalledTimes(1);
      expect(result.current.activated).toBe(true);
      expect(result.current.error).toBe(false);
      expect(result.current.statusText).toBe('Device is activated!');
      expect(result.current.activating).toBe(false);
    });

    it('handles activation error with additional info', async () => {
      mockApi.device.deviceLicenseActivationStatusGet.mockResolvedValue({
        data: { isValid: false },
      });

      const errorResponse = {
        response: {
          data: {
            additionalInfo: 'No licenses available',
          },
        },
      };

      mockApi.device.deviceLicenseActivationPost.mockRejectedValue(errorResponse);

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <DeviceActivationProvider>{children}</DeviceActivationProvider>
      );

      const { result } = renderHook(() => useDeviceActivationContext(), { wrapper });

      await waitFor(() => {
        expect(result.current.activated).toBe(false);
      });

      await act(async () => {
        await result.current.activate();
      });

      expect(result.current.activated).toBe(false);
      expect(result.current.error).toBe(true);
      expect(result.current.statusText).toBe(
        'Failed to activate the device! Please make sure that you are logged in and that your account has device licences: No licenses available',
      );
      expect(result.current.activating).toBe(false);
    });

    it('handles activation error without additional info', async () => {
      mockApi.device.deviceLicenseActivationStatusGet.mockResolvedValue({
        data: { isValid: false },
      });

      const errorResponse = {
        response: {
          data: {}, // No additionalInfo
        },
      };

      mockApi.device.deviceLicenseActivationPost.mockRejectedValue(errorResponse);

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <DeviceActivationProvider>{children}</DeviceActivationProvider>
      );

      const { result } = renderHook(() => useDeviceActivationContext(), { wrapper });

      await waitFor(() => {
        expect(result.current.activated).toBe(false);
      });

      await act(async () => {
        await result.current.activate();
      });

      expect(result.current.statusText).toBe(
        'Failed to activate the device! Please make sure that you are logged in and that your account has device licences: undefined',
      );
    });

    it('sets activating state during activation', async () => {
      mockApi.device.deviceLicenseActivationStatusGet.mockResolvedValue({
        data: { isValid: false },
      });

      let resolveActivation: (value: any) => void;
      const activationPromise = new Promise((resolve) => {
        resolveActivation = resolve;
      });
      mockApi.device.deviceLicenseActivationPost.mockReturnValue(activationPromise);

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <DeviceActivationProvider>{children}</DeviceActivationProvider>
      );

      const { result } = renderHook(() => useDeviceActivationContext(), { wrapper });

      // Wait for initial validation
      await waitFor(() => {
        expect(result.current.activated).toBe(false);
      });

      // Start activation
      act(() => {
        result.current.activate();
      });

      // Should be activating
      await waitFor(() => {
        expect(result.current.activating).toBe(true);
        expect(result.current.statusText).toBe('Activating the device...');
      });

      // Resolve activation
      act(() => {
        resolveActivation!({ data: { success: true } });
      });

      await waitFor(() => {
        expect(result.current.activating).toBe(false);
        expect(result.current.activated).toBe(true);
      });
    });
  });

  describe('Context Integration', () => {
    it('provides context to child components', async () => {
      mockApi.device.deviceLicenseActivationStatusGet.mockResolvedValue({
        data: { isValid: true },
      });

      const TestComponent = () => {
        const context = useDeviceActivationContext();
        return (
          <div data-testid="context-available">
            {context.activated ? 'Activated' : 'Not Activated'}
          </div>
        );
      };

      const { getByTestId } = render(
        <DeviceActivationProvider>
          <TestComponent />
        </DeviceActivationProvider>,
      );

      // Wait for the validation to complete
      await waitFor(() => {
        expect(getByTestId('context-available')).toHaveTextContent('Activated');
      });
    });

    it('provides default context values when used outside provider', () => {
      const TestComponent = () => {
        const context = useDeviceActivationContext();
        return (
          <div data-testid="context-values">
            {`${context.activated}-${context.error}-${context.validating}-${context.activating}`}
          </div>
        );
      };

      const { getByTestId } = render(<TestComponent />);

      expect(getByTestId('context-values')).toHaveTextContent('false-false-false-false');
    });

    it('provides all expected context properties', async () => {
      mockApi.device.deviceLicenseActivationStatusGet.mockResolvedValue({
        data: { isValid: false },
      });

      const TestComponent = () => {
        const context = useDeviceActivationContext();
        return (
          <div>
            <div data-testid="has-validate">
              {typeof context.validate === 'function' ? 'true' : 'false'}
            </div>
            <div data-testid="has-activate">
              {typeof context.activate === 'function' ? 'true' : 'false'}
            </div>
            <div data-testid="has-validating">
              {typeof context.validating === 'boolean' ? 'true' : 'false'}
            </div>
            <div data-testid="has-activating">
              {typeof context.activating === 'boolean' ? 'true' : 'false'}
            </div>
            <div data-testid="has-activated">
              {typeof context.activated === 'boolean' ? 'true' : 'false'}
            </div>
            <div data-testid="has-error">
              {typeof context.error === 'boolean' ? 'true' : 'false'}
            </div>
            <div data-testid="has-statusText">
              {typeof context.statusText === 'string' ? 'true' : 'false'}
            </div>
          </div>
        );
      };

      let getByTestId: any;
      await act(async () => {
        const result = render(
          <DeviceActivationProvider>
            <TestComponent />
          </DeviceActivationProvider>,
        );
        getByTestId = result.getByTestId;
      });

      // Wait for the useEffect validation to complete
      await waitFor(() => {
        expect(getByTestId('has-validate')).toHaveTextContent('true');
      });

      expect(getByTestId('has-activate')).toHaveTextContent('true');
      expect(getByTestId('has-validating')).toHaveTextContent('true');
      expect(getByTestId('has-activating')).toHaveTextContent('true');
      expect(getByTestId('has-activated')).toHaveTextContent('true');
      expect(getByTestId('has-error')).toHaveTextContent('true');
      expect(getByTestId('has-statusText')).toHaveTextContent('true');
    });
  });

  describe('State Transitions', () => {
    it('transitions from not activated to activated', async () => {
      // Start not activated
      mockApi.device.deviceLicenseActivationStatusGet.mockResolvedValue({
        data: { isValid: false },
      });

      mockApi.device.deviceLicenseActivationPost.mockResolvedValue({
        data: { success: true },
      });

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <DeviceActivationProvider>{children}</DeviceActivationProvider>
      );

      const { result } = renderHook(() => useDeviceActivationContext(), { wrapper });

      // Initial state - not activated
      await waitFor(() => {
        expect(result.current.activated).toBe(false);
        expect(result.current.statusText).toBe('Device is not activated!');
      });

      // Activate device
      await act(async () => {
        await result.current.activate();
      });

      // Final state - activated
      expect(result.current.activated).toBe(true);
      expect(result.current.error).toBe(false);
      expect(result.current.statusText).toBe('Device is activated!');
    });

    it('handles error recovery through re-validation', async () => {
      // Start with validation error
      mockApi.device.deviceLicenseActivationStatusGet.mockRejectedValueOnce(
        new Error('Network error'),
      );

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <DeviceActivationProvider>{children}</DeviceActivationProvider>
      );

      const { result } = renderHook(() => useDeviceActivationContext(), { wrapper });

      // Wait for error state
      await waitFor(() => {
        expect(result.current.error).toBe(true);
      });

      // Mock successful validation for retry
      mockApi.device.deviceLicenseActivationStatusGet.mockResolvedValue({
        data: { isValid: true },
      });

      // Retry validation
      await act(async () => {
        await result.current.validate();
      });

      expect(result.current.error).toBe(false);
      expect(result.current.activated).toBe(true);
    });

    it('handles activation after failed validation', async () => {
      // Start with failed validation
      mockApi.device.deviceLicenseActivationStatusGet.mockRejectedValue(new Error('Network error'));

      mockApi.device.deviceLicenseActivationPost.mockResolvedValue({
        data: { success: true },
      });

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <DeviceActivationProvider>{children}</DeviceActivationProvider>
      );

      const { result } = renderHook(() => useDeviceActivationContext(), { wrapper });

      // Wait for error state from validation
      await waitFor(() => {
        expect(result.current.error).toBe(true);
        expect(result.current.activated).toBe(false);
      });

      // Try activation despite validation error
      await act(async () => {
        await result.current.activate();
      });

      // Should be activated and error cleared
      expect(result.current.activated).toBe(true);
      expect(result.current.error).toBe(false);
      expect(result.current.statusText).toBe('Device is activated!');
    });
  });

  describe('Edge Cases', () => {
    it('handles multiple concurrent validation calls', async () => {
      mockApi.device.deviceLicenseActivationStatusGet.mockResolvedValue({
        data: { isValid: true },
      });

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <DeviceActivationProvider>{children}</DeviceActivationProvider>
      );

      const { result } = renderHook(() => useDeviceActivationContext(), { wrapper });

      // Wait for initial validation
      await waitFor(() => {
        expect(result.current.validating).toBe(false);
      });

      // Clear the mock to count new calls
      mockApi.device.deviceLicenseActivationStatusGet.mockClear();
      mockApi.device.deviceLicenseActivationStatusGet.mockResolvedValue({
        data: { isValid: true },
      });

      // Make multiple concurrent validation calls
      await act(async () => {
        await Promise.all([
          result.current.validate(),
          result.current.validate(),
          result.current.validate(),
        ]);
      });

      // All calls should complete
      expect(mockApi.device.deviceLicenseActivationStatusGet).toHaveBeenCalledTimes(3);
    });

    it('handles multiple concurrent activation calls', async () => {
      mockApi.device.deviceLicenseActivationStatusGet.mockResolvedValue({
        data: { isValid: false },
      });

      mockApi.device.deviceLicenseActivationPost.mockResolvedValue({
        data: { success: true },
      });

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <DeviceActivationProvider>{children}</DeviceActivationProvider>
      );

      const { result } = renderHook(() => useDeviceActivationContext(), { wrapper });

      // Wait for initial validation
      await waitFor(() => {
        expect(result.current.activated).toBe(false);
      });

      // Make multiple concurrent activation calls
      await act(async () => {
        await Promise.all([
          result.current.activate(),
          result.current.activate(),
          result.current.activate(),
        ]);
      });

      // All calls should complete, result should be activated
      expect(result.current.activated).toBe(true);
      expect(mockApi.device.deviceLicenseActivationPost).toHaveBeenCalledTimes(3);
    });

    it('maintains state consistency during rapid state changes', async () => {
      let validationResolver: (value: any) => void;
      let activationResolver: (value: any) => void;

      mockApi.device.deviceLicenseActivationStatusGet.mockImplementation(() => {
        return new Promise((resolve) => {
          validationResolver = resolve;
        });
      });

      mockApi.device.deviceLicenseActivationPost.mockImplementation(() => {
        return new Promise((resolve) => {
          activationResolver = resolve;
        });
      });

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <DeviceActivationProvider>{children}</DeviceActivationProvider>
      );

      const { result } = renderHook(() => useDeviceActivationContext(), { wrapper });

      // Should be validating initially
      expect(result.current.validating).toBe(true);

      // Start activation while validation is still pending
      act(() => {
        result.current.activate();
      });

      // Should now be both validating and activating
      expect(result.current.validating).toBe(true);
      expect(result.current.activating).toBe(true);

      // Resolve validation first
      act(() => {
        validationResolver({ data: { isValid: false } });
      });

      await waitFor(() => {
        expect(result.current.validating).toBe(false);
      });

      // Still activating
      expect(result.current.activating).toBe(true);

      // Resolve activation
      act(() => {
        activationResolver({ data: { success: true } });
      });

      await waitFor(() => {
        expect(result.current.activating).toBe(false);
        expect(result.current.activated).toBe(true);
      });
    });
  });
});
