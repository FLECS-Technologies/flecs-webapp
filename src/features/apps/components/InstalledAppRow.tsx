import { useState } from 'react';
import ReactDOM from 'react-dom';
import {
  Avatar,
  Box,
  Button,
  Chip,
  Divider,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  ExternalLink,
  MoreHorizontal,
  Play,
  Plus,
  Square,
  Settings,
  Info,
  Trash2,
  BookOpen,
  RefreshCw,
  GitBranch,
} from 'lucide-react';
import { App } from '@shared/types/app';
import { Version } from '@shared/types/version';
import { createVersions, getLatestVersion, createVersion } from '@shared/utils/version-utils';
import AppStatusDot from './AppStatusDot';
import UninstallButton from '@shared/components/app-actions/UninstallButton';
import UpdateButton from '@shared/components/app-actions/UpdateButton';
import ActionSnackbar from '@shared/components/ActionSnackbar';
import ContentDialog from '@shared/components/ContentDialog';
import InstanceInfo from './instances/InstanceInfo';
import InstanceConfigDialog from './instances/InstanceConfigDialog';
import { VersionSelector } from '@shared/components/VersionSelector';
import { createUrl } from '@shared/components/app-actions/editors/EditorButton';
import { useProtectedApi } from '@shared/api/ApiProvider';
import { useQuestActions } from '@shared/quests/hooks';
import { useInvalidateAppData } from '@shared/hooks/app-queries';
import { questStateFinishedOk } from '@shared/quests/utils/QuestState';

interface InstalledAppRowProps {
  app: App;
}

