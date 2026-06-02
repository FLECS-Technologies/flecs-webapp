/**
 * Import — dropzone variant tests.
 * Network + quest layers are mocked at module level; we assert the dropped
 * file reaches the correct API call (or is rejected before any call).
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { renderWithProviders } from '@test/test-utils';

vi.mock('@features/notifications/quests/hooks', () => ({
  useQuestActions: () => ({
    fetchQuest: vi.fn().mockResolvedValue(undefined),
    waitForQuest: vi.fn().mockResolvedValue({ state: 'finished', description: '' }),
  }),
}));
vi.mock('@features/notifications/quests/QuestItem', () => ({
  questStateFinishedOk: () => true,
}));
vi.mock('@generated/core/flecsport/flecsport', () => ({
  postImports: vi.fn().mockResolvedValue({ status: 202, data: { jobId: 1 } }),
}));
vi.mock('@generated/core/device/device', () => ({
  postDeviceOnboarding: vi.fn().mockResolvedValue({ status: 202, data: { jobId: 2 } }),
}));

import Import from './Import';
import { postImports } from '@generated/core/flecsport/flecsport';
import { postDeviceOnboarding } from '@generated/core/device/device';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('Import dropzone', () => {
  it('renders as a plain button without the dropzone prop', () => {
    renderWithProviders(<Import />);
    expect(screen.queryByTestId('import-dropzone')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /import config/i })).toBeInTheDocument();
  });

  it('imports a dropped .tar archive via the imports API', async () => {
    renderWithProviders(<Import dropzone />);
    const tar = new File(['x'], 'backup.tar', { type: 'application/x-tar' });
    fireEvent.drop(screen.getByTestId('import-dropzone'), { dataTransfer: { files: [tar] } });
    await waitFor(() => expect(postImports).toHaveBeenCalledWith({ file: tar }));
  });

  it('imports a dropped .json config via the onboarding API', async () => {
    renderWithProviders(<Import dropzone />);
    const json = new File(['{"apps":[]}'], 'config.json', { type: 'application/json' });
    fireEvent.drop(screen.getByTestId('import-dropzone'), { dataTransfer: { files: [json] } });
    await waitFor(() => expect(postDeviceOnboarding).toHaveBeenCalledWith({ apps: [] }));
    expect(postImports).not.toHaveBeenCalled();
  });

  it('rejects an unsupported file type without any API call', async () => {
    renderWithProviders(<Import dropzone />);
    const png = new File(['x'], 'image.png', { type: 'image/png' });
    fireEvent.drop(screen.getByTestId('import-dropzone'), { dataTransfer: { files: [png] } });
    await waitFor(() => {
      expect(postImports).not.toHaveBeenCalled();
      expect(postDeviceOnboarding).not.toHaveBeenCalled();
    });
  });
});
