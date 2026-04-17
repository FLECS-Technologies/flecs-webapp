import React, { ButtonHTMLAttributes } from 'react';
import { toast } from 'sonner';
import { FolderDown } from 'lucide-react';
import { useAppList } from '@features/apps/app-queries';
import { useQuestActions } from '@features/notifications/quests/hooks';
import { questStateFinishedOk } from '@features/notifications/quests/QuestItem';
import { postExports, getExportsExportId } from '@generated/core/flecsport/flecsport';
import { getProvidersAuthCore, getProvidersAuthDefault } from '@generated/core/experimental/experimental';
import type { ProviderReference } from '@generated/core/schemas';
import { unwrapSuccess } from '@app/api/unwrap';

interface ExportProps extends ButtonHTMLAttributes<HTMLButtonElement> {}

const resolveProviderRef = (ref: ProviderReference | null | undefined): string | undefined => { if (!ref) return undefined; if (typeof ref === 'string') return ref === 'Default' ? undefined : ref; if (typeof ref === 'object' && 'Provider' in ref) return ref.Provider; return undefined; };
const getAuthCoreProvider = async (): Promise<string | undefined> => { try { const coreProvider = await getProvidersAuthCore(); const coreRef = coreProvider.data as ProviderReference | undefined; if (coreRef === 'Default') { await getProvidersAuthDefault(); return undefined; } else { return resolveProviderRef(coreRef); } } catch { return undefined; } };

const Export: React.FC<ExportProps> = (props) => {
  const { ...buttonProps } = props;
  const { appList } = useAppList();
  const { fetchQuest, waitForQuest } = useQuestActions();
  const [exporting, setExporting] = React.useState(false);

  const exportApps = async () => {
    setExporting(true);
    try {
      const apps = (appList || []).map((app) => ({ name: app.appKey.name, version: app.appKey.version }));
      const instances = (appList || []).map((app) => (app.instances ?? []).map((i) => i.instanceId)).flat();
      const authProviderInstanceId = await getAuthCoreProvider();
      if (authProviderInstanceId) { const filtered = instances.filter((id) => id !== authProviderInstanceId); instances.length = 0; instances.push(...filtered); }
      const exportQuest = await postExports({ apps, instances });
      const exportData = unwrapSuccess(exportQuest);
      if (!exportData) throw new Error('Export request failed');
      await fetchQuest(exportData.jobId);
      const result = await waitForQuest(exportData.jobId);
      if (!questStateFinishedOk(result.state)) throw new Error(result.detail || 'Export quest failed');
      const exportId = result.result;
      if (!exportId || typeof exportId !== 'string') throw new Error('Invalid export ID');
      const exportDownload = await getExportsExportId(exportId);
      const blob = unwrapSuccess(exportDownload);
      if (!blob) throw new Error('Could not download export file');
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = `flecs-export-${exportId}.tar`; document.body.appendChild(a); a.click(); a.remove(); window.URL.revokeObjectURL(url);
    } catch (error: unknown) { toast.error(error instanceof Error ? error.message : 'Export failed'); }
    finally { setExporting(false); }
  };

  return (
    <button className="px-4 py-2 border border-brand text-brand rounded-lg font-semibold hover:bg-brand/10 transition inline-flex items-center gap-2 text-sm disabled:opacity-50" onClick={exportApps} disabled={exporting} {...buttonProps}>
      {exporting ? <div className="animate-spin h-4 w-4 border-2 border-brand border-t-transparent rounded-full" /> : <FolderDown size={16} />}
      {exporting ? 'Downloading...' : 'Download App Config'}
    </button>
  );
};
export default Export;
