import { useQueryClient } from '@tanstack/react-query';
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
import { toast } from 'sonner';
import { FolderUp } from 'lucide-react';
import FileOpen from '@app/components/FileOpen';

import { useQuestActions } from '@features/notifications/quests/hooks';
import { questStateFinishedOk } from '@features/notifications/quests/QuestItem';
import { postDeviceOnboarding } from '@generated/core/device/device';
import { postImports } from '@generated/core/flecsport/flecsport';
import { unwrapSuccess } from '@app/api/unwrap';
import { getErrorMessage } from '@app/api/fetch-error';

export default function Import(props: React.ComponentProps<'button'>) {
  const qc = useQueryClient();
  const { fetchQuest, waitForQuest } = useQuestActions();
  const { ...buttonProps } = props;
  const [importing, setImporting] = React.useState(false);

  const handleFileUpload = (file: File) => {
    if (file) {
      const fileName = file.name.toLowerCase();
      if (fileName.endsWith('.tar.gz') || fileName.endsWith('.tar')) {
        handleTarFile(file);
      } else if (fileName.endsWith('.json')) {
        handleJsonFile(file);
      } else {
        toast.error('Unsupported file type. Please upload a .tar, .tar.gz or .json file.');
      }
    }
  };

  const handleJsonFile = async (file: File) => {
    setImporting(true);

    try {
      const fileContent = await file.text();
      const jsonData = JSON.parse(fileContent);

      const onboardingQuest = await postDeviceOnboarding(jsonData);
      const onboardingData = unwrapSuccess(onboardingQuest);
      if (!onboardingData) throw new Error('Onboarding request failed');
      await fetchQuest(onboardingData.jobId);
      const result = await waitForQuest(onboardingData.jobId);

      if (!questStateFinishedOk(result.state)) throw new Error(result.description);

      toast.success('Importing finished successfully');
    } catch (error: unknown) {
      toast.error('Import failed', { description: getErrorMessage(error) });
    } finally {
      setImporting(false);
      qc.invalidateQueries();
    }
  };

  const handleTarFile = async (file: File) => {
    setImporting(true);

    try {
      const importQuest = await postImports({ file });
      const importData = unwrapSuccess(importQuest);
      if (!importData) throw new Error('Import request failed');
      await fetchQuest(importData.jobId);
      const result = await waitForQuest(importData.jobId);

      if (!questStateFinishedOk(result.state)) throw new Error(result.description);

      toast.success('Importing finished successfully');
    } catch (error: unknown) {
      toast.error('Import failed', { description: getErrorMessage(error) });
    } finally {
      setImporting(false);
      qc.invalidateQueries();
    }
  };

  return (
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
  );
}
