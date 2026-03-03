import { useState, Fragment } from 'react';
import ReactDOM from 'react-dom';
import { Stack, IconButton, Tooltip, Typography, Box } from '@mui/material';
import { Play, Square, Trash2, Info, Settings } from 'lucide-react';
import AppStatusDot from './AppStatusDot';
import LoadIconButton from '@shared/components/LoadIconButton';
import ActionSnackbar from '@shared/components/ActionSnackbar';
import ContentDialog from '@shared/components/ContentDialog';
import ConfirmDialog from '@shared/components/ConfirmDialog';
import InstanceInfo from './instances/InstanceInfo';
import InstanceConfigDialog from './instances/InstanceConfigDialog';
import { EditorButtons } from '@shared/components/app-actions/editors/EditorButtons';
import { useProtectedApi } from '@shared/api/ApiProvider';
import { useQuestActions } from '@shared/quests/hooks';
import { useInvalidateAppData } from '@shared/hooks/app-queries';
import { questStateFinishedOk } from '@shared/quests/utils/QuestState';

interface InstanceRowProps {
  instance: any;
  showEditors?: boolean;
}

export default function InstanceRow({ instance, showEditors }: InstanceRowProps) {
  const invalidateAppData = useInvalidateAppData();
  const api = useProtectedApi();
  const { waitForQuest } = useQuestActions();

  const [starting, setStarting] = useState(false);
  const [stopping, setStopping] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ text: '', severity: 'success' as string, errorText: '' });

  const busy = starting || stopping || deleting;
  const notReady = instance.status !== 'running' && instance.status !== 'stopped';

  const runAction = async (
    action: () => Promise<any>,
    setLoading: (v: boolean) => void,
    successMsg: string,
    failMsg: string,
  ) => {
    setLoading(true);
    try {
      const quest = await action();
      const result = await waitForQuest(quest.data.jobId);
      if (questStateFinishedOk(result.state)) {
        setSnackbar({ text: successMsg, severity: 'success', errorText: '' });
        invalidateAppData();
      } else {
        throw new Error(result.description);
      }
    } catch (err: any) {
      setSnackbar({ text: failMsg, severity: 'error', errorText: err?.message ?? '' });
    } finally {
      setSnackbarOpen(true);
      setLoading(false);
    }
  };

  const start = () =>
    runAction(
      () => api.instances.instancesInstanceIdStartPost(instance.instanceId),
      setStarting,
      'Instance started',
      'Failed to start instance',
    );

  const stop = () =>
    runAction(
      () => api.instances.instancesInstanceIdStopPost(instance.instanceId),
      setStopping,
      'Instance stopped',
      'Failed to stop instance',
    );

  const remove = () =>
    runAction(
      () => api.instances.instancesInstanceIdDelete(instance.instanceId),
      setDeleting,
      'Instance deleted',
      'Failed to delete instance',
    );

  return (
    <Fragment>
      <Stack
        direction="row"
        alignItems="center"
        spacing={1.5}
        sx={{
          py: 1,
          px: 1,
          borderRadius: 1.5,
          '&:hover': { bgcolor: 'action.hover' },
        }}
      >
        <AppStatusDot status={instance.status} size={8} />

        <Typography variant="body2" sx={{ flex: 1, minWidth: 0 }} noWrap>
          {instance.instanceName}
        </Typography>

        <Typography variant="caption" color="text.secondary">
          v{instance.appKey.version}
        </Typography>

        {showEditors && <EditorButtons instance={instance} />}

        <Stack direction="row" spacing={0}>
          <Tooltip title="Info">
            <IconButton size="small" onClick={() => setInfoOpen(true)}>
              <Info size={16} />
            </IconButton>
          </Tooltip>

          <Tooltip title="Start">
            <span>
              <IconButton
                size="small"
                color="success"
                disabled={instance.status === 'running' || busy || notReady}
                onClick={start}
              >
                <Play size={16} />
              </IconButton>
            </span>
          </Tooltip>

          <Tooltip title="Stop">
            <span>
              <IconButton
                size="small"
                disabled={instance.status === 'stopped' || busy || notReady}
                onClick={stop}
              >
                <Square size={16} />
              </IconButton>
            </span>
          </Tooltip>

          <Tooltip title="Settings">
            <IconButton size="small" onClick={() => setSettingsOpen(true)}>
              <Settings size={16} />
            </IconButton>
          </Tooltip>

          <Tooltip title="Delete">
            <span>
              <IconButton size="small" disabled={busy} onClick={() => setConfirmOpen(true)}>
                <Trash2 size={16} />
              </IconButton>
            </span>
          </Tooltip>
        </Stack>
      </Stack>

      {ReactDOM.createPortal(
        <ContentDialog
          title={`Info: ${instance.instanceName}`}
          open={infoOpen}
          setOpen={setInfoOpen}
        >
          <InstanceInfo instance={instance} />
        </ContentDialog>,
        document.body,
      )}

      {ReactDOM.createPortal(
        <InstanceConfigDialog
          instanceId={instance.instanceId}
          instanceName={instance.instanceName}
          open={settingsOpen}
          onClose={() => setSettingsOpen(false)}
        />,
        document.body,
      )}

      {ReactDOM.createPortal(
        <ConfirmDialog
          title={`Remove ${instance.instanceName}?`}
          open={confirmOpen}
          setOpen={setConfirmOpen}
          onConfirm={remove}
        />,
        document.body,
      )}

      {ReactDOM.createPortal(
        <ActionSnackbar
          text={snackbar.text}
          errorText={snackbar.errorText}
          open={snackbarOpen}
          setOpen={setSnackbarOpen}
          alertSeverity={snackbar.severity}
        />,
        document.body,
      )}
    </Fragment>
  );
}
