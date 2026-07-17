import React, { ButtonHTMLAttributes } from 'react';
import { toast } from 'sonner';
import { FolderDown } from 'lucide-react';
import { useQuestActions } from '@features/notifications/quests/hooks';
import { questStateFinishedOk } from '@features/notifications/quests/QuestItem';
import { useGetApps } from '@generated/core/apps/apps';
import { useGetInstances } from '@generated/core/instances/instances';
import { postExports, getExportsExportId } from '@generated/core/flecsport/flecsport';
import {
  getProvidersAuthCore,
  getProvidersAuthDefault,
} from '@generated/core/experimental/experimental';
import { unwrapSuccess } from '@app/api/unwrap';

interface ExportProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onClick'> {
  buttonText?: string;
  onExportStarted?: () => void;
}

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
  const {
    buttonText = 'Export Apps',
    onExportStarted,
    className,
    disabled,
    ...buttonProps
  } = props;
  const { data: appsResponse, isPending: appsPending, isError: appsError } = useGetApps();
  const {
    data: instancesResponse,
    isPending: instancesPending,
    isError: instancesError,
  } = useGetInstances();
  const { fetchQuest, waitForQuest } = useQuestActions();
  const [exporting, setExporting] = React.useState(false);
  const loading = appsPending || instancesPending;

  const exportApps = async () => {
    setExporting(true);
    try {
      if (appsError || instancesError) throw new Error('Could not load the device app setup');
      const apps = (unwrapSuccess(appsResponse) ?? []).map((app) => ({
        name: app.appKey.name,
        version: app.appKey.version,
      }));
      const instances = (unwrapSuccess(instancesResponse) ?? []).map(
        (instance) => instance.instanceId,
      );
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
      onExportStarted?.();
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
      toast.success('Device backup downloaded');
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'Export failed');
    } finally {
      setExporting(false);
    }
  };

  return (
    <button
      {...buttonProps}
      className={
        className ??
        'inline-flex items-center gap-2 rounded-lg border border-brand px-4 py-2 text-sm font-semibold text-brand transition hover:bg-brand/10 disabled:opacity-50'
      }
      onClick={exportApps}
      disabled={exporting || loading || disabled}
    >
      {exporting ? (
        <div className="animate-spin h-4 w-4 border-2 border-brand border-t-transparent rounded-full" />
      ) : (
        <FolderDown size={16} />
      )}
      {loading ? 'Loading setup...' : exporting ? 'Creating backup...' : buttonText}
    </button>
  );
};
export default Export;
