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
import ReplayIcon from '@mui/icons-material/Replay';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import React from 'react';
import { ReferenceDataContext } from '@contexts/data/ReferenceDataContext';
import { QuestContext, useQuestContext } from '@contexts/quests/QuestContext';
import { useProtectedApi } from '@contexts/api/ApiProvider';
import { QuestLogEntry } from '../../../components/quests/QuestLogEntry';
import { questStateFinishedOk } from '../../../utils/quests/QuestState';

export default function SideloadApp(props) {
  const { manifest, handleActiveStep } = props;
  const executedRef = React.useRef(false);
  const { appList, setUpdateAppList } = React.useContext(ReferenceDataContext);
  const api = useProtectedApi();
  const context = useQuestContext(QuestContext);
  const [installing, setInstalling] = React.useState(false);
  const [success, setSuccess] = React.useState(false);
  const [error, setError] = React.useState(false);
  const [retry, setRetry] = React.useState(false);
  const [infoMessage, setInfoMessage] = React.useState(false);
  const [currentQuest, setCurrentQuest] = React.useState();

  const executeQuestStep = React.useCallback(
    async (questId) => {
      await context.fetchQuest(questId);
      setCurrentQuest(questId);
      const result = await context.waitForQuest(questId);
      if (!questStateFinishedOk(result.state)) {
        throw new Error(result.description);
      }
      return result;
    },
    [context],
  );

  const sideloadApp = React.useCallback(async (manifest) => {
    setInstalling(true);
    setSuccess(false);
    setError(false);

    try {
      // step 1: sideload
      const sideloadQuest = await api.app.appsSideloadPost({ manifest: JSON.stringify(manifest) });
      const sideloadQuestId = sideloadQuest.data.jobId;
      await executeQuestStep(sideloadQuestId);

      // step 2: create instance
      const instanceQuestId = await api.instances.instancesCreatePost({
        appKey: { name: manifest.app, version: manifest.version },
      });
      const instanceQuestIdValue = instanceQuestId.data.jobId;
      const instanceQuest = await executeQuestStep(instanceQuestIdValue);

      // step 3: start instance
      const startInstanceQuestId = await api.instances.instancesInstanceIdStartPost(
        instanceQuest.result,
      );
      const startQuestIdValue = startInstanceQuestId.data.jobId;
      await executeQuestStep(startQuestIdValue);

      // trigger a reload of all installed apps
      setUpdateAppList(true);
      setSuccess(true);
      setInfoMessage(manifest.title + ' successfully installed.');
      setInstalling(false);
      handleActiveStep();
    } catch (error) {
      setError(true);
      setSuccess(false);
      setInfoMessage(error.message || 'Error during sideload');
      setInstalling(false);
      setUpdateAppList(true);
    }
  });

  React.useEffect(() => {
    if (executedRef.current) return;

    if (manifest && !installing && (!success || !error)) {
      setRetry(false);
      sideloadApp(manifest);
    } else {
      setError(true);
      setInfoMessage('Error during the installation of ' + manifest?.title + '.');
    }
    executedRef.current = true;
  }, [retry]);

  const handleRetryClick = (event) => {
    setRetry(true);
    executedRef.current = false;
  };

  return (
    <div>
      <Grid
        data-testid="sideload-app-step"
        container
        direction="column"
        spacing={1}
        style={{ minHeight: 350, marginTop: 16 }}
        justifyContent="center"
        alignItems="center"
      >
        {installing && (
          <Grid>
            {currentQuest && <QuestLogEntry id={currentQuest} level={0} showBorder={false} />}
          </Grid>
        )}
        <Grid>
          {infoMessage && !error && (
            <Alert sx={{ mb: 2, marginTop: '50px' }} severity={success ? 'success' : 'info'}>
              <AlertTitle>{success ? 'Success' : 'Info'}</AlertTitle>
              <Typography variant="body2">{infoMessage}</Typography>
            </Alert>
          )}
        </Grid>
        {error && (
          <Grid>
            <Button onClick={() => handleRetryClick()} startIcon={<ReplayIcon />}>
              Retry
            </Button>
          </Grid>
        )}
      </Grid>
    </div>
  );
}
