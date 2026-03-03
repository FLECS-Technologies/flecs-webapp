import { Card, CardContent, Skeleton, Stack, Box } from '@mui/material';

export default function AppCardSkeleton() {
  return (
    <Card variant="outlined" sx={{ borderRadius: 3 }}>
      <CardContent>
        <Stack direction="row" spacing={2} alignItems="center">
          <Skeleton variant="rounded" width={48} height={48} />
          <Box sx={{ flex: 1 }}>
            <Skeleton width="60%" height={24} />
            <Skeleton width="40%" height={16} />
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}
