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
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QuestState } from '@flecs/core-client-ts';
import UninstallButton from '../UninstallButton';
import { App } from '../../../../models/app';
import { Version } from '../../../../models/version';
import { ReferenceDataContextProvider } from '../../../../data/ReferenceDataContext';
import { QuestContext } from '../../../quests/QuestContext';
import { createMockApi, createMockQuestResult } from '../../../../__mocks__/core-client-ts';

// Mock the API provider
const mockUseProtectedApi = vi.fn();

vi.mock('../../../../components/providers/ApiProvider', () => ({
  useProtectedApi: () => mockUseProtectedApi(),
}));

const mockApp: App = {
  app: 'test-app',
  appKey: {
    name: 'tech.flecs.test',
    version: '1.0.0',
  },
  title: 'Test App',
  installedVersions: ['1.0.0'],
};

const mockVersion: Version = {
  version: '1.0.0',
  release_notes: 'Initial release',
  installed: true,
};

describe('UninstallButton', () => {
  const mockOnUninstallComplete = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderUninstallButton = (
    props: {
      app?: App;
      selectedVersion?: Version;
      displayState?: string;
      variant?: 'button' | 'icon';
      onUninstallComplete?: (success: boolean, message: string, error?: string) => void;
    } = {},
    questContextValue: any = null,
  ) => {
    const defaultProps = {
      app: mockApp,
      selectedVersion: mockVersion,
      onUninstallComplete: mockOnUninstallComplete,
      ...props,
    };

    const mockApi = createMockApi();
    const defaultQuestContext = {
      quests: { current: new Map() },
      fetchQuest: vi.fn(() => Promise.resolve()),
      waitForQuest: vi.fn().mockResolvedValue(createMockQuestResult({ state: QuestState.Success })),
      fetchQuests: vi.fn(() => Promise.resolve()),
      setFetching: vi.fn(),
      fetching: false,
      clearQuests: vi.fn(() => Promise.resolve()),
      waitForQuests: vi.fn(),
      mainQuestIds: [],
    };

    mockUseProtectedApi.mockReturnValue(mockApi);

    return render(
      <ReferenceDataContextProvider>
        <QuestContext.Provider value={questContextValue || defaultQuestContext}>
          <UninstallButton {...defaultProps} />
        </QuestContext.Provider>
      </ReferenceDataContextProvider>,
    );
  };

  describe('Basic Rendering', () => {
    it('renders uninstall button by default', () => {
      renderUninstallButton();
      expect(screen.getByRole('button', { name: /uninstall/i })).toBeInTheDocument();
    });

    it('renders icon variant when specified', () => {
      renderUninstallButton({ variant: 'icon' });
      expect(screen.getByRole('button')).toBeInTheDocument();
      expect(screen.getByTestId('DeleteIcon')).toBeInTheDocument();
    });

    it('does not render when version is not installed', () => {
      renderUninstallButton({
        selectedVersion: { version: '2.0.0', release_notes: 'Not installed' },
      });
      expect(screen.queryByRole('button', { name: /uninstall/i })).not.toBeInTheDocument();
    });
  });

  describe('Dialog Functionality', () => {
    it('opens confirm dialog when uninstall button is clicked', async () => {
      renderUninstallButton();

      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: /uninstall/i }));
      });

      expect(screen.getByText(/are you sure you want to uninstall/i)).toBeInTheDocument();
      expect(screen.getByText('Uninstall Test App?')).toBeInTheDocument();
    });

    it('closes dialog when No is clicked', async () => {
      renderUninstallButton();

      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: /uninstall/i }));
      });

      await act(async () => {
        const noButton = screen.getByRole('button', { name: 'No' });
        fireEvent.click(noButton);
      });

      await waitFor(() => {
        expect(screen.queryByText(/are you sure you want to uninstall/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('Uninstall Process', () => {
    it('successfully uninstalls app when Yes is clicked', async () => {
      const mockApi = createMockApi();
      mockApi.app.appsAppDelete.mockResolvedValue({ data: { jobId: 123 } });

      const mockQuestContext = {
        quests: { current: new Map() },
        fetchQuest: vi.fn(() => Promise.resolve()),
        waitForQuest: vi
          .fn()
          .mockResolvedValue(createMockQuestResult({ state: QuestState.Success })),
        fetchQuests: vi.fn(() => Promise.resolve()),
        setFetching: vi.fn(),
        fetching: false,
        clearQuests: vi.fn(() => Promise.resolve()),
        waitForQuests: vi.fn(),
        mainQuestIds: [],
      };

      mockUseProtectedApi.mockReturnValue(mockApi);

      render(
        <ReferenceDataContextProvider>
          <QuestContext.Provider value={mockQuestContext}>
            <UninstallButton
              app={mockApp}
              selectedVersion={mockVersion}
              onUninstallComplete={mockOnUninstallComplete}
            />
          </QuestContext.Provider>
        </ReferenceDataContextProvider>,
      );

      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: /uninstall/i }));
      });

      await act(async () => {
        const yesButton = screen.getByRole('button', { name: 'Yes' });
        fireEvent.click(yesButton);
      });

      await waitFor(() => {
        expect(mockOnUninstallComplete).toHaveBeenCalledWith(
          true,
          'Test App successfully uninstalled.',
        );
      });
    });

    it('handles uninstall failure', async () => {
      const mockApi = createMockApi();
      mockApi.app.appsAppDelete.mockResolvedValue({ data: { jobId: 123 } });

      const failedQuestContext = {
        quests: { current: new Map() },
        fetchQuest: vi.fn(() => Promise.resolve()),
        waitForQuest: vi.fn().mockResolvedValue(
          createMockQuestResult({
            state: QuestState.Failing,
            result: 'Uninstall failed',
          }),
        ),
        fetchQuests: vi.fn(() => Promise.resolve()),
        setFetching: vi.fn(),
        fetching: false,
        clearQuests: vi.fn(() => Promise.resolve()),
        waitForQuests: vi.fn(),
        mainQuestIds: [],
      };

      mockUseProtectedApi.mockReturnValue(mockApi);

      render(
        <ReferenceDataContextProvider>
          <QuestContext.Provider value={failedQuestContext}>
            <UninstallButton
              app={mockApp}
              selectedVersion={mockVersion}
              onUninstallComplete={mockOnUninstallComplete}
            />
          </QuestContext.Provider>
        </ReferenceDataContextProvider>,
      );

      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: /uninstall/i }));
      });

      await act(async () => {
        const yesButton = screen.getByRole('button', { name: 'Yes' });
        fireEvent.click(yesButton);
      });

      await waitFor(() => {
        expect(mockOnUninstallComplete).toHaveBeenCalledWith(
          false,
          'Failed to uninstall Test App.',
          'Uninstall failed',
        );
      });
    });

    it('handles API error during uninstall', async () => {
      const mockApi = createMockApi();
      mockApi.app.appsAppDelete.mockRejectedValue(new Error('API Error'));

      const mockQuestContext = {
        quests: { current: new Map() },
        fetchQuest: vi.fn(() => Promise.resolve()),
        waitForQuest: vi.fn(),
        fetchQuests: vi.fn(() => Promise.resolve()),
        setFetching: vi.fn(),
        fetching: false,
        clearQuests: vi.fn(() => Promise.resolve()),
        waitForQuests: vi.fn(),
        mainQuestIds: [],
      };

      mockUseProtectedApi.mockReturnValue(mockApi);

      render(
        <ReferenceDataContextProvider>
          <QuestContext.Provider value={mockQuestContext}>
            <UninstallButton
              app={mockApp}
              selectedVersion={mockVersion}
              onUninstallComplete={mockOnUninstallComplete}
            />
          </QuestContext.Provider>
        </ReferenceDataContextProvider>,
      );

      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: /uninstall/i }));
      });

      await act(async () => {
        const yesButton = screen.getByRole('button', { name: 'Yes' });
        fireEvent.click(yesButton);
      });

      await waitFor(() => {
        expect(mockOnUninstallComplete).toHaveBeenCalledWith(
          false,
          'Failed to uninstall Test App.',
          'API Error',
        );
      });
    });
  });
});
