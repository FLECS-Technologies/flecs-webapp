import { Paper, Typography } from '@mui/material';
import Version from './device/Version';

export default function VersionCard() {
  return (
    <Paper sx={{ p: 3, borderRadius: 3 }}>
      <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
        FLECS Version
      </Typography>
      <Version />
    </Paper>
  );
}
