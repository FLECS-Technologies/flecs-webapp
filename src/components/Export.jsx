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
import Button from '@mui/material/Button';
import UploadIcon from '@mui/icons-material/Upload';
import ActionSnackbar from './ActionSnackbar';
import { ReferenceDataContext } from '../data/ReferenceDataContext';
import { QuestContext, useQuestContext } from './quests/QuestContext';
import { questStateFinishedOk } from '../utils/quests/QuestState';
import { useProtectedApi } from './providers/ApiProvider';

export default function Export(props) {
  const { ...buttonProps } = props;
  const { appList } = React.useContext(ReferenceDataContext);
  const api = useProtectedApi();
  const context = useQuestContext(QuestContext);

  const [exporting, setExporting] = React.useState(false);
  const [snackbarOpen, setSnackbarOpen] = React.useState(false);
  const [snackbarState, setSnackbarState] = React.useState({
    snackbarText: 'Info',
    alertSeverity: 'success',
  });

  const exportApps = async (props) => {
    setExporting(true);

    try {
      // collect all apps and instances
      const apps = appList?.map((app) => {
        return { name: app.appKey.name, version: app.appKey.version };
      });
      const instances = appList
        ?.map((app) => {
          return app?.instances.map((i) => i.instanceId);
        })
        .flat();

      // create an export for all apps and instances
      const exportQuest = await api.export.exportsPost({ apps, instances });
      await context.fetchQuest(exportQuest.data.jobId);
      const result = await context.waitForQuest(exportQuest.data.jobId);

      if (!questStateFinishedOk(result.state)) throw new Error(result.description);

      // get the download link for the export file
      const exportId = result.result;
      const exportDownload = await api.export.exportsExportIdGet(exportId, {
        responseType: 'blob',
      });
      if (!exportDownload) throw new Error('Could not download export file');

      // download the export
      const url = window.URL.createObjectURL(exportDownload.data);
      const a = document.createElement('a');
      a.href = url;
      a.download = `flecs-export-${exportId}.tar`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      setSnackbarState({
        alertSeverity: 'error',
        snackbarText: error?.response?.data?.message
          ? error?.response?.data?.message
          : error?.message,
      });
      setSnackbarOpen(true);
    } finally {
      setExporting(false);
    }
  };
  return (
    <>
      <Button
        {...buttonProps}
        loading={exporting}
        variant="outlined"
        startIcon={<UploadIcon />}
        onClick={() => exportApps()}
      >
        Export
      </Button>
      <ActionSnackbar
        text={snackbarState.snackbarText}
        open={snackbarOpen}
        setOpen={setSnackbarOpen}
        alertSeverity={snackbarState.alertSeverity}
      />
    </>
  );
}
