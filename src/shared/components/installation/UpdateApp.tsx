import React, { useState, useCallback, useRef } from 'react';
import { Button, Grid, Typography, Alert, AlertTitle } from '@mui/material';
import { RotateCcw } from 'lucide-react';
import { useAppList, useInvalidateAppData } from '@shared/hooks/app-queries';
import { UpdateInstances } from '@shared/api/instances';
import { useProtectedApi } from '@shared/api/ApiProvider';
import { useQuestActions } from '@shared/quests/hooks';
import { getQuest } from '@stores/quests';
import { QuestLogEntry } from '@shared/quests/components/QuestLogEntry';
import { questStateFinishedOk } from '@shared/quests/utils/QuestState';

export default function UpdateApp({ app, from, to, handleActiveStep, onStateChange }) {
  const executedRef = useRef(false);
  const { appList } = useAppList();
  const invalidateAppData = useInvalidateAppData();
  const { fetchQuest, waitForQuest, waitForQuests } = useQuestActions();
  const api = useProtectedApi();
  const [updating, setUpdating] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(false);
  const [retry, setRetry] = useState(false);
  const [installationMessage, setInstallationMessage] = useState('');
  const [currentQuest, setCurrentQuest] = React.useState();

  const executeQuestStep = useCallback(
    async (questId) => {
      await fetchQuest(questId);
      setCurrentQuest(questId);
      onStateChange?.({
        updating: true,
        currentQuest: getQuest(questId),
      });
      const result = await waitForQuest(questId);
      if (!questStateFinishedOk(result.state)) {
        throw new Error(result.description);
      }
      return result;
    },
    [fetchQuest, waitForQuest],
  );

  const updateApp = useCallback(
    async (app, from, to) => {
      try {
        const installedApp = appList?.find(
          (obj) => obj.appKey.name === app.appKey.name && obj.appKey.version === from,
        );

        if (!installedApp)
          throw new Error(`${app.appKey.name} is not installed and therefore can't be updated!`);

        setUpdating(true);
        onStateChange?.({ updating: true, currentQuest: null });

        // 1. install the requested version
        const installQuest = await api.app.appsInstallPost({
          appKey: { name: app.appKey.name, version: to },
        });
        const installQuestId = installQuest.data.jobId;
        await executeQuestStep(installQuestId);

        // 2. update all instances
        setInstallationMessage(`Migrating ${installedApp?.instances?.length} instances...`);
        const updateQuestIds = await UpdateInstances(installedApp?.instances, to, api);
        const updateQuests = await waitForQuests(updateQuestIds);
        const unsuccessfulQuests = updateQuests.find((quest) => !questStateFinishedOk(quest.state));
        if (unsuccessfulQuests) {
          throw new Error(
            `One or more instance migrations failed with status: ${unsuccessfulQuests}`,
          );
        }

        // 3. uninstall the previous version
        const uninstallQuest = await api.app.appsAppDelete(app.appKey.name, from);
        const uninstallQuestId = uninstallQuest.data.jobId;
        await executeQuestStep(uninstallQuestId);

        setInstallationMessage(
          `Congratulations! ${app?.title} was successfully ${
            from < to ? 'updated' : 'downgraded'
          } from version ${from} to version ${to}!`,
        );
        invalidateAppData();
        setUpdating(false);
        setSuccess(true);
        setError(false);
        handleActiveStep();
        onStateChange?.({ updating: false, currentQuest: null });
      } catch (error) {
        setInstallationMessage(
          `Oops... ${
            error.message ||
            `Error during the ${from < to ? 'update' : 'downgrade'} of ${app?.title}.`
          }`,
        );

        setError(true);
        setSuccess(false);
        setUpdating(false);
        onStateChange?.({ updating: false, currentQuest: null });
        handleActiveStep(-1);
      }
    },
    [appList, invalidateAppData],
  );

  React.useEffect(() => {
    if (executedRef.current) return;

    if (app && from && to && !updating && (!success || !error)) {
      setRetry(false);
      updateApp(app, from, to);
    }

    executedRef.current = true;
  }, [retry, app, from, to, updating, success, error, updateApp]);

  const handleRetryClick = () => {
    setRetry(true);
    executedRef.current = false;
  };

  return (
    <div>
      <Grid
        data-testid="update-app-step"
        container
        direction="column"
        spacing={1}
        style={{ minHeight: 350, marginTop: 16 }}
        justifyContent="center"
        alignItems="center"
      >
        {updating && (
          <Grid>
            <QuestLogEntry id={currentQuest} level={0} showBorder={false} />
          </Grid>
        )}
        <Grid>
          {installationMessage ? (
            <Alert sx={{ mb: 2, marginTop: '50px' }} severity={success ? 'success' : 'info'}>
              <AlertTitle>{success ? 'Success' : 'Info'}</AlertTitle>
              <Typography variant="body2">{installationMessage}</Typography>
            </Alert>
          ) : null}
        </Grid>
        {error && (
          <Grid>
            <Button onClick={handleRetryClick} startIcon={<RotateCcw size={18} />}>
              Retry
            </Button>
          </Grid>
        )}
      </Grid>
    </div>
  );
}
