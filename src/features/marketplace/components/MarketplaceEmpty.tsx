import { Box, Typography } from '@mui/material';
import { CloudOff } from 'lucide-react';

interface MarketplaceEmptyProps {
  error?: boolean;
}

export default function MarketplaceEmpty({ error }: MarketplaceEmptyProps) {
  return (
    <Box sx={{ py: 10, textAlign: 'center' }}>
      <CloudOff size={48} strokeWidth={1.2} style={{ opacity: 0.4, marginBottom: 16 }} />
      <Typography variant="h6" gutterBottom>
        {error ? 'Failed to load marketplace' : 'No apps found'}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {error
          ? 'We could not reach the marketplace. Please try again later.'
          : 'Try adjusting your search or filters.'}
      </Typography>
    </Box>
  );
}
