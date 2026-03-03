import { Box } from '@mui/material';

interface MarketplaceGridProps {
  children: React.ReactNode;
}

export default function MarketplaceGrid({ children }: MarketplaceGridProps) {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: '1fr',
          sm: 'repeat(2, 1fr)',
          md: 'repeat(3, 1fr)',
          xl: 'repeat(4, 1fr)',
        },
        gap: 3,
      }}
    >
      {children}
    </Box>
  );
}
