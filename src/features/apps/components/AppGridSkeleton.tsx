import { Box } from '@mui/material';
import AppCardSkeleton from './AppCardSkeleton';

interface AppGridSkeletonProps {
  count?: number;
}

export default function AppGridSkeleton({ count = 8 }: AppGridSkeletonProps) {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: '1fr',
          sm: 'repeat(2, 1fr)',
          md: 'repeat(3, 1fr)',
          lg: 'repeat(4, 1fr)',
        },
        gap: 2.5,
      }}
    >
      {Array.from({ length: count }).map((_, i) => (
        <AppCardSkeleton key={i} />
      ))}
    </Box>
  );
}
