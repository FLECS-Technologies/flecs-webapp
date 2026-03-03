import { Paper, Typography, Stack, Tooltip } from '@mui/material';
import { Download, Upload, FileText } from 'lucide-react';
import Export from './export/Export';
import Import from './device/Import';
import { Link } from 'react-router-dom';
import { Button } from '@mui/material';

export default function QuickActions() {
  return (
    <Paper sx={{ p: 3, borderRadius: 3 }}>
      <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
        Quick Actions
      </Typography>
      <Stack direction="row" spacing={2} flexWrap="wrap">
        <Tooltip title="Export all apps and data from this device">
          <div>
            <Export />
          </div>
        </Tooltip>
        <Tooltip title="Import apps from a backup file">
          <div>
            <Import />
          </div>
        </Tooltip>
        <Button
          component={Link}
          to="/open-source"
          variant="outlined"
          size="small"
          startIcon={<FileText size={16} />}
        >
          Open Source
        </Button>
      </Stack>
    </Paper>
  );
}
