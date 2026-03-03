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
import ActionSnackbar from '@shared/components/ActionSnackbar';
import FileOpen from '@shared/components/FileOpen';
import { useInvalidateAppData } from '@shared/hooks/app-queries';
import { useProtectedApi } from '@shared/api/ApiProvider';
import { useQuestActions } from '@shared/quests/hooks';
import { questStateFinishedOk } from '@shared/quests/utils/QuestState';

export default function Import(props) {
  const invalidateAppData = useInvalidateAppData();
  const api = useProtectedApi();
  const { fetchQuest, waitForQuest } = useQuestActions();
  const { ...buttonProps } = props;
  const [importing, setImporting] = React.useState(false);
  const [snackbarOpen, setSnackbarOpen] = React.useState(false);
  const [snackbarState, setSnackbarState] = React.useState({
    snackbarText: 'Info',
    alertSeverity: 'success',
  });

  const handleFileUpload = (file) => {
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

  const handleJsonFile = async (file) => {
    setImporting(true);

    try {
      const fileContent = await file.text();
      const jsonData = JSON.parse(fileContent);

      const onboardingQuest = await api.device.deviceOnboardingPost(jsonData);
      await fetchQuest(onboardingQuest.data.jobId);
      const result = await waitForQuest(onboardingQuest.data.jobId);

      if (!questStateFinishedOk(result.state)) throw new Error(result.description);

      // Success case
      setSnackbarState({
        alertSeverity: 'success',
        snackbarText: 'Importing finished successfully',
      });
      setSnackbarOpen(true);
    } catch (error) {
      setSnackbarState({
        alertSeverity: 'error',
        snackbarText: error?.response?.data?.message
          ? error?.response?.data?.message
          : error?.message,
      });
      setSnackbarOpen(true);
    } finally {
      setImporting(false);
      invalidateAppData();
    }
  };

  const handleTarFile = async (props) => {
    setImporting(true);

    try {
      const file = props;
      const fileName = props.name;

      const importQuest = await api.export.importsPost(fileName, file);
      await fetchQuest(importQuest.data.jobId);
      const result = await waitForQuest(importQuest.data.jobId);

      if (!questStateFinishedOk(result.state)) throw new Error(result.description);

      // Success case
      setSnackbarState({
        alertSeverity: 'success',
        snackbarText: 'Importing finished successfully',
      });
      setSnackbarOpen(true);
    } catch (error) {
      setSnackbarState({
        alertSeverity: 'error',
        snackbarText: error?.response?.data?.message
          ? error?.response?.data?.message
          : error?.message,
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
