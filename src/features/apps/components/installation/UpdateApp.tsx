import React, { useState, useCallback, useRef } from 'react';
import { RotateCcw } from 'lucide-react';
import { useAppList, useInvalidateAppData } from '@features/apps/hooks/app-queries';
import { usePostAppsInstall, useDeleteAppsApp } from '@generated/core/apps/apps';
import { usePatchInstancesInstanceId } from '@generated/core/instances/instances';
import { useQuestActions } from '@features/notifications/quests/hooks';
import { getQuest } from '@stores/quests';
import { QuestItem } from '@features/notifications/quests/QuestItem';
import { questStateFinishedOk } from '@features/notifications/quests/QuestItem';
import type { JobMeta } from '@generated/core/schemas';

export default function UpdateApp({ app, from, to, handleActiveStep, onStateChange }: any) {
  const executedRef = useRef(false);
  const { appList } = useAppList();
  const invalidateAppData = useInvalidateAppData();
  const { fetchQuest, waitForQuest, waitForQuests } = useQuestActions();
  const { mutateAsync: installApp } = usePostAppsInstall();
  const { mutateAsync: deleteApp } = useDeleteAppsApp();
  const { mutateAsync: patchInstance } = usePatchInstancesInstanceId();
  const [updating, setUpdating] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(false);
  const [retry, setRetry] = useState(false);
  const [installationMessage, setInstallationMessage] = useState('');
  const [currentQuest, setCurrentQuest] = React.useState<any>();

  const executeQuestStep = useCallback(async (questId: any) => {
    await fetchQuest(questId);
    setCurrentQuest(questId);
    onStateChange?.({ updating: true, currentQuest: getQuest(questId) });
    const result = await waitForQuest(questId);
    if (!questStateFinishedOk(result.state)) throw new Error(result.description);
    return result;
  }, [fetchQuest, waitForQuest]);

  const updateApp = useCallback(async (app: any, from: any, to: any) => {
    try {
      const installedApp = appList?.find((obj: any) => obj.appKey.name === app.appKey.name && obj.appKey.version === from);
      if (!installedApp) throw new Error(`${app.appKey.name} is not installed and therefore can't be updated!`);
      setUpdating(true);
      onStateChange?.({ updating: true, currentQuest: null });
      const installResponse = await installApp({ data: { appKey: { name: app.appKey.name, version: to } } });
      await executeQuestStep((installResponse.data as JobMeta).jobId);
      setInstallationMessage(`Migrating ${installedApp?.instances?.length} instances...`);
      const updateQuestIds = await Promise.all((installedApp?.instances ?? []).map(async (instance: any) => {
        const response = await patchInstance({ instanceId: instance.instanceId, data: { to } });
        return (response.data as JobMeta).jobId;
      }));
      const updateQuests = await waitForQuests(updateQuestIds);
      const unsuccessfulQuests = updateQuests.find((quest: any) => !questStateFinishedOk(quest.state));
      if (unsuccessfulQuests) throw new Error(`One or more instance migrations failed`);
      const uninstallResponse = await deleteApp({ app: app.appKey.name, params: { version: from } });
      await executeQuestStep((uninstallResponse.data as JobMeta).jobId);
      setInstallationMessage(`Congratulations! ${app?.title} was successfully ${from < to ? 'updated' : 'downgraded'} from version ${from} to version ${to}!`);
      invalidateAppData();
      setUpdating(false);
      setSuccess(true);
      setError(false);
      handleActiveStep();
      onStateChange?.({ updating: false, currentQuest: null });
    } catch (error: unknown) {
      setInstallationMessage((error as Error).message || `Error during the update of ${app?.title}.`);
      setError(true);
      setSuccess(false);
      setUpdating(false);
      onStateChange?.({ updating: false, currentQuest: null });
      handleActiveStep(-1);
    }
  }, [appList, invalidateAppData]);

  React.useEffect(() => {
    if (executedRef.current) return;
    if (app && from && to && !updating && (!success || !error)) { setRetry(false); updateApp(app, from, to); }
    executedRef.current = true;
  }, [retry, app, from, to, updating, success, error, updateApp]);

  return (
    <div>
      <div data-testid="update-app-step" className="flex flex-col items-center justify-center gap-2 min-h-[350px] mt-4">
        {updating && <div><QuestItem id={currentQuest} level={0} showBorder={false} /></div>}
        <div>
          {installationMessage ? (
            <div className={`px-4 py-3 rounded-lg mt-12 mb-2 ${success ? 'bg-success/10 text-success' : 'bg-accent/10 text-accent'}`}>
              <p className="font-semibold mb-1">{success ? 'Success' : 'Info'}</p>
              <p className="text-sm">{installationMessage}</p>
            </div>
          ) : null}
        </div>
        {error && (
          <div>
            <button onClick={() => { setRetry(true); executedRef.current = false; }} className="px-4 py-2 rounded-lg font-semibold transition inline-flex items-center gap-2 hover:bg-white/10">
              <RotateCcw size={18} /> Retry
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
