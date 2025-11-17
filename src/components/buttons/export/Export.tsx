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
import React, { ButtonHTMLAttributes, useContext } from 'react';
import Button from '@mui/material/Button';
// If you want a loading button, use the following instead:
// import LoadingButton from '@mui/lab/LoadingButton';
import UploadIcon from '@mui/icons-material/Upload';
import ActionSnackbar from '../../ActionSnackbar';
import { ReferenceDataContext } from '../../../data/ReferenceDataContext';
import { QuestContext, useQuestContext } from '../../quests/QuestContext';
import { questStateFinishedOk } from '../../../utils/quests/QuestState';
import { useProtectedApi } from '../../providers/ApiProvider';
import { getAuthCoreProvider } from '../../../utils/auth/authprovider-utils';

interface ReferenceDataContextType {
  appList?: Array<any>;
  setAppList?: (list: any[]) => void;
  updateAppList?: boolean;
  setUpdateAppList?: (v: boolean) => void;
  appListLoading?: boolean;
  setAppListLoading?: (v: boolean) => void;
  appListError?: boolean;
  setAppListError?: (v: boolean) => void;
  loadedProducts?: any;
  setLoadedProducts?: (v: any) => void;
}

interface ExportProps extends ButtonHTMLAttributes<HTMLButtonElement> {}

interface SnackbarState {
  snackbarText: string;
  alertSeverity: 'success' | 'error' | 'info' | 'warning';
}

const Export: React.FC<ExportProps> = (props) => {
  const { ...buttonProps } = props;
  const { appList } = useContext(ReferenceDataContext) as ReferenceDataContextType;
  const api = useProtectedApi();
  const context = useQuestContext(QuestContext);

  const [exporting, setExporting] = React.useState(false);
  const [snackbarOpen, setSnackbarOpen] = React.useState(false);
  const [snackbarState, setSnackbarState] = React.useState<SnackbarState>({
    snackbarText: 'Info',
    alertSeverity: 'success',
  });

  const exportApps = async () => {
    setExporting(true);
    try {
      const apps = (appList || []).map((app: any) => ({
        name: app.appKey.name,
        version: app.appKey.version,
      }));
      const instances = (appList || [])
        .map((app: any) => app?.instances.map((i: any) => i.instanceId))
        .flat();
      // this logic excludes the core auth provider from the export
      // we do this because during the export the auth provider is stopped. This results in the user being logged out from the webapp.
      const authProviderInstanceId = await getAuthCoreProvider(api);
      if (authProviderInstanceId) {
        // Remove the authProviderInstanceId from instances if present
        const filteredInstances = instances.filter((id: any) => id !== authProviderInstanceId);
        // Use filteredInstances instead of instances in the export call
        instances.length = 0;
        instances.push(...filteredInstances);
      }
      const exportQuest = await api.export.exportsPost({ apps, instances });
      await context.fetchQuest(exportQuest.data.jobId);
      const result = await context.waitForQuest(exportQuest.data.jobId);
      if (!questStateFinishedOk(result.state))
        throw new Error(result.detail || 'Export quest failed');
      const exportId = result.result;
      if (!exportId || typeof exportId !== 'string') throw new Error('Invalid export ID');
      const exportDownload = await api.export.exportsExportIdGet(exportId, {
        responseType: 'blob',
      });
      if (!exportDownload) throw new Error('Could not download export file');
      const url = window.URL.createObjectURL(exportDownload.data);
      const a = document.createElement('a');
      a.href = url;
      a.download = `flecs-export-${exportId}.tar`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
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
        variant="outlined"
        startIcon={<UploadIcon />}
        onClick={() => exportApps()}
        loading={exporting}
        loadingPosition="start"
        {...(buttonProps as any)}
      >
        {exporting ? 'Exporting...' : 'Export'}
      </Button>
      <ActionSnackbar
        text={snackbarState.snackbarText}
        open={snackbarOpen}
        setOpen={setSnackbarOpen}
        alertSeverity={snackbarState.alertSeverity}
      />
    </>
  );
};

export default Export;
