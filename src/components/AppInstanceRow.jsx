/*
 * Copyright (c) 2021 FLECS Technologies GmbH
 *
 * Created on Fri Dec 03 2021
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
import React, { Fragment } from 'react';
import ReactDOM from 'react-dom';
import PropTypes, { bool } from 'prop-types';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Tooltip from '@mui/material/Tooltip';
import Grid from '@mui/material/Grid';
import PlayCircleIcon from '@mui/icons-material/PlayCircle';
import StopCircleIcon from '@mui/icons-material/StopCircle';
import CircleIcon from '@mui/icons-material/Circle';
import ErrorIcon from '@mui/icons-material/Error';
import DeleteIcon from '@mui/icons-material/Delete';
import InfoIcon from '@mui/icons-material/Info';
import SettingsIcon from '@mui/icons-material/Settings';
import LoadIconButton from './LoadIconButton';
import ActionSnackbar from './ActionSnackbar';
import { ReferenceDataContext } from '@contexts/data/ReferenceDataContext';
import ContentDialog from './ContentDialog';
import InstanceInfo from './InstanceInfo';
import ConfirmDialog from './ConfirmDialog';
import InstanceConfigDialog from './dialogs/InstanceConfigDialog';
import { EditorButtons } from './buttons/editors/EditorButtons';
import { questStateFinishedOk } from '../utils/quests/QuestState';
import { QuestContext, useQuestContext } from '@contexts/quests/QuestContext';
import { useProtectedApi } from '@contexts/api/ApiProvider';

export default function AppInstanceRow(props) {
  const { appInstance, showEditors } = props;
  const { setUpdateAppList } = React.useContext(ReferenceDataContext);
  const api = useProtectedApi();
  const context = useQuestContext(QuestContext);
  const [instanceStarting, setInstanceStarting] = React.useState(false);
  const [instanceStopping, setInstanceStopping] = React.useState(false);
  const [instanceDeleting, setInstanceDeleting] = React.useState(false);
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [instanceNotReady] = React.useState(
    props.appInstance.status !== 'running' && props.appInstance.status !== 'stopped',
  );
  const [instanceInfoOpen, setInstanceInfoOpen] = React.useState(false);
  const [instanceSettingsOpen, setInstanceSettingsOpen] = React.useState(false);
  const [snackbarOpen, setSnackbarOpen] = React.useState(false);
  const [snackbarState, setSnackbarState] = React.useState({
    snackbarText: 'Info',
    snackbarErrorText: '',
    alertSeverity: 'success',
  });
  const { snackbarText, snackbarErrorText, alertSeverity } = snackbarState;

  const stopInstance = async (instanceId) => {
    setInstanceStopping(true);
    let snackbarText;
    let alertSeverity;
    let snackbarErrorText;

    try {
      const stopQuest = await api.instances.instancesInstanceIdStopPost(instanceId);
      const result = await context.waitForQuest(stopQuest.data.jobId);

      if (questStateFinishedOk(result.state)) {
        setUpdateAppList(true);
        snackbarText = 'Successully stopped instance.';
        alertSeverity = 'success';
      } else {
        throw new Error(result.description);
      }
    } catch (error) {
      snackbarText = 'Failed to stop instance.';
      alertSeverity = 'error';
      snackbarErrorText = error.message;
    } finally {
      setSnackbarState({
        alertSeverity,
        snackbarText,
        snackbarErrorText: snackbarErrorText,
      });
      setSnackbarOpen(true);
      setInstanceStopping(false);
    }
  };

  const startInstance = async (instanceId) => {
    setInstanceStarting(true);
    let snackbarText;
    let alertSeverity;
    let snackbarErrorText;

    try {
      const startQuest = await api.instances.instancesInstanceIdStartPost(instanceId);
      const result = await context.waitForQuest(startQuest.data.jobId);
      if (questStateFinishedOk(result.state)) {
        setUpdateAppList(true);
        snackbarText = 'Successully started instance.';
        alertSeverity = 'success';
      } else {
        throw new Error(result.description);
      }
    } catch (error) {
      snackbarText = 'Failed to start instance.';
      alertSeverity = 'error';
      snackbarErrorText = error.message;
    } finally {
      setSnackbarState({
        alertSeverity,
        snackbarText,
        snackbarErrorText: snackbarErrorText,
      });
      setSnackbarOpen(true);
      setInstanceStarting(false);
    }
  };

  const deleteInstance = async (instanceId) => {
    setInstanceDeleting(true);
    let snackbarText;
    let alertSeverity;
    let snackbarErrorText;

    try {
      const deleteQuest = await api.instances.instancesInstanceIdDelete(instanceId);
      const result = await context.waitForQuest(deleteQuest.data.jobId);
      if (questStateFinishedOk(result.state)) {
        setUpdateAppList(true);
        snackbarText = 'Successully deleted instance.';
        alertSeverity = 'success';
      } else {
        throw new Error(result.description);
      }
    } catch {
      snackbarText = 'Failed to delete instance.';
      alertSeverity = 'error';
      snackbarErrorText = error.message;
    } finally {
      setSnackbarState({
        alertSeverity,
        snackbarText,
        snackbarErrorText: snackbarErrorText,
      });
      setSnackbarOpen(true);
      setInstanceDeleting(false);
    }
  };

  return (
    <Fragment>
      <TableRow>
        <TableCell component="th" scope="row">
          <Tooltip title={'App ' + appInstance.status}>
            {appInstance.status === 'running' ? (
              <CircleIcon color="success" />
            ) : (
              <ErrorIcon color="warning" />
            )}
          </Tooltip>
        </TableCell>
        <TableCell>{appInstance.instanceName}</TableCell>
        <TableCell>{appInstance.appKey.version}</TableCell>
        <TableCell>
          <Grid container direction="row" justify="flex-start" alignItems="flex-start">
            <Tooltip title="Info to this instance">
              <span>
                <LoadIconButton
                  label="instance-info-button"
                  icon={<InfoIcon />}
                  onClick={() => setInstanceInfoOpen(true)}
                />
              </span>
            </Tooltip>
            <Tooltip title="Start instance">
              <span>
                <LoadIconButton
                  label="start-instance-button"
                  icon={<PlayCircleIcon />}
                  color="success"
                  disabled={
                    appInstance.status === 'running' ||
                    instanceStarting ||
                    instanceStopping ||
                    instanceDeleting ||
                    instanceNotReady
                  }
                  onClick={() => startInstance(appInstance.instanceId)}
                  loading={instanceStarting}
                />
              </span>
            </Tooltip>
            <Tooltip title="Stop instance">
              <span>
                <LoadIconButton
                  label="stop-instance-button"
                  icon={<StopCircleIcon />}
                  disabled={
                    appInstance.status === 'stopped' ||
                    instanceStopping ||
                    instanceStarting ||
                    instanceDeleting ||
                    instanceNotReady
                  }
                  onClick={() => stopInstance(appInstance.instanceId)}
                  loading={instanceStopping}
                />
              </span>
            </Tooltip>
            <Tooltip title="Settings of this instance">
              <span>
                <LoadIconButton
                  label="instance-settings-button"
                  icon={<SettingsIcon />}
                  onClick={() => setInstanceSettingsOpen(true)}
                />
              </span>
            </Tooltip>
            <Tooltip title="Delete instance">
              <span>
                <LoadIconButton
                  label="delete-instance-button"
                  icon={<DeleteIcon />}
                  disabled={instanceDeleting || instanceStopping || instanceStarting}
                  onClick={() => setConfirmOpen(true)}
                  loading={instanceDeleting}
                />
              </span>
            </Tooltip>
          </Grid>
        </TableCell>
        {showEditors && (
          <TableCell>
            <span>
              <EditorButtons instance={appInstance}></EditorButtons>
            </span>
          </TableCell>
        )}
      </TableRow>
      {/* Portals for Dialogs and Snackbar */}
      {ReactDOM.createPortal(
        <ActionSnackbar
          text={snackbarText}
          errorText={snackbarErrorText}
          open={snackbarOpen}
          setOpen={setSnackbarOpen}
          alertSeverity={alertSeverity}
        />,
        document.body,
      )}
      {ReactDOM.createPortal(
        <ContentDialog
          title={'Info to ' + appInstance.instanceName}
          open={instanceInfoOpen}
          setOpen={setInstanceInfoOpen}
        >
          <InstanceInfo instance={appInstance} />
        </ContentDialog>,
        document.body,
      )}
      {ReactDOM.createPortal(
        <InstanceConfigDialog
          instanceId={appInstance.instanceId}
          instanceName={appInstance.instanceName}
          open={instanceSettingsOpen}
          onClose={() => setInstanceSettingsOpen(false)}
        />,
        document.body,
      )}
      {ReactDOM.createPortal(
        <ConfirmDialog
          title={'Remove ' + appInstance.instanceName + ' instance?'}
          open={confirmOpen}
          setOpen={setConfirmOpen}
          onConfirm={() => deleteInstance(appInstance.instanceId)}
        />,
        document.body,
      )}
    </Fragment>
  );
}

AppInstanceRow.propTypes = {
  app: PropTypes.object,
  appInstance: PropTypes.object,
  updateReferenceDataInstances: PropTypes.func,
  setSnackbarState: PropTypes.func,
  showEditors: bool,
};
