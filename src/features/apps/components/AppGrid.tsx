import { Box } from '@mui/material';
import { App } from '@shared/types/app';
import AppCard from './AppCard';

interface AppGridProps {
  apps: App[];
}

export default function AppGrid({ apps }: AppGridProps) {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: '1fr',
          sm: 'repeat(2, 1fr)',
          md: 'repeat(3, 1fr)',
          lg: 'repeat(4, 1fr)',
          xl: 'repeat(5, 1fr)',
        },
        gap: 1.5,
      }}
    >
      {apps.map((app) => (
        <AppCard key={app.appKey.name + app.appKey.version} app={app} />
      ))}
    </Box>
  );
}
