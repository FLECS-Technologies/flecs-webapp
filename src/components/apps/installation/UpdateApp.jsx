import React, { useState, useCallback, useRef, useContext } from 'react';
import { Button, Grid, Typography, Alert, AlertTitle } from '@mui/material';
import { Replay as ReplayIcon } from '@mui/icons-material';
import PropTypes from 'prop-types';
import { ReferenceDataContext } from '../../../data/ReferenceDataContext';
import { UpdateInstances } from '../../../api/device/instances/instance';
import { useProtectedApi } from '../../../components/providers/ApiProvider';
import { QuestContext, useQuestContext } from '../../quests/QuestContext';
import { QuestLogEntry } from '../../../components/quests/QuestLogEntry';
import { questStateFinishedOk } from '../../../utils/quests/QuestState';

export default function UpdateApp({ app, from, to, handleActiveStep, onStateChange }) {
  const executedRef = useRef(false);
  const { appList, setUpdateAppList } = useContext(ReferenceDataContext);
  const context = useQuestContext(QuestContext);
  const api = useProtectedApi();
  const [updating, setUpdating] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(false);
  const [retry, setRetry] = useState(false);
  const [installationMessage, setInstallationMessage] = useState('');
  const [currentQuest, setCurrentQuest] = React.useState();

  const executeQuestStep = useCallback(
    async (questId) => {
      await context.fetchQuest(questId);
      setCurrentQuest(questId);
      onStateChange?.({
        updating: true,
        currentQuest: context.quests.current.get(questId),
      });
      const result = await context.waitForQuest(questId);
      if (!questStateFinishedOk(result.state)) {
        throw new Error(result.description);
      }
      return result;
    },
    [context],
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
        const updateQuests = await context.waitForQuests(updateQuestIds);
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
        setUpdateAppList(true);
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
    [appList, setUpdateAppList],
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
            <Button onClick={handleRetryClick} startIcon={<ReplayIcon />}>
              Retry
            </Button>
          </Grid>
        )}
      </Grid>
    </div>
  );
}

UpdateApp.propTypes = {
  app: PropTypes.object,
  from: PropTypes.string,
  to: PropTypes.string,
  handleActiveStep: PropTypes.func,
  onStateChange: PropTypes.func,
};
