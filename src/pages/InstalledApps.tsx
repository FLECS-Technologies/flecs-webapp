import { useRef, useState } from 'react';
import { Box, Button, Paper, Skeleton, Stack, Typography } from '@mui/material';
import { FileCode2, FolderUp, PackagePlus, RefreshCw } from 'lucide-react';
import Yaml from 'js-yaml';
import { useAppList } from '@shared/hooks/app-queries';
import { useSystemPing } from '@shared/hooks/system-queries';
import { EmptyApps } from '../features/apps';
import InstalledAppsTable from '../features/apps/components/InstalledAppsTable';
import ContentDialog from '@shared/components/ContentDialog';
import InstallationStepper from '@shared/components/installation/InstallationStepper';
import Import from '@shared/components/data-transfer/Import';
import Export from '@shared/components/data-transfer/Export';
import { App } from '@shared/types/app';
import { createVersions, getLatestVersion } from '@shared/utils/version-utils';

function RowSkeleton() {
  return (
    <Paper
      variant="outlined"
      sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}
    >
      <Stack divider={<Box sx={{ borderBottom: '1px solid', borderColor: 'divider' }} />}>
        {[0, 1, 2].map((i) => (
          <Stack key={i} direction="row" spacing={2} alignItems="center" sx={{ px: 3, py: 2 }}>
            <Skeleton variant="rounded" width={48} height={48} sx={{ borderRadius: 2 }} />
            <Box sx={{ flex: 1 }}>
              <Skeleton width="35%" height={20} />
              <Skeleton width="45%" height={14} sx={{ mt: 0.5 }} />
              <Skeleton width="15%" height={12} sx={{ mt: 0.5 }} />
            </Box>
            <Skeleton variant="rounded" width={72} height={32} sx={{ borderRadius: 2 }} />
            <Skeleton variant="circular" width={28} height={28} />
          </Stack>
        ))}
      </Stack>
    </Paper>
  );
}

function getAppsWithUpdates(apps: App[]): App[] {
  return apps.filter((app) => {
    if (!app.versions || !app.installedVersions) return false;
    const versionsArray = createVersions(app.versions, app.installedVersions);
    const latest = getLatestVersion(versionsArray);
    return latest && !app.installedVersions.includes(latest.version);
  });
}

