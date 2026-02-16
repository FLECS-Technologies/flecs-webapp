import React from 'react';
import { render, fireEvent, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterAll, vi } from 'vitest';
import Row from '../InstalledAppsListRow';
import { ReferenceDataContext } from '@contexts/data/ReferenceDataContext';
import { createMockApi } from '../../__mocks__/core-client-ts';

// Mock the API provider and Quest context
const mockUseProtectedApi = vi.fn();
const mockUseQuestContext = vi.fn();

vi.mock('@contexts/api/ApiProvider', () => ({
  useProtectedApi: () => mockUseProtectedApi(),
}));

vi.mock('@contexts/quests/QuestContext', () => ({
  useQuestContext: () => mockUseQuestContext(),
  QuestContext: {},
}));

const renderWithContext = (ui, { referenceDataValues }) => {
  return render(
    <ReferenceDataContext.Provider value={referenceDataValues}>{ui}</ReferenceDataContext.Provider>,
  );
};

describe('Test Installed Apps List row', () => {
  let mockApi;
  let mockQuestContext;
  const mockSetUpdateAppList = vi.fn();

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
  });

  const app = {
    appKey: {
      name: 'com.codesys.codesyscontrol',
      version: '4.2.0',
    },
    status: 'installed',
    editor: ':8080',
    multiInstance: true,
    installedVersions: ['4.2.0'], // Add this so UninstallButton renders
    instances: [
      {
        instanceId: 'com.codesys.codesyscontrol.01234567',
        instanceName: 'Smarthome',
        status: 'running',
        appKey: {
          version: '4.2.0',
        },
        editors: [{ name: 'editor', url: '/editor-0', port: 200 }],
      },
      {
        instanceId: 'com.codesys.codesyscontrol.12345678',
        instanceName: 'Energymanager',
        status: 'stopped',
        appKey: {
          version: '4.2.0',
        },
        editors: [{ name: 'editor', url: '/editor-1', port: 201 }],
      },
    ],
  };

  afterAll(() => {
    vi.clearAllMocks();
  });

  it('renders installed apps list row component', async () => {
    renderWithContext(
      <table>
        <tbody>
          <Row key={app.appKey.name} row={app} />
        </tbody>
      </table>,
      {
        referenceDataValues: { setUpdateAppList: mockSetUpdateAppList },
      },
    );

    const crtInstnButton = await waitFor(() =>
      screen.getByTestId('start-new-instance-icon-button-icon'),
    );
    const deleteButton = screen.getByTestId('DeleteIcon');

    expect(crtInstnButton).toBeVisible();
    expect(deleteButton).toBeVisible();
  });

  it('create new instance', async () => {
    renderWithContext(
      <table>
        <tbody>
          <Row key={app.appKey.name} row={app} />
        </tbody>
      </table>,
      {
        referenceDataValues: { setUpdateAppList: mockSetUpdateAppList },
      },
    );

    const crtInstnButton = await waitFor(() =>
      screen.getByTestId('start-new-instance-icon-button-icon'),
    );
    const deleteButton = screen.getByTestId('DeleteIcon');

    fireEvent.click(crtInstnButton);

    await waitFor(() => {
      expect(crtInstnButton).toBeVisible();
      expect(deleteButton).toBeVisible();
    });
  });

  it('test delete app', async () => {
    renderWithContext(
      <table>
        <tbody>
          <Row key={app.appKey.name} row={app} />
        </tbody>
      </table>,
      {
        referenceDataValues: { setUpdateAppList: mockSetUpdateAppList },
      },
    );

    const deleteButton = await waitFor(() => screen.getByTestId('DeleteIcon'));
    fireEvent.click(deleteButton);

    const yesButton = await waitFor(() => screen.getByText('Yes'));
    fireEvent.click(yesButton);

    await waitFor(() => {
      const createInstanceButton = screen.getByTestId('start-new-instance-icon-button-icon');
      expect(createInstanceButton).toBeVisible();
      expect(deleteButton).toBeVisible();
    });
  });

  it('test app with documentation url', async () => {
    app.documentationUrl = 'https://google.com';

    renderWithContext(
      <table>
        <tbody>
          <Row key={app.appKey.name} row={app} />
        </tbody>
      </table>,
      {
        referenceDataValues: { setUpdateAppList: mockSetUpdateAppList },
      },
    );

    const documentationButton = await waitFor(() => screen.getByTestId('HelpCenterIcon'));

    expect(documentationButton).toBeVisible();
  });

  it('test app without documentation url', async () => {
    app.documentationUrl = undefined;

    renderWithContext(
      <table>
        <tbody>
          <Row key={app.appKey.name} row={app} />
        </tbody>
      </table>,
      {
        referenceDataValues: { setUpdateAppList: mockSetUpdateAppList },
      },
    );

    await waitFor(() => {
      expect(() => screen.getByTestId('HelpCenterIcon')).toThrow();
    });
  });

  it('renders an app with an editor', async () => {
    const closeSpy = vi.fn();
    window.open = vi.fn().mockReturnValue({ close: closeSpy });

    renderWithContext(
      <table>
        <tbody>
          <Row key={app.appKey.name} row={app} />
        </tbody>
      </table>,
      {
        referenceDataValues: { setUpdateAppList: mockSetUpdateAppList },
      },
    );

    const expandButton = await waitFor(() => screen.getByLabelText('expand row'));
    fireEvent.click(expandButton);

    const editorButtons = await waitFor(() => screen.getAllByLabelText('open-editor-button-0'));
    expect(editorButtons.length).toBe(2);
    const editorButton1 = editorButtons[1];
    fireEvent.click(editorButton1);

    expect(editorButton1).toBeEnabled();
    expect(window.open).toHaveBeenCalled();
    expect(window.open).toHaveBeenCalledWith('http://localhost:3000/api/editor-1');
    const editorButton0 = editorButtons[0];
    fireEvent.click(editorButton0);

    expect(editorButton0).toBeEnabled();
    expect(window.open).toHaveBeenCalled();
    expect(window.open).toHaveBeenCalledWith('http://localhost:3000/api/editor-0');
  });
});
