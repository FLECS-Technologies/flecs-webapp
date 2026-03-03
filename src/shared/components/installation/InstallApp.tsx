/*
 * Copyright (c) 2022 FLECS Technologies GmbH
 *
 * Created on Thu Feb 03 2022
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
import { Button, Grid, Typography } from '@mui/material';
import { RotateCcw } from 'lucide-react';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import React from 'react';
import { useQuestActions } from '@shared/quests/hooks';
import { getQuest } from '@stores/quests';
import { useProtectedApi } from '@shared/api/ApiProvider';
import { QuestLogEntry } from '@shared/quests/components/QuestLogEntry';
import { useInvalidateAppData } from '@shared/hooks/app-queries';
import { questStateFinishedOk } from '@shared/quests/utils/QuestState';

export default function InstallApp(props) {
  const { app, version, handleActiveStep } = props;
  const { fetchQuest, waitForQuest } = useQuestActions();
  const invalidateAppData = useInvalidateAppData();
  const api = useProtectedApi();
  const [installing, setInstalling] = React.useState(false);
  const [success, setSuccess] = React.useState(false);
  const [error, setError] = React.useState(false);
  const [retry, setRetry] = React.useState(false);
  const [infoMessage, setInfoMessage] = React.useState(false);
  const executedRef = React.useRef(false);
  const [currentQuest, setCurrentQuest] = React.useState();

  const executeQuestStep = React.useCallback(
    async (questId) => {
      await fetchQuest(questId);
      setCurrentQuest(questId);
      props.onStateChange?.({
        installing: true,
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

  const installApp = React.useCallback(async (app) => {
    setInstalling(true);
    setSuccess(false);
    setError(false);
    setInfoMessage(
      'You can close this window. Installation takes place automatically in the background.',
    );
    props.onStateChange?.({ installing: true, currentQuest: null });
    try {
      //step 1: install app
      const installationQuestId = await api.app.appsInstallPost({
        appKey: { name: app.appKey.name, version: version },
      });
      await executeQuestStep(installationQuestId.data.jobId);

      // step 2: create instance
      const instanceQuestId = await api.instances.instancesCreatePost({
        appKey: { name: app.appKey.name, version: version },
      });
      const instanceQuest = await executeQuestStep(instanceQuestId.data.jobId);

      // step 3: start instance
      const startInstanceQuestId = await api.instances.instancesInstanceIdStartPost(
        instanceQuest.result,
      );
      await executeQuestStep(startInstanceQuestId.data.jobId);

      setSuccess(true);
      setInfoMessage(app.title + ' successfully installed.');
      invalidateAppData();
      handleActiveStep();
    } catch (error) {
      setError(true);
      setInfoMessage('Error during the installation of ' + app?.title + '.');
    } finally {
      setInstalling(false);
      props.onStateChange?.({ installing: false, currentQuest: null });
    }
  });

  React.useEffect(() => {
    if (executedRef.current) {
      return;
    }
    if (app && !installing && (!success || !error)) {
      setRetry(false);
      installApp(app);
    } else {
      setError(true);
      setInfoMessage('Error during the installation of ' + app?.title + '.');
    }
    executedRef.current = true;
  }, [retry]);

  const onRetryButtonClick = (event) => {
    executedRef.current = false;
    setRetry(true);
  };

  return (
    <div>
      <Grid
        data-testid="install-app-step"
        container
        direction="column"
        spacing={1}
        style={{ minHeight: 350, marginTop: 16 }}
        justifyContent="center"
        alignItems="center"
      >
        {(installing || error) && (
          <Grid>
            <QuestLogEntry id={currentQuest} level={0} showBorder={false} />
          </Grid>
        )}
        <Grid>
          {infoMessage ? (
            <Alert sx={{ mb: 2, marginTop: '50px' }} severity={success ? 'success' : 'info'}>
              <AlertTitle>{success ? 'Success' : 'Info'}</AlertTitle>
              <Typography variant="body2">{infoMessage}</Typography>
            </Alert>
          ) : null}
        </Grid>
        {error && (
          <Grid>
            <Button onClick={onRetryButtonClick} startIcon={<RotateCcw size={18} />}>
              Retry
            </Button>
          </Grid>
        )}
      </Grid>
    </div>
  );
}
