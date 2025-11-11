/*
 * Copyright (c) 2021 FLECS Technologies GmbH
 *
 * Created on Tue Nov 30 2021
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
import { render, waitFor } from '@testing-library/react';
import { describe, test, expect, beforeEach, vi } from 'vitest';
import { BrowserRouter as Router } from 'react-router-dom';
import Frame from '../Frame';
import { DarkModeState } from '../../styles/ThemeHandler';
import { QuestContextProvider } from '../quests/QuestContext';
import { createMockApi } from '../../__mocks__/core-client-ts';

// Mock the API provider
const mockUseProtectedApi = vi.fn();

vi.mock('../providers/ApiProvider', () => ({
  useProtectedApi: () => mockUseProtectedApi(),
}));

// Mock react-router-dom navigate
const mockedUsedNavigate = vi.fn();

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useNavigate: () => mockedUsedNavigate,
  };
});

// Mock react-oidc-context
vi.mock('react-oidc-context', () => ({
  useAuth: vi.fn(() => ({
    user: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
  })),
  AuthProvider: ({ children }) => children,
}));

// Mock window.matchMedia for theme handler
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

describe('Frame', () => {
  let mockApi;

  beforeEach(() => {
    vi.clearAllMocks();
    mockApi = createMockApi();
    mockUseProtectedApi.mockReturnValue(mockApi);
  });

  test('renders Frame component', async () => {
    const { getByLabelText } = render(
      <Router>
        <DarkModeState>
          <QuestContextProvider>
            <Frame />
          </QuestContextProvider>
        </DarkModeState>
      </Router>,
    );

    await waitFor(() => {
      const headerPlaceholder = getByLabelText('Header-Placeholder');
      expect(headerPlaceholder).toBeVisible();
    });
  });

  test('renders Frame component with children', async () => {
    const TestChild = () => <div data-testid="test-child">Test Content</div>;

    const { getByTestId, getByLabelText } = render(
      <Router>
        <DarkModeState>
          <QuestContextProvider>
            <Frame>
              <TestChild />
            </Frame>
          </QuestContextProvider>
        </DarkModeState>
      </Router>,
    );

    await waitFor(() => {
      expect(getByLabelText('Header-Placeholder')).toBeVisible();
      expect(getByTestId('test-child')).toBeVisible();
      expect(getByTestId('test-child')).toHaveTextContent('Test Content');
    });
  });
});
