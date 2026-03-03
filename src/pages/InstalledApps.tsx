import { useState } from 'react';
import { Box, Paper, Skeleton, Stack, Typography } from '@mui/material';
import { useAppList } from '@shared/hooks/app-queries';
import { useSystemPing } from '@shared/hooks/system-queries';
import { AppsToolbar, EmptyApps } from '../features/apps';
import InstalledAppsTable from '../features/apps/components/InstalledAppsTable';
import ContentDialog from '@shared/components/ContentDialog';
import InstallationStepper from '@shared/components/installation/InstallationStepper';
import { App } from '@shared/types/app';

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

export default function InstalledApps() {
  const { appList, isLoading: appListLoading, isError: appListError } = useAppList();
  const { data: ping } = useSystemPing();
  const [sideloadDoc, setSideloadDoc] = useState<any>(null);
  const [sideloadOpen, setSideloadOpen] = useState(false);

  const installedApps: App[] = (appList ?? []).filter((app: App) => app?.status === 'installed');

  const handleSideload = (doc: any) => {
    setSideloadDoc(doc);
    setSideloadOpen(true);
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

      {appListLoading && ping && installedApps.length === 0 ? (
        <RowSkeleton />
      ) : installedApps.length === 0 && !appListLoading ? (
        <Paper variant="outlined" sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
          <EmptyApps onSideload={() => handleSideload(null)} />
        </Paper>
      ) : (
        <InstalledAppsTable apps={installedApps} />
      )}

      {/* Toolbar below table: Export, Import, Sideload */}
      <Box sx={{ mt: 2 }}>
        <AppsToolbar
          loading={appListLoading && !!ping}
          hasApps={installedApps.length > 0}
          onSideload={handleSideload}
        />
      </Box>

      <ContentDialog open={sideloadOpen} setOpen={setSideloadOpen} title="Sideload App">
        <InstallationStepper app={sideloadDoc} sideload={true} />
      </ContentDialog>
    </Box>
  );
}
