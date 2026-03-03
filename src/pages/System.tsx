import { Box, Typography, Stack } from '@mui/material';
import { useSystemInfo } from '@features/system/hooks';
import { SystemInfoCard, VersionCard, LicenseCard, QuickActions, ExportsCard } from '../features/system';

export default function System() {
  const { data: systemInfo } = useSystemInfo();

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} sx={{ mb: 3 }}>
        System
      </Typography>

      <Stack spacing={3}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
            gap: 3,
          }}
        >
          <SystemInfoCard
            hostname={window.location.hostname}
            distro={systemInfo?.distro}
            kernel={systemInfo?.kernel}
            arch={systemInfo?.arch}
          />
          <LicenseCard />
        </Box>

        <VersionCard />
        <QuickActions />
        <ExportsCard />
      </Stack>
    </Box>
  );
}
