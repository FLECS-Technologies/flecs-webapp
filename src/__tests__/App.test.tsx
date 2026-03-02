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
import { BrowserRouter as Router } from 'react-router-dom';
import { render, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import App from '../App';

// Mock the entire App's complex dependency tree for a basic smoke test
vi.mock('../components/layout/Frame', () => ({
  default: ({ children }) => <div data-testid="frame">{children}</div>,
}));

vi.mock('../data/AppList', () => ({
  AppList: ({ children }) => <div data-testid="app-list">{children}</div>,
}));

vi.mock('../pages/ui-routes', () => ({
  UIRoutes: () => <div data-testid="ui-routes">Routes</div>,
}));

vi.mock('../data/SystemData', () => ({
  SystemData: ({ children }) => <div data-testid="system-data">{children}</div>,
}));

vi.mock('../styles/ThemeHandler', () => ({
  ThemeHandler: ({ children }) => <div data-testid="theme-handler">{children}</div>,
}));

vi.mock('@contexts/Providers', () => ({
  default: ({ children }) => <div data-testid="providers">{children}</div>,
}));

describe('App', () => {
  it('renders App component', async () => {
    const { getByTestId } = render(
      <Router>
        <App />
      </Router>,
    );

    await waitFor(() => {
      expect(getByTestId('theme-handler')).toBeDefined();
      expect(getByTestId('providers')).toBeDefined();
      expect(getByTestId('frame')).toBeDefined();
      expect(getByTestId('system-data')).toBeDefined();
      expect(getByTestId('app-list')).toBeDefined();
      expect(getByTestId('ui-routes')).toBeDefined();
    });
  });
});
