/*
 * Copyright (c) 2021 FLECS Technologies GmbH
 *
 * Created on Mon Nov 04 2024
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
import { screen, render, fireEvent, waitFor, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import Card from '../Card';
import { SystemContextProvider } from '../../data/SystemProvider';
import { SystemData } from '../../data/SystemData';
import { createMockApi } from '../../__mocks__/core-client-ts';
import { useMarketplaceUser } from '../providers/MarketplaceUserProvider';

// Mock the API provider and Quest context
const mockUseProtectedApi = vi.fn();
const mockUseQuestContext = vi.fn();

vi.mock('../../components/providers/ApiProvider', () => ({
  useProtectedApi: () => mockUseProtectedApi(),
}));

vi.mock('../quests/QuestContext', () => ({
  useQuestContext: () => mockUseQuestContext(),
  QuestContext: {},
}));

// Mock the System Context to provide architecture info
vi.mock('../../data/SystemProvider', () => ({
  useSystemContext: () => ({
    systemInfo: { arch: 'amd64' },
  }),
  SystemContextProvider: ({ children }) => children,
}));

// Mock SystemData to prevent side effect API calls
vi.mock('../../data/SystemData', () => ({
  SystemData: ({ children }) => children,
}));

// Mock MarketplaceUserProvider
vi.mock('../providers/MarketplaceUserProvider', () => ({
  useMarketplaceUser: vi.fn(),
}));

describe('Card', () => {
  let mockApi;
  let mockQuestContext;

  beforeEach(() => {
    vi.clearAllMocks();
    mockApi = createMockApi();
    mockQuestContext = {
      quests: { current: new Map() },
      fetchQuest: vi.fn(() => Promise.resolve()),
      waitForQuest: vi.fn(() => Promise.resolve({ state: 'Success' })),
    };

    mockUseProtectedApi.mockReturnValue(mockApi);
    mockUseQuestContext.mockReturnValue(mockQuestContext);

    // Mock MarketplaceUserProvider
    useMarketplaceUser.mockReturnValue({
      user: null,
      setUser: vi.fn(),
      userChanged: false,
      authHeaderUseBearer: vi.fn(() => ({})),
      authorizationHeaderUseBearer: vi.fn(() => ({})),
      authHeaderUseXAccess: vi.fn(() => ({})),
      jwt: vi.fn(() => ''),
    });
  });

  it('renders Card component', async () => {
    await act(async () => {
      render(<Card />);
    });

    expect(screen.getByTestId('app-card')).toBeInTheDocument();
  });

  it('Click request', async () => {
    render(<Card />);

    const requestButton = await waitFor(() => screen.getByTestId('app-request-button'));
    expect(requestButton).toBeVisible();
    expect(requestButton).toBeEnabled();

    await act(async () => {
      fireEvent.click(requestButton);
    });
  });

  it('Click install', async () => {
    await act(async () => {
      render(
        <SystemContextProvider>
          <SystemData>
            <Card
              app="Testapp"
              avatar=""
              title="Test App Title"
              author="Test App author"
              versions={['Test App Version']}
              description="Test App Description"
              status="uninstalled"
              availability="available"
              requirement={['amd64']} // valid architecture
              installedVersions={[]}
              instances={[]}
            />
          </SystemData>
        </SystemContextProvider>,
      );
    });

    const installButton = await waitFor(() => screen.getByLabelText('install-app-button'));
    const uninstallButton = screen.queryByText('Uninstall');
    const requestButton = screen.getByTestId('app-request-button');

    expect(installButton).toBeVisible();
    expect(installButton).toBeEnabled();
    expect(uninstallButton).toBeNull();
    expect(requestButton).not.toBeVisible();
  });

  it('Click uninstall', async () => {
    await act(async () => {
      render(
        <Card
          app="Testapp"
          avatar=""
          title="Test App Title"
          author="Test App author"
          version="Test App Version"
          description="Test App Description"
          status="installed"
          availability="available"
          installedVersions={['Test App Version']}
          instances={[]}
        />,
      );
    });

    const uninstallButton = await waitFor(() => screen.getByText('Uninstall'));

    await act(async () => {
      fireEvent.click(uninstallButton);
    });
  });

  it('Card with documentation url', async () => {
    render(<Card documentationUrl="https://google.com" />);

    const helpCenterIcon = await waitFor(() => screen.getByTestId('HelpCenterIcon'));
    expect(helpCenterIcon).toBeVisible();
  });

  it('Card without documentation url', async () => {
    render(<Card />);

    await waitFor(() => {
      expect(() => screen.getByTestId('HelpCenterIcon')).toThrow();
    });
  });
});
