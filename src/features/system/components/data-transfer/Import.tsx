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
import { FolderUp } from 'lucide-react';
import ActionSnackbar from '@app/components/ActionSnackbar';
import FileOpen from '@app/components/FileOpen';
import { useInvalidateAppData } from '@features/apps/hooks/app-queries';
import { useQuestActions } from '@features/notifications/quests/hooks';
import { questStateFinishedOk } from '@features/notifications/quests/QuestItem';
import { postDeviceOnboarding } from '@generated/core/device/device';
import { postImports } from '@generated/core/flecsport/flecsport';
import type { JobMeta } from '@generated/core/schemas';

export default function Import(props) {
  const invalidateAppData = useInvalidateAppData();
  const { fetchQuest, waitForQuest } = useQuestActions();
  const { ...buttonProps } = props;
  const [importing, setImporting] = React.useState(false);
  const [snackbarOpen, setSnackbarOpen] = React.useState(false);
  const [snackbarState, setSnackbarState] = React.useState({
    snackbarText: 'Info',
    alertSeverity: 'success',
  });

  const handleFileUpload = (file: File) => {
    if (file) {
      const fileName = file.name.toLowerCase();
      if (fileName.endsWith('.tar.gz') || fileName.endsWith('.tar')) {
        handleTarFile(file);
      } else if (fileName.endsWith('.json')) {
        handleJsonFile(file);
      } else {
        setSnackbarState({
          alertSeverity: 'error',
          snackbarText: 'Unsupported file type. Please upload a .tar, .tar.gz or .json file.',
        });
        setSnackbarOpen(true);
      }
    }
  };

  const handleJsonFile = async (file: File) => {
    setImporting(true);

    try {
      const fileContent = await file.text();
      const jsonData = JSON.parse(fileContent);

      const onboardingQuest = await postDeviceOnboarding(jsonData);
      const onboardingData = onboardingQuest.data as JobMeta;
      await fetchQuest(onboardingData.jobId);
      const result = await waitForQuest(onboardingData.jobId);

      if (!questStateFinishedOk(result.state)) throw new Error(result.description);

      // Success case
      setSnackbarState({
        alertSeverity: 'success',
        snackbarText: 'Importing finished successfully',
      });
      setSnackbarOpen(true);
    } catch (error: unknown) {
      const err = error as any;
      setSnackbarState({
        alertSeverity: 'error',
        snackbarText: err?.response?.data?.message
          ? err.response.data.message
          : err?.message ?? String(error),
      });
      setSnackbarOpen(true);
    } finally {
      setImporting(false);
      invalidateAppData();
    }
  };

  const handleTarFile = async (file: File) => {
    setImporting(true);

    try {
      const importQuest = await postImports({ file });
      const importData = importQuest.data as JobMeta;
      await fetchQuest(importData.jobId);
      const result = await waitForQuest(importData.jobId);

      if (!questStateFinishedOk(result.state)) throw new Error(result.description);

      // Success case
      setSnackbarState({
        alertSeverity: 'success',
        snackbarText: 'Importing finished successfully',
      });
      setSnackbarOpen(true);
    } catch (error: unknown) {
      const err = error as any;
      setSnackbarState({
        alertSeverity: 'error',
        snackbarText: err?.response?.data?.message
          ? err.response.data.message
          : err?.message ?? String(error),
      });
      setSnackbarOpen(true);
    } finally {
      setImporting(false);
      invalidateAppData();
    }
  };

  return (
    <>
      <FileOpen
        {...buttonProps}
        data-testid="import-apps-button"
        buttonText="Import Config"
        buttonIcon={<FolderUp size={16} />}
        accept=".tar.gz, .tar, .json"
        onConfirm={handleFileUpload}
        loading={importing}
        wholeFile={true}
        disabled={buttonProps.disabled || importing}
      ></FileOpen>
      <ActionSnackbar
        text={snackbarState.snackbarText}
        open={snackbarOpen}
        setOpen={setSnackbarOpen}
        alertSeverity={snackbarState.alertSeverity}
      />
    </>
  );
}
