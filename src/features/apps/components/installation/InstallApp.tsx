import { RotateCcw } from 'lucide-react';
import React from 'react';
import { useQuestActions } from '@features/notifications/quests/hooks';
import { getQuest } from '@stores/quests';
import { usePostAppsInstall } from '@generated/core/apps/apps';
import { usePostInstancesCreate, usePostInstancesInstanceIdStart } from '@generated/core/instances/instances';
import { QuestItem } from '@features/notifications/quests/QuestItem';
import { useInvalidateAppData } from '@features/apps/hooks/app-queries';
import { questStateFinishedOk } from '@features/notifications/quests/QuestItem';
import type { JobMeta } from '@generated/core/schemas';

export default function InstallApp(props: any) {
  const { app, version, handleActiveStep } = props;
  const { fetchQuest, waitForQuest } = useQuestActions();
  const invalidateAppData = useInvalidateAppData();
  const { mutateAsync: installAppMutation } = usePostAppsInstall();
  const { mutateAsync: createInstance } = usePostInstancesCreate();
  const { mutateAsync: startInstance } = usePostInstancesInstanceIdStart();
  const [installing, setInstalling] = React.useState(false);
  const [success, setSuccess] = React.useState(false);
  const [error, setError] = React.useState(false);
  const [retry, setRetry] = React.useState(false);
  const [infoMessage, setInfoMessage] = React.useState<string | false>(false);
  const executedRef = React.useRef(false);
  const [currentQuest, setCurrentQuest] = React.useState<any>();

  const executeQuestStep = React.useCallback(
    async (questId: any) => {
      await fetchQuest(questId);
      setCurrentQuest(questId);
      props.onStateChange?.({ installing: true, currentQuest: getQuest(questId) });
      const result = await waitForQuest(questId);
      if (!questStateFinishedOk(result.state)) {
        throw new Error(result.description);
      }
      return result;
    },
    [fetchQuest, waitForQuest],
  );

  const installApp = React.useCallback(async (app: any) => {
    setInstalling(true);
    setSuccess(false);
    setError(false);
    setInfoMessage('You can close this window. Installation takes place automatically in the background.');
    props.onStateChange?.({ installing: true, currentQuest: null });
    try {
      const installResponse = await installAppMutation({ data: { appKey: { name: app.appKey.name, version: version } } });
      await executeQuestStep((installResponse.data as JobMeta).jobId);
      const instanceResponse = await createInstance({ data: { appKey: { name: app.appKey.name, version: version } } });
      const instanceQuest = await executeQuestStep((instanceResponse.data as JobMeta).jobId);
      const startResponse = await startInstance({ instanceId: instanceQuest.result as string });
      await executeQuestStep((startResponse.data as JobMeta).jobId);
      setSuccess(true);
      setInfoMessage(app.title + ' successfully installed.');
      invalidateAppData();
      handleActiveStep();
    } catch (error: unknown) {
      setError(true);
      setInfoMessage('Error during the installation of ' + app?.title + '.');
    } finally {
      setInstalling(false);
      props.onStateChange?.({ installing: false, currentQuest: null });
    }
  }, []);

  React.useEffect(() => {
    if (executedRef.current) return;
    if (app && !installing && (!success || !error)) {
      setRetry(false);
      installApp(app);
    } else {
      setError(true);
      setInfoMessage('Error during the installation of ' + app?.title + '.');
    }
    executedRef.current = true;
  }, [retry]);

  return (
    <div>
      <div data-testid="install-app-step" className="flex flex-col items-center justify-center gap-2 min-h-[350px] mt-4">
        {(installing || error) && (
          <div>
            <QuestItem id={currentQuest} level={0} showBorder={false} />
          </div>
        )}
        <div>
          {infoMessage ? (
            <div className={`px-4 py-3 rounded-lg mt-12 mb-2 ${success ? 'bg-success/10 text-success' : 'bg-accent/10 text-accent'}`}>
              <p className="font-semibold mb-1">{success ? 'Success' : 'Info'}</p>
              <p className="text-sm">{infoMessage}</p>
            </div>
          ) : null}
        </div>
        {error && (
          <div>
            <button onClick={() => { executedRef.current = false; setRetry(true); }} className="px-4 py-2 rounded-lg font-semibold transition inline-flex items-center gap-2 hover:bg-white/10">
              <RotateCcw size={18} /> Retry
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