export default function InstalledApps() {
  const { appList, isLoading: appListLoading, isError: appListError } = useAppList();
  const { data: ping } = useSystemPing();
  const [sideloadDoc, setSideloadDoc] = useState<any>(null);
  const [sideloadPickerOpen, setSideloadPickerOpen] = useState(false);
  const [sideloadRunning, setSideloadRunning] = useState(false);
  const [updateAllOpen, setUpdateAllOpen] = useState(false);
  const sideloadInputRef = useRef<HTMLInputElement>(null);

  const installedApps: App[] = (appList ?? []).filter((app: App) => app?.status === 'installed');
  const appsWithUpdates = getAppsWithUpdates(installedApps);
  const updateCount = appsWithUpdates.length;

  const handleSideloadFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const doc = Yaml.load(ev.target?.result as string);
        setSideloadDoc(doc);
        setSideloadPickerOpen(false);
        setSideloadRunning(true);
      } catch (err) {
        console.error('Failed to parse sideload file:', err);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  if (!ping) {
    return (
      <Box sx={{ py: 10, textAlign: 'center' }}>
        <Typography color="text.secondary">
          FLECS services are not ready. Please try again in a moment.
        </Typography>
      </Box>
    );
  }

  if (appListError) {
    return (
      <Box sx={{ py: 10, textAlign: 'center' }}>
        <Typography color="error">Failed to load installed apps from the device.</Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Hidden sideload file input */}
      <input
        ref={sideloadInputRef}
        type="file"
        accept=".json"
        style={{ display: 'none' }}
        onChange={handleSideloadFile}
      />

      {/* Page header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="overline" color="text.disabled" fontWeight={600}>
          APPS
        </Typography>
        <Typography variant="h4" fontWeight={800}>
          Installed Apps
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5 }}>
          {installedApps.length} app{installedApps.length !== 1 ? 's' : ''} active on this device.
        </Typography>
      </Box>

      {/* Action cards row */}
      <Stack direction="row" spacing={2} sx={{ mb: 2.5, alignItems: 'stretch' }}>
        {/* Deploy your own app */}
        <Box
          onClick={() => setSideloadPickerOpen(true)}
          sx={{
            flex: 1,
            px: 3,
            py: 2.5,
            borderRadius: 3,
            border: '1px dashed',
            borderColor: 'divider',
            display: 'flex',
            alignItems: 'center',
            gap: 2.5,
            cursor: 'pointer',
            transition: 'border-color 0.2s, background-color 0.2s',
            '&:hover': {
              borderColor: 'primary.main',
              bgcolor: (theme) =>
                theme.palette.mode === 'dark' ? 'rgba(144,202,249,0.04)' : 'rgba(25,118,210,0.02)',
            },
          }}
        >
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: 2.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: (theme) =>
                theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
              color: 'text.secondary',
              flexShrink: 0,
            }}
          >
            <PackagePlus size={22} />
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle2" fontWeight={700}>
              Deploy Your Own App
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Upload a custom app manifest to sideload private Docker apps.
            </Typography>
          </Box>
          <Button
            variant="outlined"
            size="small"
            startIcon={<PackagePlus size={14} />}
            onClick={() => setSideloadPickerOpen(true)}
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              borderRadius: 2,
              px: 2,
              whiteSpace: 'nowrap',
            }}
          >
            Upload Manifest
          </Button>
        </Box>

        {/* Import config */}
        <Box
          sx={{
            px: 3,
            borderRadius: 3,
            border: '1px dashed',
            borderColor: 'divider',
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            transition: 'border-color 0.2s, background-color 0.2s',
            '&:hover': {
              borderColor: 'primary.main',
              bgcolor: (theme) =>
                theme.palette.mode === 'dark' ? 'rgba(144,202,249,0.04)' : 'rgba(25,118,210,0.02)',
            },
          }}
        >
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: (theme) =>
                theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
              color: 'text.disabled',
              flexShrink: 0,
            }}
          >
            <FolderUp size={18} />
          </Box>
          <Import />
        </Box>
      </Stack>

      {/* Update banner */}
      {updateCount > 0 && (
        <Paper
          elevation={0}
          sx={{
            mb: 2.5,
            px: 3,
            py: 2,
            borderRadius: 3,
            border: '1px solid',
            borderColor: 'info.main',
            bgcolor: (theme) =>
              theme.palette.mode === 'dark' ? 'rgba(33,150,243,0.06)' : 'rgba(33,150,243,0.04)',
            display: 'flex',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <RefreshCw size={20} style={{ color: 'var(--mui-palette-info-main)', flexShrink: 0 }} />
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle2" fontWeight={700}>
              {updateCount} update{updateCount !== 1 ? 's' : ''} available
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {appsWithUpdates.map((a) => a.title).join(', ')}
            </Typography>
          </Box>
          <Button
            variant="contained"
            size="small"
            color="info"
            startIcon={<RefreshCw size={14} />}
            onClick={() => setUpdateAllOpen(true)}
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              borderRadius: 2,
              px: 2.5,
              whiteSpace: 'nowrap',
            }}
          >
            Update All
          </Button>
        </Paper>
      )}

      {appListLoading && ping && installedApps.length === 0 ? (
        <RowSkeleton />
      ) : installedApps.length === 0 && !appListLoading ? (
        <Paper variant="outlined" sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
          <EmptyApps onSideload={() => setSideloadPickerOpen(true)} />
        </Paper>
      ) : (
        <InstalledAppsTable apps={installedApps} />
      )}

      {/* Download backup — subtle bottom utility */}
      {installedApps.length > 0 && (
        <Stack direction="row" justifyContent="flex-end" sx={{ mt: 2 }}>
          <Export disabled={installedApps.length === 0} />
        </Stack>
      )}

      {/* Sideload picker dialog */}
      <ContentDialog
        open={sideloadPickerOpen}
        setOpen={setSideloadPickerOpen}
        title="Deploy Your Own App"
      >
        <Box sx={{ p: 1 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
            Sideload a private or custom Docker app by uploading its JSON manifest.
            Deploy anything — your own images, internal tools, or custom IoT services — directly on this device.
          </Typography>
          <Box
            sx={{
              border: '2px dashed',
              borderColor: 'divider',
              borderRadius: 3,
              py: 5,
              px: 3,
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'border-color 0.2s, background-color 0.2s',
              '&:hover': {
                borderColor: 'primary.main',
                bgcolor: (theme) =>
                  theme.palette.mode === 'dark' ? 'rgba(144,202,249,0.04)' : 'rgba(25,118,210,0.03)',
              },
            }}
            onClick={() => sideloadInputRef.current?.click()}
          >
            <FileCode2 size={32} strokeWidth={1.5} style={{ opacity: 0.4, marginBottom: 8 }} />
            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 0.5 }}>
              Select app manifest
            </Typography>
            <Typography variant="caption" color="text.disabled">
              Accepts .json files
            </Typography>
          </Box>
          <Typography variant="caption" color="text.disabled" sx={{ mt: 2, display: 'block' }}>
            The manifest defines the app name, version, Docker image, ports, and other configuration.
          </Typography>
        </Box>
      </ContentDialog>

      {/* Sideload installation progress */}
      <ContentDialog
        open={sideloadRunning}
        setOpen={setSideloadRunning}
        title="Installing Sideloaded App"
      >
        <InstallationStepper app={sideloadDoc} sideload={true} />
      </ContentDialog>

      {/* Update All dialog — sequential updates */}
      <ContentDialog
        open={updateAllOpen}
        setOpen={setUpdateAllOpen}
        title={`Update ${updateCount} app${updateCount !== 1 ? 's' : ''}`}
      >
        <Stack spacing={2} sx={{ p: 1 }}>
          {appsWithUpdates.map((app) => {
            const versionsArray = createVersions(app.versions || [], app.installedVersions || []);
            const latest = getLatestVersion(versionsArray);
            if (!latest) return null;
            return (
              <Box key={app.appKey?.name}>
                <InstallationStepper
                  app={app}
                  version={latest.version}
                  update={true}
                />
              </Box>
            );
          })}
        </Stack>
      </ContentDialog>
    </Box>
  );
}
