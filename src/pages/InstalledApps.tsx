import { useState } from 'react';
import { Box, Paper, Typography } from '@mui/material';
import { useAppList } from '@shared/hooks/app-queries';
import { useSystemPing } from '@shared/hooks/system-queries';
import { AppGrid, AppGridSkeleton, AppsToolbar, EmptyApps } from '../features/apps';
import ContentDialog from '@shared/components/ContentDialog';
import InstallationStepper from '@shared/components/installation/InstallationStepper';
import { App } from '@shared/types/app';

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
      <AppsToolbar
        loading={appListLoading && ping}
        hasApps={installedApps.length > 0}
        onSideload={handleSideload}
      />

      {appListLoading && ping && installedApps.length === 0 ? (
        <AppGridSkeleton />
      ) : installedApps.length === 0 && !appListLoading ? (
        <Paper sx={{ borderRadius: 3 }}>
          <EmptyApps onSideload={() => handleSideload(null)} />
        </Paper>
      ) : (
        <AppGrid apps={installedApps} />
      )}

      <ContentDialog open={sideloadOpen} setOpen={setSideloadOpen} title="Sideload App">
        <InstallationStepper app={sideloadDoc} sideload={true} />
      </ContentDialog>
    </Box>
  );
}
