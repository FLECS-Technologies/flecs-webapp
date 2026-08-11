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
import { usePostDeviceOnboarding } from '@generated/core/device/device';
import { usePostImports } from '@generated/core/flecsport/flecsport';
import { unwrapSuccess } from '@app/api/unwrap';
import { getErrorMessage } from '@app/api/fetch-error';

interface ImportProps extends React.ComponentProps<'button'> {
  /** Render as a drag-and-drop zone (dashed container) instead of a bare button. */
  dropzone?: boolean;
  buttonText?: string;
  onImportStarted?: () => void;
  mode: 'restore' | 'onboard';
}

export default function Import(props: ImportProps) {
  const qc = useQueryClient();
  const { fetchQuest, waitForQuest } = useQuestActions();
  const onboardingMutation = usePostDeviceOnboarding();
  const backupMutation = usePostImports();
  const dropzoneInputRef = React.useRef<HTMLInputElement>(null);
  const { dropzone, mode, onImportStarted, ...buttonProps } = props;
  const buttonText = props.buttonText ?? (mode === 'restore' ? 'Restore backup' : 'Onboard device');
  const accept = mode === 'restore' ? '.tar.gz, .tar' : '.json';
  const importing = onboardingMutation.isPending || backupMutation.isPending;

  const handleFileUpload = (file: string | File) => {
    // wholeFile=true on <FileOpen /> guarantees File, not string; narrow for TS.
    if (typeof file === 'string' || !file) return;
    const fileName = file.name.toLowerCase();
    if (mode === 'restore' && (fileName.endsWith('.tar.gz') || fileName.endsWith('.tar'))) {
      handleTarFile(file);
    } else if (mode === 'onboard' && fileName.endsWith('.json')) {
      handleJsonFile(file);
    } else {
      const message =
        mode === 'restore'
          ? 'Please upload a .tar or .tar.gz backup.'
          : 'Please upload an apps.json file.';
      toast.error('Unsupported file type', { description: message });
    }
  };

  const handleJsonFile = async (file: File) => {
    try {
      const fileContent = await file.text();
      const jsonData = JSON.parse(fileContent);

      const onboardingQuest = await onboardingMutation.mutateAsync({ data: jsonData });
      const onboardingData = unwrapSuccess(onboardingQuest);
      if (!onboardingData) throw new Error('Onboarding request failed');
      onImportStarted?.();
      await fetchQuest(onboardingData.jobId);
      const result = await waitForQuest(onboardingData.jobId);

      if (!questStateFinishedOk(result.state)) throw new Error(result.description);

      toast.success('Device onboarding finished successfully');
    } catch (error: unknown) {
      toast.error('Onboarding failed', { description: getErrorMessage(error) });
    } finally {
      qc.invalidateQueries();
    }
  };

  const handleTarFile = async (file: File) => {
    try {
      const importQuest = await backupMutation.mutateAsync({ data: { file } });
      const importData = unwrapSuccess(importQuest);
      if (!importData) throw new Error('Import request failed');
      onImportStarted?.();
      await fetchQuest(importData.jobId);
      const result = await waitForQuest(importData.jobId);

      if (!questStateFinishedOk(result.state)) throw new Error(result.description);

      toast.success('Backup restored successfully');
    } catch (error: unknown) {
      toast.error('Restore failed', { description: getErrorMessage(error) });
    } finally {
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
      buttonText={buttonText}
      buttonIcon={<FolderUp size={16} />}
      accept={accept}
      onConfirm={handleFileUpload}
      loading={importing}
      wholeFile={true}
      disabled={buttonProps.disabled || importing}
    ></FileOpen>
  );

  if (!dropzone) return button;

  return (
    <>
      <input
        ref={dropzoneInputRef}
        data-testid="fileInput"
        type="file"
        accept={accept}
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = '';
          if (file) handleFileUpload(file);
        }}
      />
      <div
        data-testid="import-dropzone"
        role="button"
        tabIndex={0}
        aria-label={buttonText}
        onClick={() => dropzoneInputRef.current?.click()}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            dropzoneInputRef.current?.click();
          }
        }}
        {...dropProps}
        className={`px-5 rounded-xl border border-dashed flex cursor-pointer items-center gap-4 hover:border-brand hover:bg-brand/3 transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${isDragOver ? 'border-brand bg-brand/3' : 'border-border'}`}
      >
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand/10 text-brand">
          <FolderUp size={18} />
        </div>
        <span className="text-sm font-semibold text-brand">{buttonText}</span>
      </div>
    </>
  );
}
