import React, { ButtonHTMLAttributes } from 'react';
import { toast } from 'sonner';
import { FolderDown } from 'lucide-react';
import { useAppList } from '@features/apps/app-queries';
import { useQuestActions } from '@features/notifications/quests/hooks';
import { questStateFinishedOk } from '@features/notifications/quests/QuestItem';
import { postExports, getExportsExportId } from '@generated/core/flecsport/flecsport';
import {
  getProvidersAuthCore,
  getProvidersAuthDefault,
} from '@generated/core/experimental/experimental';
import { unwrapSuccess } from '@app/api/unwrap';

interface ExportProps extends ButtonHTMLAttributes<HTMLButtonElement> {}

// Export tarballs can be large; allow up to 10 min to transfer before aborting.
const DOWNLOAD_TIMEOUT_MS = 10 * 60_000;

// GET /providers/auth/core returns the core ref as a bare string: 'Default' (meaning
// "use the configured default provider") or a concrete provider id.
const getAuthCoreProvider = async (): Promise<string | undefined> => {
  try {
    const { data } = await getProvidersAuthCore();
    if (data === 'Default') {
      await getProvidersAuthDefault();
      return undefined;
    }
    return typeof data === 'string' ? data : undefined;
  } catch {
    return undefined;
  }
};

const Export: React.FC<ExportProps> = (props) => {
  const { ...buttonProps } = props;
  const { appList } = useAppList();
  const { fetchQuest, waitForQuest } = useQuestActions();
  const [exporting, setExporting] = React.useState(false);

  const exportApps = async () => {
    setExporting(true);
    try {
      const apps = (appList || []).map((app) => ({
        name: app.appKey.name,
        version: app.appKey.version,
      }));
      const instances = (appList || [])
        .map((app) => (app.instances ?? []).map((i) => i.instanceId))
        .flat();
      const authProviderInstanceId = await getAuthCoreProvider();
      if (authProviderInstanceId) {
        const filtered = instances.filter((id) => id !== authProviderInstanceId);
        instances.length = 0;
        instances.push(...filtered);
      }
      const exportQuest = await postExports({ apps, instances });
      const exportData = unwrapSuccess(exportQuest);
      if (!exportData) throw new Error('Export request failed');
      await fetchQuest(exportData.jobId);
      const result = await waitForQuest(exportData.jobId);
      if (!questStateFinishedOk(result.state))
        throw new Error(result.detail || 'Export quest failed');
      const exportId = result.result;
      if (!exportId || typeof exportId !== 'string') throw new Error('Invalid export ID');
      // Exports can be large; override the shared 15s customInstance timeout so
      // big downloads are not aborted mid-transfer.
      const exportDownload = await getExportsExportId(exportId, {
        signal: AbortSignal.timeout(DOWNLOAD_TIMEOUT_MS),
      });
      const blob = unwrapSuccess(exportDownload);
      if (!blob) throw new Error('Could not download export file');
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `flecs-export-${exportId}.tar`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'Export failed');
    } finally {
      setExporting(false);
    }
  };

  return (
    <button
      className="px-4 py-2 border border-brand text-brand rounded-lg font-semibold hover:bg-brand/10 transition inline-flex items-center gap-2 text-sm disabled:opacity-50"
      onClick={exportApps}
      disabled={exporting}
      {...buttonProps}
    >
      {exporting ? (
        <div className="animate-spin h-4 w-4 border-2 border-brand border-t-transparent rounded-full" />
      ) : (
        <FolderDown size={16} />
      )}
      {exporting ? 'Exporting...' : 'Export Apps'}
    </button>
  );
};
export default Export;
