import { Paper, Typography } from '@mui/material';
import LicenseInfo from './device/license/LicenseInfo';
import DeviceActivation from '@shared/components/device/DeviceActivation';

export default function LicenseCard() {
  return (
    <Paper sx={{ p: 3, borderRadius: 3 }}>
      <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
        License
      </Typography>
      <LicenseInfo />
      <DeviceActivation variant="line" />
    </Paper>
  );
}
