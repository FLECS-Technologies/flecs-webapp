import { useState, Fragment } from 'react';
import ReactDOM from 'react-dom';
import {
  Avatar,
  Box,
  Chip,
  Collapse,
  Divider,
  IconButton,
  Stack,
  TableCell,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material';
import { ChevronDown, ChevronUp, Plus } from 'lucide-react';
import { App } from '@shared/types/app';
import InstanceRow from './InstanceRow';
import UninstallButton from '@shared/components/app-actions/UninstallButton';
import HelpButton from '@shared/components/help/HelpButton';
import { EditorButtons } from '@shared/components/app-actions/editors/EditorButtons';
import ActionSnackbar from '@shared/components/ActionSnackbar';
import { useQuestActions } from '@shared/quests/hooks';
import { useProtectedApi } from '@shared/api/ApiProvider';
import { useInvalidateAppData } from '@shared/hooks/app-queries';
import { questStateFinishedOk } from '@shared/quests/utils/QuestState';
import useStateWithLocalStorage from '@shared/hooks/LocalStorage';

interface InstalledAppRowProps {
  app: App;
}

export default function InstalledAppRow({ app }: InstalledAppRowProps) {
  const invalidateAppData = useInvalidateAppData();
  const api = useProtectedApi();
  const { waitForQuest } = useQuestActions();
  const [expanded, setExpanded] = useStateWithLocalStorage(
    app.appKey.name + '.table.expanded',
    false,
  );
  const [creating, setCreating] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({
    text: '',
    severity: 'success' as 'success' | 'error',
    errorText: '',
  });

  const instances = app.instances ?? [];
  const runningCount = instances.filter((i: any) => i.status === 'running').length;
  const hasInstances = instances.length > 0;
  const overallStatus = runningCount > 0 ? 'running' : 'stopped';
  const statusLabel = runningCount > 0 ? `Active (${runningCount})` : 'Stopped';
  const category = app.categories?.[0]?.name ?? '—';

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

      setSnackbar({
        text: `Instance ${start ? 'started' : 'created'} successfully`,
        severity: 'success',
        errorText: '',
      });
    } catch {
      setSnackbar({
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
    setSnackbar({
      text: message,
      severity: success ? 'success' : 'error',
      errorText: error ?? '',
    });
    setSnackbarOpen(true);
  };

  return (
    <Fragment>
      <TableRow
        hover
        sx={{
          '& > td': {
            borderBottom: hasInstances && expanded ? 'none' : undefined,
          },
          cursor: hasInstances ? 'pointer' : 'default',
        }}
        onClick={hasInstances ? () => setExpanded(!expanded) : undefined}
      >
        {/* Expand chevron */}
        <TableCell sx={{ px: 1, width: 48 }}>
          {hasInstances && (
            <IconButton size="small" aria-label={expanded ? 'Collapse' : 'Expand'}>
              {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </IconButton>
          )}
        </TableCell>

        {/* Application: icon + name + author */}
        <TableCell>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Avatar
              src={app.avatar}
              variant="rounded"
              sx={{
                width: 36,
                height: 36,
                bgcolor: 'action.hover',
                fontSize: 14,
                borderRadius: 1.5,
              }}
            >
              {app.title?.charAt(0).toUpperCase()}
            </Avatar>
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="subtitle2" fontWeight={700} noWrap>
                {app.title}
              </Typography>
              {app.author && (
                <Typography variant="caption" color="text.secondary" noWrap display="block">
                  {app.author}
                </Typography>
              )}
            </Box>
          </Stack>
        </TableCell>

        {/* Version */}
        <TableCell>
          <Typography variant="body2" fontFamily="monospace" color="text.secondary">
            {app.appKey.version}
          </Typography>
        </TableCell>

        {/* Category (hidden on mobile) */}
        <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
          <Typography variant="body2" color="text.secondary">
            {category}
          </Typography>
        </TableCell>

        {/* Status */}
        <TableCell>
          <Chip
            label={statusLabel}
            size="small"
            variant="outlined"
            color={runningCount > 0 ? 'success' : 'default'}
            sx={{ fontWeight: 500, fontSize: '0.75rem' }}
          />
        </TableCell>

        {/* Actions */}
        <TableCell align="right" onClick={(e) => e.stopPropagation()}>
          <Stack direction="row" spacing={0} justifyContent="flex-end">
            <Tooltip title="Create & start instance">
              <span>
                <IconButton
                  size="small"
                  onClick={() => createNewInstance(true)}
                  disabled={(!app.multiInstance && hasInstances) || creating}
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
        </TableCell>
      </TableRow>

      {/* Instance sub-rows (collapsible) */}
      {hasInstances && (
        <TableRow>
          <TableCell
            colSpan={6}
            sx={{
              py: 0,
              px: 0,
              borderBottom: expanded ? '1px solid' : 'none',
              borderColor: 'divider',
            }}
          >
            <Collapse in={expanded} unmountOnExit>
              <Box
                sx={{
                  pl: 7,
                  pr: 2,
                  py: 1,
                  bgcolor: (theme) =>
                    theme.palette.mode === 'dark'
                      ? 'rgba(255,255,255,0.02)'
                      : 'rgba(0,0,0,0.02)',
                }}
              >
                <Stack spacing={0} divider={<Divider />}>
                  {instances.map((instance: any) => (
                    <InstanceRow
                      key={instance.instanceId}
                      instance={instance}
                      showEditors={instances.length > 1}
                    />
                  ))}
                </Stack>
              </Box>
            </Collapse>
          </TableCell>
        </TableRow>
      )}

      {/* Snackbar via portal (can't be a direct child of TableBody) */}
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
