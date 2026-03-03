import { Box, Typography, Stack } from '@mui/material';
import type {} from '@mui/material/themeCssVarsAugmentation';
import { useSystemInfo } from '@shared/hooks/system-queries';
import { SystemInfoCard, VersionCard, LicenseCard, QuickActions, ExportsCard } from '../features/system';

export default function System() {
  const { data: systemInfo } = useSystemInfo();

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="overline" color="text.disabled" fontWeight={600}>
          DEVICE
        </Typography>
        <Typography variant="h4" fontWeight={800}>
          System
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5 }}>
          Device management and configuration.
        </Typography>
      </Box>

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
            distro={systemInfo?.distro?.name}
            kernel={systemInfo?.kernel?.version}
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