export default function InstalledAppRow({ app }: InstalledAppRowProps) {
  const invalidateAppData = useInvalidateAppData();
  const api = useProtectedApi();
  const { waitForQuest } = useQuestActions();

  // Single instance — always pick first
  const instance = (app.instances ?? [])[0] as any | undefined;
  const isRunning = instance?.status === 'running';
  const isStopped = instance?.status === 'stopped';
  const hasEditors = instance?.editors?.length > 0;
  const primaryEditor = instance?.editors?.[0];

  // Version management
  const versionsArray = app.versions
    ? createVersions(app.versions, app.installedVersions || [])
    : [];
  const latestVersion = getLatestVersion(versionsArray);
  const updateAvailable =
    latestVersion &&
    app.installedVersions &&
    !app.installedVersions.includes(latestVersion.version);
  const [selectedVersion, setSelectedVersion] = useState<Version>(
    latestVersion ?? createVersion(app.appKey?.version ?? ''),
  );

  const statusLabel = !instance
    ? 'No instance'
    : isRunning
      ? 'Running'
      : isStopped
        ? 'Stopped'
        : instance.status ?? 'Unknown';

  // Menu state
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const menuOpen = Boolean(menuAnchor);

  // Dialog states
  const [infoOpen, setInfoOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [versionOpen, setVersionOpen] = useState(false);

  // Action states
  const [busy, setBusy] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({
    text: '',
    severity: 'success' as 'success' | 'error',
    errorText: '',
  });

  const runInstanceAction = async (
    action: () => Promise<any>,
    successMsg: string,
    failMsg: string,
  ) => {
    setBusy(true);
    setMenuAnchor(null);
    try {
      const quest = await action();
      const result = await waitForQuest(quest.data.jobId);
      if (questStateFinishedOk(result.state)) {
        setSnackbar({ text: successMsg, severity: 'success', errorText: '' });
      } else {
        throw new Error(result.description);
      }
    } catch (err: any) {
      setSnackbar({ text: failMsg, severity: 'error', errorText: err?.message ?? '' });
    } finally {
      setSnackbarOpen(true);
      invalidateAppData();
      setBusy(false);
    }
  };

  const handleCreateAndStart = async () => {
    setBusy(true);
    setMenuAnchor(null);
    try {
      const createQuest = await api.instances.instancesCreatePost({
        appKey: { name: app.appKey.name, version: app.appKey.version },
      });
      const createResult = await waitForQuest(createQuest.data.jobId);

      if (questStateFinishedOk(createResult.state) && createResult.result) {
        const startQuest = await api.instances.instancesInstanceIdStartPost(createResult.result);
        await waitForQuest(startQuest.data.jobId);
      }

      setSnackbar({ text: `${app.title} started`, severity: 'success', errorText: '' });
    } catch (err: any) {
      setSnackbar({
        text: `Failed to create instance of ${app.title}`,
        severity: 'error',
        errorText: err?.message ?? '',
      });
    } finally {
      setSnackbarOpen(true);
      invalidateAppData();
      setBusy(false);
    }
  };

  const handleStart = () => {
    if (!instance) return;
    runInstanceAction(
      () => api.instances.instancesInstanceIdStartPost(instance.instanceId),
      `${app.title} started`,
      `Failed to start ${app.title}`,
    );
  };

  const handleStop = () => {
    if (!instance) return;
    runInstanceAction(
      () => api.instances.instancesInstanceIdStopPost(instance.instanceId),
      `${app.title} stopped`,
      `Failed to stop ${app.title}`,
    );
  };

  const handleUninstallComplete = (success: boolean, message: string, error?: string) => {
    setSnackbar({
      text: message,
      severity: success ? 'success' : 'error',
      errorText: error ?? '',
    });
    setSnackbarOpen(true);
  };

  const handleOpenApp = () => {
    if (primaryEditor) {
      window.open(createUrl(primaryEditor.url));
    }
  };

  const selectedVersionNotInstalled =
    !app.installedVersions?.includes(selectedVersion.version);

  return (
    <>
      <Stack
        direction="row"
        alignItems="center"
        spacing={2}
        sx={{
          px: 3,
          py: 2,
          transition: 'background-color 0.15s',
          '&:hover': {
            bgcolor: (theme) =>
              theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
          },
        }}
      >
        {/* Avatar */}
        <Avatar
          src={app.avatar}
          variant="rounded"
          sx={{
            width: 48,
            height: 48,
            bgcolor: (theme) =>
              theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'grey.50',
            fontSize: 18,
            fontWeight: 700,
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          {app.title?.charAt(0).toUpperCase()}
        </Avatar>

        {/* Identity + status */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="subtitle2" fontWeight={700} noWrap>
              {app.title}
            </Typography>
            {updateAvailable && (
              <Chip
                label="Update"
                size="small"
                color="info"
                variant="outlined"
                icon={<RefreshCw size={12} />}
                onClick={() => setVersionOpen(true)}
                sx={{
                  height: 22,
                  fontSize: '0.65rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  '& .MuiChip-icon': { fontSize: 12 },
                }}
              />
            )}
          </Stack>
          <Stack direction="row" spacing={1} alignItems="center">
            {app.author && (
              <Typography variant="caption" color="text.secondary" noWrap>
                {app.author}
              </Typography>
            )}
            {app.author && (
              <Typography variant="caption" color="text.disabled">
                ·
              </Typography>
            )}
            <Typography
              variant="caption"
              color="text.secondary"
              fontFamily="monospace"
              noWrap
            >
              v{app.appKey?.version}
            </Typography>
          </Stack>
          <Stack direction="row" spacing={0.75} alignItems="center" sx={{ mt: 0.25 }}>
            <AppStatusDot status={instance?.status ?? 'stopped'} size={8} />
            <Typography
              variant="caption"
              fontWeight={500}
              color={isRunning ? 'success.main' : 'text.disabled'}
            >
              {statusLabel}
            </Typography>
          </Stack>
        </Box>

        {/* Primary CTA — Open app */}
        {hasEditors && (
          <Tooltip title={`Open ${primaryEditor.name || app.title} in a new tab`}>
            <span>
              <Button
                variant="outlined"
                size="small"
                startIcon={<ExternalLink size={15} />}
                disabled={!isRunning}
                onClick={handleOpenApp}
                sx={{
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '0.8rem',
                  borderRadius: 2,
                  borderColor: 'divider',
                  color: isRunning ? 'text.primary' : 'text.disabled',
                  px: 2,
                  whiteSpace: 'nowrap',
                  '&:hover': {
                    borderColor: 'primary.main',
                    bgcolor: (theme) =>
                      theme.palette.mode === 'dark'
                        ? 'rgba(255,46,99,0.06)'
                        : 'rgba(255,46,99,0.04)',
                  },
                }}
              >
                Open
              </Button>
            </span>
          </Tooltip>
        )}

        {/* Overflow menu */}
        <IconButton
          size="small"
          onClick={(e) => setMenuAnchor(e.currentTarget)}
          disabled={busy}
          sx={{
            color: 'text.secondary',
            '&:hover': { bgcolor: 'action.hover' },
          }}
        >
          <MoreHorizontal size={18} />
        </IconButton>

        <Menu
          anchorEl={menuAnchor}
          open={menuOpen}
          onClose={() => setMenuAnchor(null)}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          slotProps={{
            paper: {
              sx: { minWidth: 200, borderRadius: 2.5, mt: 0.5 },
            },
          }}
        >
          {!instance && (
            <MenuItem onClick={handleCreateAndStart}>
              <ListItemIcon>
                <Plus size={16} />
              </ListItemIcon>
              <ListItemText>Create & Start</ListItemText>
            </MenuItem>
          )}
          {instance && isStopped && (
            <MenuItem onClick={handleStart}>
              <ListItemIcon>
                <Play size={16} />
              </ListItemIcon>
              <ListItemText>Start</ListItemText>
            </MenuItem>
          )}
          {instance && isRunning && (
            <MenuItem onClick={handleStop}>
              <ListItemIcon>
                <Square size={16} />
              </ListItemIcon>
              <ListItemText>Stop</ListItemText>
            </MenuItem>
          )}
          {versionsArray.length > 0 && (
            <MenuItem
              onClick={() => {
                setMenuAnchor(null);
                setVersionOpen(true);
              }}
            >
              <ListItemIcon>
                <GitBranch size={16} />
              </ListItemIcon>
              <ListItemText>
                Change Version
                {updateAvailable && (
                  <Typography
                    component="span"
                    variant="caption"
                    color="info.main"
                    sx={{ ml: 1 }}
                  >
                    {latestVersion?.version}
                  </Typography>
                )}
              </ListItemText>
            </MenuItem>
          )}
          {instance && (
            <MenuItem
              onClick={() => {
                setMenuAnchor(null);
                setSettingsOpen(true);
              }}
            >
              <ListItemIcon>
                <Settings size={16} />
              </ListItemIcon>
              <ListItemText>Settings</ListItemText>
            </MenuItem>
          )}
          {instance && (
            <MenuItem
              onClick={() => {
                setMenuAnchor(null);
                setInfoOpen(true);
              }}
            >
              <ListItemIcon>
                <Info size={16} />
              </ListItemIcon>
              <ListItemText>Info & Logs</ListItemText>
            </MenuItem>
          )}
          {app.documentationUrl && (
            <MenuItem
              onClick={() => {
                setMenuAnchor(null);
                window.open(app.documentationUrl);
              }}
            >
              <ListItemIcon>
                <BookOpen size={16} />
              </ListItemIcon>
              <ListItemText>Documentation</ListItemText>
            </MenuItem>
          )}
          <Divider />
          <UninstallButton
            app={app}
            selectedVersion={{ version: app.appKey?.version }}
            variant="menuItem"
            onUninstallComplete={handleUninstallComplete}
            onMenuClose={() => setMenuAnchor(null)}
          />
        </Menu>
      </Stack>

      {/* Dialogs via portal */}
      {ReactDOM.createPortal(
        <>
          {instance && (
            <>
              <ContentDialog
                title={`Info: ${instance.instanceName}`}
                open={infoOpen}
                setOpen={setInfoOpen}
              >
                <InstanceInfo instance={instance} />
              </ContentDialog>
              <InstanceConfigDialog
                instanceId={instance.instanceId}
                instanceName={instance.instanceName}
                open={settingsOpen}
                onClose={() => setSettingsOpen(false)}
              />
            </>
          )}

          {/* Version management dialog */}
          <ContentDialog
            title={`${app.title} — Version`}
            open={versionOpen}
            setOpen={setVersionOpen}
          >
            <Box sx={{ p: 1 }}>
              {versionsArray.length > 0 && (
                <VersionSelector
                  availableVersions={versionsArray}
                  selectedVersion={selectedVersion}
                  setSelectedVersion={setSelectedVersion}
                />
              )}
              {selectedVersionNotInstalled && (
                <Box sx={{ mt: 2 }}>
                  <UpdateButton
                    app={app}
                    to={selectedVersion}
                    showSelectedVersion
                    fullWidth
                    sx={{
                      borderRadius: 2,
                      textTransform: 'none',
                      fontWeight: 700,
                    }}
                  />
                </Box>
              )}
              {!selectedVersionNotInstalled && (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 2, textAlign: 'center' }}
                >
                  v{selectedVersion.version} is already installed.
                </Typography>
              )}
            </Box>
          </ContentDialog>

          <ActionSnackbar
            text={snackbar.text}
            errorText={snackbar.errorText}
            open={snackbarOpen}
            setOpen={setSnackbarOpen}
            alertSeverity={snackbar.severity}
          />
        </>,
        document.body,
      )}
    </>
  );
}
