import { Box, Skeleton } from '@mui/material';

/**
 * Full-page skeleton used as the Suspense fallback for lazy-loaded routes.
 * Mimics a typical page layout: a header bar + content area.
 */
export default function PageSkeleton() {
  return (
    <Box sx={{ p: 3, width: '100%' }}>
      <Skeleton variant="text" width="30%" height={40} sx={{ mb: 2 }} />
      <Skeleton variant="rectangular" width="100%" height={200} sx={{ borderRadius: 1 }} />
    </Box>
  );
}
