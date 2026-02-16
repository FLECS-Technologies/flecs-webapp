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
import userEvent from '@testing-library/user-event';
import { describe, test, expect, beforeEach, vi } from 'vitest';
import { BrowserRouter as Router } from 'react-router-dom';
import DeviceAppsList from '../InstalledAppsList';
import { createMockApi } from '../../__mocks__/core-client-ts';
import { QuestContextProvider } from '@contexts/quests/QuestContext';

// Mock the API provider
const mockUseProtectedApi = vi.fn();

vi.mock('@contexts/api/ApiProvider', () => ({
  useProtectedApi: () => mockUseProtectedApi(),
}));

describe('Test Installed Apps List', () => {
  let mockApi;

  beforeEach(() => {
    vi.clearAllMocks();
    mockApi = createMockApi();
    mockUseProtectedApi.mockReturnValue(mockApi);
  });

  test('renders installed apps list component', async () => {
    const user = userEvent.setup();

    const { getByTestId } = render(
      <Router>
        <QuestContextProvider>
          <DeviceAppsList />
        </QuestContextProvider>
      </Router>,
    );

    await waitFor(() => {
      const sideloadButton = getByTestId('DeveloperModeIcon');
      expect(sideloadButton).toBeVisible();
    });

    const sideloadButton = getByTestId('DeveloperModeIcon');
    await user.click(sideloadButton);

    await waitFor(() => {
      expect(sideloadButton).toBeVisible();
    });
  });
});
