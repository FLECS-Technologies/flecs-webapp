import { Box, Typography, Button, Stack } from '@mui/material';
import { Store, PackagePlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface EmptyAppsProps {
  onSideload?: () => void;
}

export default function EmptyApps({ onSideload }: EmptyAppsProps) {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        py: 10,
        px: 4,
      }}
    >
      <Store size={48} strokeWidth={1.2} style={{ opacity: 0.4, marginBottom: 16 }} />
      <Typography variant="h6" gutterBottom>
        No apps installed
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3, textAlign: 'center' }}>
        Install apps from the marketplace or deploy your own custom Docker app.
      </Typography>
      <Stack direction="row" spacing={2}>
        <Button
          variant="contained"
          startIcon={<Store size={18} />}
          onClick={() => navigate('/marketplace')}
          sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 2 }}
        >
          Browse Marketplace
        </Button>
        {onSideload && (
          <Button
            variant="outlined"
            startIcon={<PackagePlus size={18} />}
            onClick={onSideload}
            sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 2 }}
          >
            Deploy Your Own App
          </Button>
        )}
      </Stack>
    </Box>
  );
}
