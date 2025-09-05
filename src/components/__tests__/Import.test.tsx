/*
 * Copyright (c) 2022 FLECS Technologies GmbH
 *
 * Created on Fri Dec 09 2022
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
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import Import from '../Import';
import { ReferenceDataContext } from '../../data/ReferenceDataContext';
import { createMockApi } from '../../__mocks__/core-client-ts';
import { QuestState } from '@flecs/core-client-ts';

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

const renderWithContext = (ui: React.ReactElement, { referenceDataValues }: any) => {
  return render(
    <ReferenceDataContext.Provider value={referenceDataValues}>{ui}</ReferenceDataContext.Provider>,
  );
};

describe('Import component', () => {
  let mockApi: any;
  let mockQuestContext: any;
  const mockSetUpdateAppList = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockApi = createMockApi();
    mockQuestContext = {
      quests: { current: new Map() },
      fetchQuest: vi.fn(() => Promise.resolve()),
      waitForQuest: vi.fn(() => Promise.resolve({ state: QuestState.Success })),
    };

    mockUseProtectedApi.mockReturnValue(mockApi);
    mockUseQuestContext.mockReturnValue(mockQuestContext);

    // Mock File.text() method for JSON files
    global.File.prototype.text = vi.fn(() => Promise.resolve('{"test": "data"}'));
  });

  it('renders Import component', () => {
    renderWithContext(<Import />, {
      referenceDataValues: { setUpdateAppList: mockSetUpdateAppList },
    });

    expect(screen.getByText('Import')).toBeInTheDocument();
  });

  it('handles JSON file upload and shows success snackbar', async () => {
    renderWithContext(<Import />, {
      referenceDataValues: { setUpdateAppList: mockSetUpdateAppList },
    });

    const file = new File(['{"key":"value"}'], 'test.json', {
      type: 'application/json',
    });
    const input = screen.getByTestId('fileInput');

    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => expect(mockSetUpdateAppList).toHaveBeenCalledWith(true));
    await waitFor(() =>
      expect(screen.getByText('Importing finished successfully')).toBeInTheDocument(),
    );
  });

  it('handles tar.gz file upload and shows success snackbar', async () => {
    renderWithContext(<Import />, {
      referenceDataValues: { setUpdateAppList: mockSetUpdateAppList },
    });

    const file = new File(['dummy content'], 'test.tar.gz', {
      type: 'application/gzip',
    });
    const input = screen.getByTestId('fileInput');

    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => expect(mockSetUpdateAppList).toHaveBeenCalledWith(true));
    await waitFor(() =>
      expect(screen.getByText('Importing finished successfully')).toBeInTheDocument(),
    );
  });

  it('handles unsupported file type upload', () => {
    renderWithContext(<Import />, {
      referenceDataValues: { setUpdateAppList: mockSetUpdateAppList },
    });

    const file = new File(['dummy content'], 'test.txt', { type: 'text/plain' });
    const input = screen.getByTestId('fileInput');

    fireEvent.change(input, { target: { files: [file] } });

    expect(
      screen.queryByText('Unsupported file type. Please upload a .tar, .tar.gz or .json file.'),
    ).toBeInTheDocument();
  });

  it('shows error snackbar on API failure', async () => {
    // Mock the API to reject with an error for JSON files (deviceOnboardingPost)
    mockApi.device.deviceOnboardingPost = vi.fn(() => Promise.reject(new Error('Network Error')));

    renderWithContext(<Import />, {
      referenceDataValues: { setUpdateAppList: mockSetUpdateAppList },
    });

    const file = new File(['{"key":"value"}'], 'test.json', {
      type: 'application/json',
    });
    const input = screen.getByTestId('fileInput');

    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => expect(mockApi.device.deviceOnboardingPost).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(screen.getByText('Network Error')).toBeInTheDocument());
  });
});
