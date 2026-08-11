/**
 * Import — dropzone variant tests.
 * Network + quest layers are mocked at module level; we assert the dropped
 * file reaches the correct API call (or is rejected before any call).
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@test/test-utils';

const apiMocks = vi.hoisted(() => ({
  restoreBackup: vi.fn(),
  startOnboarding: vi.fn(),
}));

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
  usePostImports: () => ({ mutateAsync: apiMocks.restoreBackup, isPending: false }),
}));
vi.mock('@generated/core/device/device', () => ({
  usePostDeviceOnboarding: () => ({ mutateAsync: apiMocks.startOnboarding, isPending: false }),
}));

import Import from './Import';

beforeEach(() => {
  vi.clearAllMocks();
  apiMocks.restoreBackup.mockResolvedValue({ status: 202, data: { jobId: 1 } });
  apiMocks.startOnboarding.mockResolvedValue({ status: 202, data: { jobId: 2 } });
});

describe('Import dropzone', () => {
  it('renders as a plain button without the dropzone prop', () => {
    renderWithProviders(<Import mode="restore" />);
    expect(screen.queryByTestId('import-dropzone')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /restore backup/i })).toBeInTheDocument();
  });

  it('imports a dropped .tar archive via the imports API', async () => {
    const onImportStarted = vi.fn();
    renderWithProviders(<Import dropzone mode="restore" onImportStarted={onImportStarted} />);
    const tar = new File(['x'], 'backup.tar', { type: 'application/x-tar' });
    fireEvent.drop(screen.getByTestId('import-dropzone'), { dataTransfer: { files: [tar] } });
    await waitFor(() =>
      expect(apiMocks.restoreBackup).toHaveBeenCalledWith({ data: { file: tar } }),
    );
    expect(onImportStarted).toHaveBeenCalledOnce();
  });

  it('opens the file picker from the entire dropzone', async () => {
    const user = userEvent.setup();
    renderWithProviders(<Import dropzone mode="onboard" buttonText="Choose import file" />);
    const input = screen.getByTestId('fileInput');
    const click = vi.spyOn(input, 'click');

    await user.click(screen.getByTestId('import-dropzone'));

    expect(click).toHaveBeenCalledOnce();
  });

  it('imports a dropped apps.json via the onboarding API', async () => {
    renderWithProviders(<Import dropzone mode="onboard" />);
    const json = new File(['{"apps":[]}'], 'apps.json', { type: 'application/json' });
    fireEvent.drop(screen.getByTestId('import-dropzone'), { dataTransfer: { files: [json] } });
    await waitFor(() =>
      expect(apiMocks.startOnboarding).toHaveBeenCalledWith({ data: { apps: [] } }),
    );
    expect(apiMocks.restoreBackup).not.toHaveBeenCalled();
  });

  it('keeps onboarding files out of the restore API', async () => {
    renderWithProviders(<Import dropzone mode="restore" />);
    const json = new File(['{"apps":[]}'], 'apps.json', { type: 'application/json' });
    fireEvent.drop(screen.getByTestId('import-dropzone'), { dataTransfer: { files: [json] } });
    await waitFor(() => {
      expect(apiMocks.restoreBackup).not.toHaveBeenCalled();
      expect(apiMocks.startOnboarding).not.toHaveBeenCalled();
    });
  });

  it('keeps backup archives out of the onboarding API', async () => {
    renderWithProviders(<Import dropzone mode="onboard" />);
    const tar = new File(['x'], 'backup.tar', { type: 'application/x-tar' });
    fireEvent.drop(screen.getByTestId('import-dropzone'), { dataTransfer: { files: [tar] } });
    await waitFor(() => {
      expect(apiMocks.restoreBackup).not.toHaveBeenCalled();
      expect(apiMocks.startOnboarding).not.toHaveBeenCalled();
    });
  });

  it('rejects an unsupported file type without any API call', async () => {
    const onImportStarted = vi.fn();
    renderWithProviders(<Import dropzone mode="restore" onImportStarted={onImportStarted} />);
    const png = new File(['x'], 'image.png', { type: 'image/png' });
    fireEvent.drop(screen.getByTestId('import-dropzone'), { dataTransfer: { files: [png] } });
    await waitFor(() => {
      expect(apiMocks.restoreBackup).not.toHaveBeenCalled();
      expect(apiMocks.startOnboarding).not.toHaveBeenCalled();
    });
    expect(onImportStarted).not.toHaveBeenCalled();
  });
});
