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
import PropTypes from 'prop-types';
import DownloadIcon from '@mui/icons-material/Download';
import ActionSnackbar from './ActionSnackbar';
import FileOpen from './FileOpen';
import { ReferenceDataContext } from '../data/ReferenceDataContext';
import { useProtectedApi } from './providers/ApiProvider';
import { QuestContext, useQuestContext } from './quests/QuestContext';
import { questStateFinishedOk } from '../utils/quests/QuestState';

export default function Import(props) {
  const { setUpdateAppList } = React.useContext(ReferenceDataContext);
  const api = useProtectedApi();
  const context = useQuestContext(QuestContext);
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
      await context.fetchQuest(onboardingQuest.data.jobId);
      const result = await context.waitForQuest(onboardingQuest.data.jobId);

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
      setUpdateAppList(true);
    }
  };

  const handleTarFile = async (props) => {
    setImporting(true);

    try {
      const file = props;
      const fileName = props.name;

      const importQuest = await api.export.importsPost(fileName, file);
      await context.fetchQuest(importQuest.data.jobId);
      const result = await context.waitForQuest(importQuest.data.jobId);

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
      setUpdateAppList(true);
    }
  };

  return (
    <>
      <FileOpen
        {...buttonProps}
        data-testid="import-apps-button"
        buttonText="Import"
        buttonIcon={<DownloadIcon />}
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

Import.propTypes = {
  apps: PropTypes.array,
  name: PropTypes.string,
};
