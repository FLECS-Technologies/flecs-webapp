import { Paper, Typography } from '@mui/material';
import ExportList from './export/ExportList';

export default function ExportsCard() {
  return (
    <Paper sx={{ p: 3, borderRadius: 3 }}>
      <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
        Recent Exports
      </Typography>
      <ExportList />
    </Paper>
  );
}
