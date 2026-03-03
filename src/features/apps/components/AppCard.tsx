import { useState } from 'react';
import {
  Card,
  Avatar,
  Typography,
  IconButton,
  Tooltip,
  Stack,
  Chip,
  Collapse,
  Box,
} from '@mui/material';
import {
  Play,
  Square,
  Trash2,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Plus,
} from 'lucide-react';
import { App } from '@shared/types/app';
import AppStatusDot from './AppStatusDot';
import InstanceList from './InstanceList';
import UninstallButton from '@shared/components/app-actions/UninstallButton';
import LoadIconButton from '@shared/components/LoadIconButton';
import HelpButton from '@shared/components/help/HelpButton';
import { InstanceStartCreateButtons } from './instances/buttons/InstanceStartCreateButtons';
import { EditorButtons } from '@shared/components/app-actions/editors/EditorButtons';
import ActionSnackbar from '@shared/components/ActionSnackbar';
import { useQuestActions } from '@shared/quests/hooks';
import { useProtectedApi } from '@shared/api/ApiProvider';
import { useInvalidateAppData } from '@shared/hooks/app-queries';
import { questStateFinishedOk } from '@shared/quests/utils/QuestState';
import useStateWithLocalStorage from '@shared/hooks/LocalStorage';

interface AppCardProps {
  app: App;
}

export default function AppCard({ app }: AppCardProps) {
  const invalidateAppData = useInvalidateAppData();
  const api = useProtectedApi();
  const { waitForQuest } = useQuestActions();
  const [expanded, setExpanded] = useStateWithLocalStorage(
    app.appKey.name + '.card.expanded',
    false,
  );
  const [creating, setCreating] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarState, setSnackbarState] = useState({
    text: '',
    severity: 'success' as 'success' | 'error',
    errorText: '',
  });

  const instances = app.instances ?? [];
  const runningCount = instances.filter((i) => i.status === 'running').length;
  const hasInstances = instances.length > 0;

  const overallStatus = runningCount > 0 ? 'running' : hasInstances ? 'stopped' : 'stopped';

  const createNewInstance = async (start: boolean) => {
    setCreating(true);
    try {
      const createQuest = await api.instances.instancesCreatePost({
        appKey: { name: app.appKey.name, version: app.appKey.version },
      });
      const createResult = await waitForQuest(createQuest.data.jobId);

      if (questStateFinishedOk(createResult.state) && createResult.result && start) {
        const startQuest = await api.instances.instancesInstanceIdStartPost(createResult.result);
        await waitForQuest(startQuest.data.jobId);
      }

      setSnackbarState({
        text: `Instance ${start ? 'started' : 'created'} successfully`,
        severity: 'success',
        errorText: '',
      });
    } catch {
      setSnackbarState({
        text: `Failed to create instance of ${app.title}`,
        severity: 'error',
        errorText: '',
      });
    } finally {
      setSnackbarOpen(true);
      invalidateAppData();
      setCreating(false);
    }
  };

  const handleUninstallComplete = (success: boolean, message: string, error?: string) => {
    setSnackbarState({
      text: message,
      severity: success ? 'success' : 'error',
      errorText: error ?? '',
    });
    setSnackbarOpen(true);
  };

  return (
    <Card
      variant="outlined"
      aria-label={`${app.title} application card`}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 2,
        transition: 'border-color 0.2s, box-shadow 0.2s',
        '&:hover': {
          borderColor: 'primary.main',
          boxShadow: '0 0 0 1px rgba(255,46,99,0.2)',
        },
      }}
    >
      <Box sx={{ px: 1.5, py: 1.5 }}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Avatar
            src={app.avatar}
            variant="rounded"
            sx={{ width: 36, height: 36, bgcolor: 'action.hover', fontSize: 14 }}
          >
            {app.title?.charAt(0).toUpperCase()}
          </Avatar>

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Stack direction="row" alignItems="center" spacing={0.5}>
              <AppStatusDot status={overallStatus} size={8} />
              <Typography variant="body2" fontWeight={600} noWrap>
                {app.title}
              </Typography>
              {hasInstances && (
                <Chip
                  label={`${runningCount}/${instances.length}`}
                  size="small"
                  color={runningCount > 0 ? 'success' : 'default'}
                  variant="outlined"
                  sx={{ height: 18, fontSize: 11, ml: 'auto' }}
                />
              )}
            </Stack>
            <Typography variant="caption" color="text.secondary" noWrap sx={{ fontSize: 11 }}>
              {app.author} &middot; v{app.appKey.version}
            </Typography>
          </Box>
        </Stack>
      </Box>

      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ px: 1, pb: 1, pt: 0 }}
      >
        <Stack direction="row" spacing={0}>
          <Tooltip title="Create & start instance">
            <span>
              <IconButton
                size="small"
                onClick={() => createNewInstance(true)}
                disabled={(!app.multiInstance && hasInstances) || creating}
                sx={{ p: 0.5 }}
              >
                <Plus size={16} />
              </IconButton>
            </span>
          </Tooltip>
          <UninstallButton
            app={app}
            selectedVersion={{ version: app.appKey.version }}
            variant="icon"
            onUninstallComplete={handleUninstallComplete}
          />
          {app.documentationUrl && <HelpButton url={app.documentationUrl} label="Docs" />}
          {instances.length === 1 && <EditorButtons instance={instances[0]} />}
        </Stack>

        {hasInstances && (
          <IconButton
            size="small"
            onClick={() => setExpanded(!expanded)}
            aria-expanded={expanded}
            aria-label={expanded ? 'Collapse instances' : 'Expand instances'}
            sx={{ p: 0.5 }}
          >
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </IconButton>
        )}
      </Stack>

      <Collapse in={expanded} unmountOnExit>
        <Box sx={{ px: 2, pb: 2 }}>
          <InstanceList
            instances={instances}
            app={app}
            onCreateInstance={(start) => createNewInstance(start)}
            creating={creating}
          />
        </Box>
      </Collapse>

      <ActionSnackbar
        text={snackbarState.text}
        errorText={snackbarState.errorText}
        open={snackbarOpen}
        setOpen={setSnackbarOpen}
        alertSeverity={snackbarState.severity}
      />
    </Card>
  );
}
