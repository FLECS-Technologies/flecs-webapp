import React, { useState } from 'react';
import LoadButton from '@app/components/LoadButton';
import LoadIconButton from '@app/components/LoadIconButton';
import ConfirmDialog from '@app/components/ConfirmDialog';
import { Trash2 } from 'lucide-react';
import { useInvalidateAppData } from '@features/apps/hooks/app-queries';
import { useQuestActions } from '@features/notifications/quests/hooks';
import { useDeleteAppsApp } from '@generated/core/apps/apps';
import { questStateFinishedOk } from '@features/notifications/quests/QuestItem';
type App = any;
type Version = string;

interface UninstallButtonProps {
  app: App;
  selectedVersion: Version;
  displayState?: string;
  variant?: 'button' | 'icon' | 'menuItem';
  onUninstallComplete?: (success: boolean, message: string, error?: string) => void;
  onMenuClose?: () => void;
}

export default function UninstallButton({ app, selectedVersion, displayState, variant = 'button', onUninstallComplete, onMenuClose }: UninstallButtonProps): React.ReactElement | null {
  const invalidateAppData = useInvalidateAppData();
  const { fetchQuest, waitForQuest } = useQuestActions();
  const { mutateAsync: deleteApp } = useDeleteAppsApp();
  const [uninstalling, setUninstalling] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const uninstallApp = async (app: App) => {
    onMenuClose?.();
    setUninstalling(true);
    try {
      const resp = await deleteApp({ app: app.appKey.name, params: { version: selectedVersion.version } });
      await fetchQuest(resp.data?.jobId);
      const quest = await waitForQuest(resp.data?.jobId);
      if (questStateFinishedOk(quest.state)) { invalidateAppData(); onUninstallComplete?.(true, `${app.title} successfully uninstalled.`); }
      else { onUninstallComplete?.(false, `Failed to uninstall ${app.title}.`, quest.result || quest.detail || 'Quest failed'); }
    } catch (error: any) {
      onUninstallComplete?.(false, `Failed to uninstall ${app.title}.`, error?.response?.data?.message || error?.message || 'Unknown error');
    } finally { setUninstalling(false); setConfirmOpen(false); }
  };

  if (!app.installedVersions?.includes(selectedVersion.version)) return null;

  return (
    <>
      {variant === 'menuItem' ? (
        <button data-testid="uninstall-button" disabled={uninstalling} onClick={() => setConfirmOpen(true)} className="flex items-center gap-2 w-full px-3 py-2 text-sm text-error hover:bg-white/5 transition">
          <Trash2 size={16} /><span className="flex-1 text-left">Uninstall</span>
        </button>
      ) : variant === 'icon' ? (
        <LoadIconButton data-testid="uninstall-button" icon={<Trash2 size={18} />} onClick={() => setConfirmOpen(true)} loading={uninstalling} disabled={uninstalling} />
      ) : (
        <LoadButton text="Uninstall" variant="outlined" label="uninstall-app-button" disabled={uninstalling} color="error" onClick={() => setConfirmOpen(true)} displaystate={displayState} loading={uninstalling} />
      )}
      <ConfirmDialog title={`Uninstall ${app.title}?`} open={confirmOpen} setOpen={setConfirmOpen} onConfirm={() => uninstallApp(app)}>
        Are you sure you want to uninstall {app.title}?
      </ConfirmDialog>
    </>
  );
}
