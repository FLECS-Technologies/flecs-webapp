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
import { render, renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';

// Import the component and types
import {
  DeviceStateProvider,
  useDeviceState,
  DeviceState,
  DeviceStateContextValue,
} from '../DeviceStateProvider';

describe('DeviceStateProvider', () => {
  describe('Initial State', () => {
    it('provides correct initial state values', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <DeviceStateProvider>{children}</DeviceStateProvider>
      );

      const { result } = renderHook(() => useDeviceState(), { wrapper });

      expect(result.current.loaded).toBe(false);
      expect(result.current.onboarded).toBe(false);
      expect(result.current.authenticated).toBe(false);
    });

    it('provides all expected state update functions', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <DeviceStateProvider>{children}</DeviceStateProvider>
      );

      const { result } = renderHook(() => useDeviceState(), { wrapper });

      expect(typeof result.current.setLoaded).toBe('function');
      expect(typeof result.current.setOnboarded).toBe('function');
      expect(typeof result.current.setAuthenticated).toBe('function');
    });

    it('maintains consistent function references across re-renders', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <DeviceStateProvider>{children}</DeviceStateProvider>
      );

      const { result, rerender } = renderHook(() => useDeviceState(), { wrapper });

      const initialSetLoaded = result.current.setLoaded;
      const initialSetOnboarded = result.current.setOnboarded;
      const initialSetAuthenticated = result.current.setAuthenticated;

      rerender();

      expect(result.current.setLoaded).toBe(initialSetLoaded);
      expect(result.current.setOnboarded).toBe(initialSetOnboarded);
      expect(result.current.setAuthenticated).toBe(initialSetAuthenticated);
    });
  });

  describe('State Updates', () => {
    describe('setLoaded', () => {
      it('updates loaded state to true', () => {
        const wrapper = ({ children }: { children: React.ReactNode }) => (
          <DeviceStateProvider>{children}</DeviceStateProvider>
        );

        const { result } = renderHook(() => useDeviceState(), { wrapper });

        expect(result.current.loaded).toBe(false);

        act(() => {
          result.current.setLoaded(true);
        });

        expect(result.current.loaded).toBe(true);
        // Other states should remain unchanged
        expect(result.current.onboarded).toBe(false);
        expect(result.current.authenticated).toBe(false);
      });

      it('updates loaded state to false', () => {
        const wrapper = ({ children }: { children: React.ReactNode }) => (
          <DeviceStateProvider>{children}</DeviceStateProvider>
        );

        const { result } = renderHook(() => useDeviceState(), { wrapper });

        // First set to true
        act(() => {
          result.current.setLoaded(true);
        });

        expect(result.current.loaded).toBe(true);

        // Then set back to false
        act(() => {
          result.current.setLoaded(false);
        });

        expect(result.current.loaded).toBe(false);
      });

      it('handles multiple rapid updates correctly', () => {
        const wrapper = ({ children }: { children: React.ReactNode }) => (
          <DeviceStateProvider>{children}</DeviceStateProvider>
        );

        const { result } = renderHook(() => useDeviceState(), { wrapper });

        act(() => {
          result.current.setLoaded(true);
          result.current.setLoaded(false);
          result.current.setLoaded(true);
        });

        expect(result.current.loaded).toBe(true);
      });
    });

    describe('setOnboarded', () => {
      it('updates onboarded state to true', () => {
        const wrapper = ({ children }: { children: React.ReactNode }) => (
          <DeviceStateProvider>{children}</DeviceStateProvider>
        );

        const { result } = renderHook(() => useDeviceState(), { wrapper });

        expect(result.current.onboarded).toBe(false);

        act(() => {
          result.current.setOnboarded(true);
        });

        expect(result.current.onboarded).toBe(true);
        // Other states should remain unchanged
        expect(result.current.loaded).toBe(false);
        expect(result.current.authenticated).toBe(false);
      });

      it('updates onboarded state to false', () => {
        const wrapper = ({ children }: { children: React.ReactNode }) => (
          <DeviceStateProvider>{children}</DeviceStateProvider>
        );

        const { result } = renderHook(() => useDeviceState(), { wrapper });

        // First set to true
        act(() => {
          result.current.setOnboarded(true);
        });

        expect(result.current.onboarded).toBe(true);

        // Then set back to false
        act(() => {
          result.current.setOnboarded(false);
        });

        expect(result.current.onboarded).toBe(false);
      });

      it('handles multiple rapid updates correctly', () => {
        const wrapper = ({ children }: { children: React.ReactNode }) => (
          <DeviceStateProvider>{children}</DeviceStateProvider>
        );

        const { result } = renderHook(() => useDeviceState(), { wrapper });

        act(() => {
          result.current.setOnboarded(true);
          result.current.setOnboarded(false);
          result.current.setOnboarded(true);
        });

        expect(result.current.onboarded).toBe(true);
      });
    });

    describe('setAuthenticated', () => {
      it('updates authenticated state to true', () => {
        const wrapper = ({ children }: { children: React.ReactNode }) => (
          <DeviceStateProvider>{children}</DeviceStateProvider>
        );

        const { result } = renderHook(() => useDeviceState(), { wrapper });

        expect(result.current.authenticated).toBe(false);

        act(() => {
          result.current.setAuthenticated(true);
        });

        expect(result.current.authenticated).toBe(true);
        // Other states should remain unchanged
        expect(result.current.loaded).toBe(false);
        expect(result.current.onboarded).toBe(false);
      });

      it('updates authenticated state to false', () => {
        const wrapper = ({ children }: { children: React.ReactNode }) => (
          <DeviceStateProvider>{children}</DeviceStateProvider>
        );

        const { result } = renderHook(() => useDeviceState(), { wrapper });

        // First set to true
        act(() => {
          result.current.setAuthenticated(true);
        });

        expect(result.current.authenticated).toBe(true);

        // Then set back to false
        act(() => {
          result.current.setAuthenticated(false);
        });

        expect(result.current.authenticated).toBe(false);
      });

      it('handles multiple rapid updates correctly', () => {
        const wrapper = ({ children }: { children: React.ReactNode }) => (
          <DeviceStateProvider>{children}</DeviceStateProvider>
        );

        const { result } = renderHook(() => useDeviceState(), { wrapper });

        act(() => {
          result.current.setAuthenticated(true);
          result.current.setAuthenticated(false);
          result.current.setAuthenticated(true);
        });

        expect(result.current.authenticated).toBe(true);
      });
    });
  });

  describe('Combined State Updates', () => {
    it('allows updating multiple states independently', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <DeviceStateProvider>{children}</DeviceStateProvider>
      );

      const { result } = renderHook(() => useDeviceState(), { wrapper });

      act(() => {
        result.current.setLoaded(true);
        result.current.setOnboarded(true);
      });

      expect(result.current.loaded).toBe(true);
      expect(result.current.onboarded).toBe(true);
      expect(result.current.authenticated).toBe(false);

      act(() => {
        result.current.setAuthenticated(true);
      });

      expect(result.current.loaded).toBe(true);
      expect(result.current.onboarded).toBe(true);
      expect(result.current.authenticated).toBe(true);
    });

    it('handles mixed state updates correctly', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <DeviceStateProvider>{children}</DeviceStateProvider>
      );

      const { result } = renderHook(() => useDeviceState(), { wrapper });

      // Set all to true
      act(() => {
        result.current.setLoaded(true);
        result.current.setOnboarded(true);
        result.current.setAuthenticated(true);
      });

      expect(result.current.loaded).toBe(true);
      expect(result.current.onboarded).toBe(true);
      expect(result.current.authenticated).toBe(true);

      // Set some back to false
      act(() => {
        result.current.setLoaded(false);
        result.current.setAuthenticated(false);
      });

      expect(result.current.loaded).toBe(false);
      expect(result.current.onboarded).toBe(true);
      expect(result.current.authenticated).toBe(false);
    });

    it('maintains state isolation between different state properties', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <DeviceStateProvider>{children}</DeviceStateProvider>
      );

      const { result } = renderHook(() => useDeviceState(), { wrapper });

      // Update loaded state multiple times
      act(() => {
        result.current.setLoaded(true);
        result.current.setLoaded(false);
        result.current.setLoaded(true);
      });

      // Other states should remain at their initial values
      expect(result.current.loaded).toBe(true);
      expect(result.current.onboarded).toBe(false);
      expect(result.current.authenticated).toBe(false);

      // Update onboarded state
      act(() => {
        result.current.setOnboarded(true);
      });

      // Loaded should remain unchanged
      expect(result.current.loaded).toBe(true);
      expect(result.current.onboarded).toBe(true);
      expect(result.current.authenticated).toBe(false);
    });
  });

  describe('Provider Context', () => {
    it('provides context to child components', () => {
      const TestComponent = () => {
        const state = useDeviceState();
        return (
          <div>
            <div data-testid="loaded">{state.loaded.toString()}</div>
            <div data-testid="onboarded">{state.onboarded.toString()}</div>
            <div data-testid="authenticated">{state.authenticated.toString()}</div>
          </div>
        );
      };

      const { getByTestId } = render(
        <DeviceStateProvider>
          <TestComponent />
        </DeviceStateProvider>,
      );

      expect(getByTestId('loaded')).toHaveTextContent('false');
      expect(getByTestId('onboarded')).toHaveTextContent('false');
      expect(getByTestId('authenticated')).toHaveTextContent('false');
    });

    it('allows child components to update state', () => {
      const TestComponent = () => {
        const state = useDeviceState();
        return (
          <div>
            <div data-testid="loaded">{state.loaded.toString()}</div>
            <button data-testid="set-loaded" onClick={() => state.setLoaded(true)}>
              Set Loaded
            </button>
          </div>
        );
      };

      const { getByTestId } = render(
        <DeviceStateProvider>
          <TestComponent />
        </DeviceStateProvider>,
      );

      expect(getByTestId('loaded')).toHaveTextContent('false');

      act(() => {
        getByTestId('set-loaded').click();
      });

      expect(getByTestId('loaded')).toHaveTextContent('true');
    });

    it('shares state between multiple child components', () => {
      const Component1 = () => {
        const state = useDeviceState();
        return (
          <div>
            <div data-testid="comp1-loaded">{state.loaded.toString()}</div>
            <button data-testid="comp1-set-loaded" onClick={() => state.setLoaded(true)}>
              Set Loaded
            </button>
          </div>
        );
      };

      const Component2 = () => {
        const state = useDeviceState();
        return (
          <div>
            <div data-testid="comp2-loaded">{state.loaded.toString()}</div>
            <div data-testid="comp2-onboarded">{state.onboarded.toString()}</div>
            <button data-testid="comp2-set-onboarded" onClick={() => state.setOnboarded(true)}>
              Set Onboarded
            </button>
          </div>
        );
      };

      const { getByTestId } = render(
        <DeviceStateProvider>
          <Component1 />
          <Component2 />
        </DeviceStateProvider>,
      );

      // Initial state
      expect(getByTestId('comp1-loaded')).toHaveTextContent('false');
      expect(getByTestId('comp2-loaded')).toHaveTextContent('false');
      expect(getByTestId('comp2-onboarded')).toHaveTextContent('false');

      // Update from component 1
      act(() => {
        getByTestId('comp1-set-loaded').click();
      });

      // Both components should see the update
      expect(getByTestId('comp1-loaded')).toHaveTextContent('true');
      expect(getByTestId('comp2-loaded')).toHaveTextContent('true');

      // Update from component 2
      act(() => {
        getByTestId('comp2-set-onboarded').click();
      });

      expect(getByTestId('comp2-onboarded')).toHaveTextContent('true');
    });

    it('provides the same context value to all consumers', () => {
      let context1: DeviceStateContextValue;
      let context2: DeviceStateContextValue;

      const Component1 = () => {
        context1 = useDeviceState();
        return <div>Component 1</div>;
      };

      const Component2 = () => {
        context2 = useDeviceState();
        return <div>Component 2</div>;
      };

      render(
        <DeviceStateProvider>
          <Component1 />
          <Component2 />
        </DeviceStateProvider>,
      );

      // Both components should receive the same context object
      expect(context1!).toBe(context2!);
      expect(context1!.setLoaded).toBe(context2!.setLoaded);
      expect(context1!.setOnboarded).toBe(context2!.setOnboarded);
      expect(context1!.setAuthenticated).toBe(context2!.setAuthenticated);
    });
  });

  describe('Hook Error Handling', () => {
    it('throws error when useDeviceState is used outside provider', () => {
      const TestComponent = () => {
        useDeviceState(); // This should throw
        return <div>test</div>;
      };

      // Suppress console.error for this test
      const originalError = console.error;
      console.error = vi.fn();

      expect(() => render(<TestComponent />)).toThrow(
        'useDeviceState must be used within DeviceStateProvider',
      );

      console.error = originalError;
    });

    it('provides context when used within provider', () => {
      const TestComponent = () => {
        const state = useDeviceState(); // This should not throw
        return <div data-testid="success">{state.loaded.toString()}</div>;
      };

      const { getByTestId } = render(
        <DeviceStateProvider>
          <TestComponent />
        </DeviceStateProvider>,
      );

      expect(getByTestId('success')).toHaveTextContent('false');
    });
  });

  describe('Provider Nesting and Isolation', () => {
    it('works when nested inside other providers', () => {
      const ParentProvider = ({ children }: { children: React.ReactNode }) => (
        <div data-testid="parent-provider">{children}</div>
      );

      const TestComponent = () => {
        const state = useDeviceState();
        return <div data-testid="loaded">{state.loaded.toString()}</div>;
      };

      const { getByTestId } = render(
        <ParentProvider>
          <DeviceStateProvider>
            <TestComponent />
          </DeviceStateProvider>
        </ParentProvider>,
      );

      expect(getByTestId('loaded')).toHaveTextContent('false');
    });

    it('maintains separate state when multiple providers are used', () => {
      const TestComponent1 = () => {
        const state = useDeviceState();
        return (
          <div>
            <div data-testid="provider1-loaded">{state.loaded.toString()}</div>
            <button data-testid="provider1-set-loaded" onClick={() => state.setLoaded(true)}>
              Set Loaded
            </button>
          </div>
        );
      };

      const TestComponent2 = () => {
        const state = useDeviceState();
        return (
          <div>
            <div data-testid="provider2-loaded">{state.loaded.toString()}</div>
            <button data-testid="provider2-set-loaded" onClick={() => state.setLoaded(true)}>
              Set Loaded
            </button>
          </div>
        );
      };

      const { getByTestId } = render(
        <div>
          <DeviceStateProvider>
            <TestComponent1 />
          </DeviceStateProvider>
          <DeviceStateProvider>
            <TestComponent2 />
          </DeviceStateProvider>
        </div>,
      );

      // Initial state for both providers
      expect(getByTestId('provider1-loaded')).toHaveTextContent('false');
      expect(getByTestId('provider2-loaded')).toHaveTextContent('false');

      // Update state in first provider
      act(() => {
        getByTestId('provider1-set-loaded').click();
      });

      // Only first provider should be updated
      expect(getByTestId('provider1-loaded')).toHaveTextContent('true');
      expect(getByTestId('provider2-loaded')).toHaveTextContent('false');

      // Update state in second provider
      act(() => {
        getByTestId('provider2-set-loaded').click();
      });

      // Both providers should now have their own true state
      expect(getByTestId('provider1-loaded')).toHaveTextContent('true');
      expect(getByTestId('provider2-loaded')).toHaveTextContent('true');
    });
  });

  describe('State Transitions and Workflows', () => {
    it('supports typical device initialization workflow', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <DeviceStateProvider>{children}</DeviceStateProvider>
      );

      const { result } = renderHook(() => useDeviceState(), { wrapper });

      // Initial state - nothing loaded
      expect(result.current.loaded).toBe(false);
      expect(result.current.onboarded).toBe(false);
      expect(result.current.authenticated).toBe(false);

      // Step 1: Device loads
      act(() => {
        result.current.setLoaded(true);
      });

      expect(result.current.loaded).toBe(true);
      expect(result.current.onboarded).toBe(false);
      expect(result.current.authenticated).toBe(false);

      // Step 2: Device gets onboarded
      act(() => {
        result.current.setOnboarded(true);
      });

      expect(result.current.loaded).toBe(true);
      expect(result.current.onboarded).toBe(true);
      expect(result.current.authenticated).toBe(false);

      // Step 3: User authenticates
      act(() => {
        result.current.setAuthenticated(true);
      });

      expect(result.current.loaded).toBe(true);
      expect(result.current.onboarded).toBe(true);
      expect(result.current.authenticated).toBe(true);
    });

    it('supports reset/logout workflow', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <DeviceStateProvider>{children}</DeviceStateProvider>
      );

      const { result } = renderHook(() => useDeviceState(), { wrapper });

      // Start with fully initialized state
      act(() => {
        result.current.setLoaded(true);
        result.current.setOnboarded(true);
        result.current.setAuthenticated(true);
      });

      expect(result.current.loaded).toBe(true);
      expect(result.current.onboarded).toBe(true);
      expect(result.current.authenticated).toBe(true);

      // Logout - just remove authentication
      act(() => {
        result.current.setAuthenticated(false);
      });

      expect(result.current.loaded).toBe(true);
      expect(result.current.onboarded).toBe(true);
      expect(result.current.authenticated).toBe(false);

      // Device reset - remove onboarding
      act(() => {
        result.current.setOnboarded(false);
      });

      expect(result.current.loaded).toBe(true);
      expect(result.current.onboarded).toBe(false);
      expect(result.current.authenticated).toBe(false);
    });

    it('handles partial state reset scenarios', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <DeviceStateProvider>{children}</DeviceStateProvider>
      );

      const { result } = renderHook(() => useDeviceState(), { wrapper });

      // Set up a specific scenario
      act(() => {
        result.current.setLoaded(true);
        result.current.setAuthenticated(true);
        // onboarded remains false
      });

      expect(result.current.loaded).toBe(true);
      expect(result.current.onboarded).toBe(false);
      expect(result.current.authenticated).toBe(true);

      // Now complete onboarding
      act(() => {
        result.current.setOnboarded(true);
      });

      expect(result.current.loaded).toBe(true);
      expect(result.current.onboarded).toBe(true);
      expect(result.current.authenticated).toBe(true);
    });
  });

  describe('Performance and Optimization', () => {
    it('maintains stable function references to prevent unnecessary re-renders', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <DeviceStateProvider>{children}</DeviceStateProvider>
      );

      const { result, rerender } = renderHook(() => useDeviceState(), { wrapper });

      const initialSetLoaded = result.current.setLoaded;
      const initialSetOnboarded = result.current.setOnboarded;
      const initialSetAuthenticated = result.current.setAuthenticated;

      // Re-render should maintain same function references
      rerender();

      expect(result.current.setLoaded).toBe(initialSetLoaded);
      expect(result.current.setOnboarded).toBe(initialSetOnboarded);
      expect(result.current.setAuthenticated).toBe(initialSetAuthenticated);
    });

    it('only updates state when value actually changes', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <DeviceStateProvider>{children}</DeviceStateProvider>
      );

      const { result } = renderHook(() => useDeviceState(), { wrapper });

      // Initial state
      expect(result.current.loaded).toBe(false);

      // Setting to same value multiple times
      act(() => {
        result.current.setLoaded(false);
        result.current.setLoaded(false);
        result.current.setLoaded(false);
      });

      // Should still be false
      expect(result.current.loaded).toBe(false);

      // Setting to different value
      act(() => {
        result.current.setLoaded(true);
      });

      expect(result.current.loaded).toBe(true);

      // Setting to same value again
      act(() => {
        result.current.setLoaded(true);
        result.current.setLoaded(true);
      });

      // Should still be true
      expect(result.current.loaded).toBe(true);
    });

    it('uses callback optimization for state setters', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <DeviceStateProvider>{children}</DeviceStateProvider>
      );

      const { result } = renderHook(() => useDeviceState(), { wrapper });

      // Functions should be memoized with useCallback
      expect(typeof result.current.setLoaded).toBe('function');
      expect(typeof result.current.setOnboarded).toBe('function');
      expect(typeof result.current.setAuthenticated).toBe('function');

      // Function references should be stable across renders
      const setters = {
        setLoaded: result.current.setLoaded,
        setOnboarded: result.current.setOnboarded,
        setAuthenticated: result.current.setAuthenticated,
      };

      // Update state to trigger re-render
      act(() => {
        result.current.setLoaded(true);
      });

      // Functions should still be the same reference
      expect(result.current.setLoaded).toBe(setters.setLoaded);
      expect(result.current.setOnboarded).toBe(setters.setOnboarded);
      expect(result.current.setAuthenticated).toBe(setters.setAuthenticated);
    });
  });

  describe('Type Safety and Interfaces', () => {
    it('implements DeviceState interface correctly', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <DeviceStateProvider>{children}</DeviceStateProvider>
      );

      const { result } = renderHook(() => useDeviceState(), { wrapper });

      // Check that the returned value matches DeviceState interface
      const state: DeviceState = {
        loaded: result.current.loaded,
        onboarded: result.current.onboarded,
        authenticated: result.current.authenticated,
      };

      expect(typeof state.loaded).toBe('boolean');
      expect(typeof state.onboarded).toBe('boolean');
      expect(typeof state.authenticated).toBe('boolean');
    });

    it('implements DeviceStateContextValue interface correctly', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <DeviceStateProvider>{children}</DeviceStateProvider>
      );

      const { result } = renderHook(() => useDeviceState(), { wrapper });

      // Check that the returned value has all required properties
      expect(typeof result.current.loaded).toBe('boolean');
      expect(typeof result.current.onboarded).toBe('boolean');
      expect(typeof result.current.authenticated).toBe('boolean');
      expect(typeof result.current.setLoaded).toBe('function');
      expect(typeof result.current.setOnboarded).toBe('function');
      expect(typeof result.current.setAuthenticated).toBe('function');

      // Check that functions accept the correct parameter types
      act(() => {
        result.current.setLoaded(true);
        result.current.setOnboarded(false);
        result.current.setAuthenticated(true);
      });

      expect(result.current.loaded).toBe(true);
      expect(result.current.onboarded).toBe(false);
      expect(result.current.authenticated).toBe(true);
    });
  });
});
