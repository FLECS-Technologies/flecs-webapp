/*
 * Copyright (c) 2025 FLECS Technologies GmbH
 *
 * Created on Tue Sep 03 2025
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

import React, { useState } from 'react';
import LoadButton from '@shared/components/LoadButton';
import LoadIconButton from '@shared/components/LoadIconButton';
import ConfirmDialog from '@shared/components/ConfirmDialog';
import { Trash2 } from 'lucide-react';
import { useInvalidateAppData } from '@shared/hooks/app-queries';
import { useQuestActions } from '@shared/quests/hooks';
import { useProtectedApi } from '@shared/api/ApiProvider';
import { questStateFinishedOk } from '@shared/quests/utils/QuestState';
import { App } from '@shared/types/app';
import { Version } from '@shared/types/version';

interface UninstallButtonProps {
  app: App;
  selectedVersion: Version;
  displayState?: string;
  variant?: 'button' | 'icon';
  onUninstallComplete?: (success: boolean, message: string, error?: string) => void;
}

export default function UninstallButton({
  app,
  selectedVersion,
  displayState,
  variant = 'button',
  onUninstallComplete,
}: UninstallButtonProps): React.ReactElement | null {
  const invalidateAppData = useInvalidateAppData();
  const { fetchQuest, waitForQuest } = useQuestActions();
  const api = useProtectedApi();
  const [uninstalling, setUninstalling] = useState<boolean>(false);
  const [confirmOpen, setConfirmOpen] = useState<boolean>(false);

  const uninstallApp = async (app: App): Promise<void> => {
    setUninstalling(true);

    try {
      const uninstallResponse = await api.app.appsAppDelete(
        app.appKey.name,
        selectedVersion.version,
      );

      await handleQuestCompletion(uninstallResponse.data?.jobId, app);
    } catch (error: any) {
      handleUninstallError(error, app);
    } finally {
      setUninstalling(false);
      setConfirmOpen(false);
    }
  };

  const handleQuestCompletion = async (questId: number, app: App): Promise<void> => {
    await fetchQuest(questId);
    const quest = await waitForQuest(questId);
    const success = questStateFinishedOk(quest.state);

    if (success) {
      handleSuccess(app);
    } else {
      const errorDetail = quest.result || quest.detail || 'Quest failed';
      onUninstallComplete?.(false, `Failed to uninstall ${app.title}.`, errorDetail);
    }
  };

  const handleSuccess = (app: App): void => {
    invalidateAppData();
    onUninstallComplete?.(true, `${app.title} successfully uninstalled.`);
  };

  const handleUninstallError = (error: any, app: App): void => {
    const message = `Failed to uninstall ${app.title}.`;
    const errorDetail = error?.response?.data?.message || error?.message || 'Unknown error';
    onUninstallComplete?.(false, message, errorDetail);
  };

  // Only render if the selected version is actually installed
  if (!app.installedVersions?.includes(selectedVersion.version)) {
    return null;
  }

  return (
    <>
      {variant === 'icon' ? (
        <LoadIconButton
          data-testid="uninstall-button"
          icon={<Trash2 size={18} />}
          onClick={() => setConfirmOpen(true)}
          loading={uninstalling}
          disabled={uninstalling}
        />
      ) : (
        <LoadButton
          text="Uninstall"
          variant="outlined"
          label="uninstall-app-button"
          disabled={uninstalling}
          color="error"
          onClick={() => setConfirmOpen(true)}
          displaystate={displayState}
          loading={uninstalling}
        />
      )}
      <ConfirmDialog
        data-testid="confirm-dialog"
        title={`Uninstall ${app.title}?`}
        open={confirmOpen}
        setOpen={setConfirmOpen}
        onConfirm={() => uninstallApp(app)}
      >
        Are you sure you want to uninstall {app.title}?
      </ConfirmDialog>
    </>
  );
}
