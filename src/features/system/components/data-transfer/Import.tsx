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
import { useFileDrop } from '@app/components/useFileDrop';

import { useQuestActions } from '@features/notifications/quests/hooks';
import { questStateFinishedOk } from '@features/notifications/quests/QuestItem';
import { postDeviceOnboarding } from '@generated/core/device/device';
import { postImports } from '@generated/core/flecsport/flecsport';
import { unwrapSuccess } from '@app/api/unwrap';
import { getErrorMessage } from '@app/api/fetch-error';

interface ImportProps extends React.ComponentProps<'button'> {
  /** Render as a drag-and-drop zone (dashed container) instead of a bare button. */
  dropzone?: boolean;
}

export default function Import(props: ImportProps) {
  const qc = useQueryClient();
  const { fetchQuest, waitForQuest } = useQuestActions();
  const { dropzone, ...buttonProps } = props;
  const [importing, setImporting] = React.useState(false);

  const handleFileUpload = (file: string | File) => {
    // wholeFile=true on <FileOpen /> guarantees File, not string; narrow for TS.
    if (typeof file === 'string' || !file) return;
    const fileName = file.name.toLowerCase();
    if (fileName.endsWith('.tar.gz') || fileName.endsWith('.tar')) {
      handleTarFile(file);
    } else if (fileName.endsWith('.json')) {
      handleJsonFile(file);
    } else {
      toast.error('Unsupported file type. Please select a .tar, .tar.gz or .json file.');
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

  // handleFileUpload validates the extension and toasts on mismatch,
  // so the dropzone accepts any file and defers validation.
  const { isDragOver, dropProps } = useFileDrop({
    onFile: handleFileUpload,
    disabled: buttonProps.disabled || importing,
  });

  const button = (
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

  if (!dropzone) return button;

  return (
    <div
      data-testid="import-dropzone"
      {...dropProps}
      className={`px-5 rounded-xl border border-dashed flex items-center gap-4 hover:border-brand hover:bg-brand/3 transition ${isDragOver ? 'border-brand bg-brand/3' : 'border-white/10'}`}
    >
      <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center text-muted shrink-0">
        <FolderUp size={18} />
      </div>
      {button}
    </div>
  );
}
