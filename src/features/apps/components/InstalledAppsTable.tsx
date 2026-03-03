import { Divider, Paper, Stack } from '@mui/material';
import { App } from '@shared/types/app';
import InstalledAppRow from './InstalledAppRow';

interface InstalledAppsTableProps {
  apps: App[];
}

export default function InstalledAppsTable({ apps }: InstalledAppsTableProps) {
  return (
    <Paper
      variant="outlined"
      sx={{
        borderRadius: 3,
        border: '1px solid',
        borderColor: 'divider',
        overflow: 'hidden',
      }}
    >
      <Stack divider={<Divider />}>
        {apps.map((app) => (
          <InstalledAppRow key={app.appKey?.name + app.appKey?.version} app={app} />
        ))}
      </Stack>
    </Paper>
  );
}
