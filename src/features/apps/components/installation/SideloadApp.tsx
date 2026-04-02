import { RotateCcw } from 'lucide-react';
import React from 'react';
import { useAppList, useInvalidateAppData } from '@features/apps/hooks/app-queries';
import { useQuestActions } from '@features/notifications/quests/hooks';
import { usePostAppsSideload } from '@generated/core/apps/apps';
import { usePostInstancesCreate, usePostInstancesInstanceIdStart } from '@generated/core/instances/instances';
import { QuestItem } from '@features/notifications/quests/QuestItem';
import { questStateFinishedOk } from '@features/notifications/quests/QuestItem';
import type { JobMeta } from '@generated/core/schemas';

export default function SideloadApp(props: any) {
  const { manifest, handleActiveStep } = props;
  const executedRef = React.useRef(false);
  const { appList } = useAppList();
  const invalidateAppData = useInvalidateAppData();
  const { mutateAsync: sideloadAppMutation } = usePostAppsSideload();
  const { mutateAsync: createInstance } = usePostInstancesCreate();
  const { mutateAsync: startInstance } = usePostInstancesInstanceIdStart();
  const { fetchQuest, waitForQuest } = useQuestActions();
  const [installing, setInstalling] = React.useState(false);
  const [success, setSuccess] = React.useState(false);
  const [error, setError] = React.useState(false);
  const [retry, setRetry] = React.useState(false);
  const [infoMessage, setInfoMessage] = React.useState<string | false>(false);
  const [currentQuest, setCurrentQuest] = React.useState<any>();

  const executeQuestStep = React.useCallback(async (questId: any) => {
    await fetchQuest(questId); setCurrentQuest(questId);
    const result = await waitForQuest(questId);
    if (!questStateFinishedOk(result.state)) throw new Error(result.description);
    return result;
  }, [fetchQuest, waitForQuest]);

  const sideloadApp = React.useCallback(async (manifest: any) => {
    setInstalling(true); setSuccess(false); setError(false);
    try {
      const sideloadResponse = await sideloadAppMutation({ data: { manifest: JSON.stringify(manifest) } });
      await executeQuestStep((sideloadResponse.data as JobMeta).jobId);
      const instanceResponse = await createInstance({ data: { appKey: { name: manifest.app, version: manifest.version } } });
      const instanceQuest = await executeQuestStep((instanceResponse.data as JobMeta).jobId);
      const startResponse = await startInstance({ instanceId: instanceQuest.result as string });
      await executeQuestStep((startResponse.data as JobMeta).jobId);
      invalidateAppData(); setSuccess(true); setInfoMessage(manifest.title + ' successfully installed.'); setInstalling(false); handleActiveStep();
    } catch (error: unknown) {
      setError(true); setSuccess(false); setInfoMessage((error as Error).message || 'Error during sideload'); setInstalling(false); invalidateAppData();
    }
  }, []);

  React.useEffect(() => { if (executedRef.current) return; if (manifest && !installing && (!success || !error)) { setRetry(false); sideloadApp(manifest); } else { setError(true); setInfoMessage('Error during the installation of ' + manifest?.title + '.'); } executedRef.current = true; }, [retry]);

  return (
    <div>
      <div data-testid="sideload-app-step" className="flex flex-col items-center justify-center gap-2 min-h-[350px] mt-4">
        {installing && <div>{currentQuest && <QuestItem id={currentQuest} level={0} showBorder={false} />}</div>}
        <div>
          {infoMessage && !error && (
            <div className={`px-4 py-3 rounded-lg mt-12 mb-2 ${success ? 'bg-success/10 text-success' : 'bg-accent/10 text-accent'}`}>
              <p className="font-semibold mb-1">{success ? 'Success' : 'Info'}</p>
              <p className="text-sm">{infoMessage}</p>
            </div>
          )}
        </div>
        {error && <div><button onClick={() => { setRetry(true); executedRef.current = false; }} className="px-4 py-2 rounded-lg font-semibold transition inline-flex items-center gap-2 hover:bg-white/10"><RotateCcw size={18} /> Retry</button></div>}
      </div>
    </div>
  );
}
