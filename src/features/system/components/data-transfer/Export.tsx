import React, { ButtonHTMLAttributes } from 'react';
import { FolderDown } from 'lucide-react';
import ActionSnackbar from '@app/components/ActionSnackbar';
import { useAppList } from '@features/apps/hooks/app-queries';
import { useQuestActions } from '@features/notifications/quests/hooks';
import { questStateFinishedOk } from '@features/notifications/quests/QuestItem';
import { postExports, getExportsExportId } from '@generated/core/flecsport/flecsport';
import { getProvidersAuthCore, getProvidersAuthDefault } from '@generated/core/experimental/experimental';
import type { JobMeta, ProviderReference } from '@generated/core/schemas';

interface ExportProps extends ButtonHTMLAttributes<HTMLButtonElement> {}

const resolveProviderRef = (ref: ProviderReference | null | undefined): string | undefined => { if (!ref) return undefined; if (typeof ref === 'string') return ref === 'Default' ? undefined : ref; if (typeof ref === 'object' && 'Provider' in ref) return ref.Provider; return undefined; };
const getAuthCoreProvider = async (): Promise<string | undefined> => { try { const coreProvider = await getProvidersAuthCore(); const coreRef = coreProvider.data as ProviderReference | undefined; if (coreRef === 'Default') { await getProvidersAuthDefault(); return undefined; } else { return resolveProviderRef(coreRef); } } catch { return undefined; } };

const Export: React.FC<ExportProps> = (props) => {
  const { ...buttonProps } = props;
  const { appList } = useAppList();
  const { fetchQuest, waitForQuest } = useQuestActions();
  const [exporting, setExporting] = React.useState(false);
  const [snackbarOpen, setSnackbarOpen] = React.useState(false);
  const [snackbarState, setSnackbarState] = React.useState({ snackbarText: 'Info', alertSeverity: 'success' as 'success' | 'error' });

  const exportApps = async () => {
    setExporting(true);
    try {
      const apps = (appList || []).map((app: any) => ({ name: app.appKey.name, version: app.appKey.version }));
      const instances = (appList || []).map((app: any) => app?.instances.map((i: any) => i.instanceId)).flat();
      const authProviderInstanceId = await getAuthCoreProvider();
      if (authProviderInstanceId) { const filtered = instances.filter((id: any) => id !== authProviderInstanceId); instances.length = 0; instances.push(...filtered); }
      const exportQuest = await postExports({ apps, instances });
      const exportData = exportQuest.data as JobMeta;
      await fetchQuest(exportData.jobId);
      const result = await waitForQuest(exportData.jobId);
      if (!questStateFinishedOk(result.state)) throw new Error(result.detail || 'Export quest failed');
      const exportId = result.result;
      if (!exportId || typeof exportId !== 'string') throw new Error('Invalid export ID');
      const exportDownload = await getExportsExportId(exportId);
      if (!exportDownload) throw new Error('Could not download export file');
      const blob = exportDownload.data as unknown as Blob;
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = `flecs-export-${exportId}.tar`; document.body.appendChild(a); a.click(); a.remove(); window.URL.revokeObjectURL(url);
    } catch (error: any) { setSnackbarState({ alertSeverity: 'error', snackbarText: error?.response?.data?.message || error?.message }); setSnackbarOpen(true); }
    finally { setExporting(false); }
  };

  return (
    <>
      <button className="px-4 py-2 border border-brand text-brand rounded-lg font-semibold hover:bg-brand/10 transition inline-flex items-center gap-2 text-sm disabled:opacity-50" onClick={exportApps} disabled={exporting} {...(buttonProps as any)}>
        {exporting ? <div className="animate-spin h-4 w-4 border-2 border-brand border-t-transparent rounded-full" /> : <FolderDown size={16} />}
        {exporting ? 'Downloading...' : 'Download App Config'}
      </button>
      <ActionSnackbar text={snackbarState.snackbarText} open={snackbarOpen} setOpen={setSnackbarOpen} alertSeverity={snackbarState.alertSeverity} />
    </>
  );
};
export default Export;
