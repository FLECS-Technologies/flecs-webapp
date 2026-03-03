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

import { render, screen } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import { vi } from 'vitest';
import Drawer from '../Drawer';

vi.mock('@shared/hooks/app-queries', () => ({
  useAppList: () => ({ appList: [], isLoading: false, isError: false }),
}));

vi.mock('@shared/hooks/marketplace-queries', () => ({
  useMarketplaceProducts: () => ({ data: [], isLoading: false }),
}));

vi.mock('@features/auth/providers/OAuth4WebApiAuthProvider', () => ({
  useOAuth4WebApiAuth: () => ({ user: null, signOut: vi.fn() }),
}));

vi.mock('@app/theme/ThemeHandler', () => ({
  useDarkMode: () => ({ isDarkMode: false, setDarkMode: vi.fn() }),
}));

vi.mock('../FLECSLogo', () => ({
  default: () => <span data-testid="flecs-logo" />,
}));

describe('Drawer', () => {
  test('renders Drawer component', () => {
    render(
      <Router>
        <Drawer />
      </Router>,
    );

    expect(screen.getByText('Installed')).toBeVisible();
    expect(screen.getByText('Browse')).toBeVisible();
    expect(screen.getByText('System')).toBeVisible();
    expect(screen.getByText('APPS')).toBeVisible();
    expect(screen.getByText('DEVICE')).toBeVisible();
    expect(screen.getByText('FLECS')).toBeVisible();
    expect(screen.getByText('Sign in')).toBeVisible();
  });
});
