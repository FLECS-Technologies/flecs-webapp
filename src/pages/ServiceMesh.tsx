import { useMemo } from 'react';
import { Box, Typography, Button, Paper, Stack } from '@mui/material';
import { Network, ExternalLink, Store } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppList } from '@shared/hooks/app-queries';
import { EditorButton } from '@shared/components/app-actions/editors/EditorButton';
import HelpButton from '@shared/components/help/HelpButton';
import { servicemesh } from '@shared/components/help/helplinks';

export default function ServiceMesh() {
  const { appList } = useAppList();
  const navigate = useNavigate();

  const meshApp = useMemo(() => {
    if (!appList) return null;
    return appList.find((app: any) => app.appKey.name === 'tech.flecs.flunder') ?? null;
  }, [appList]);

  const meshInstance = meshApp?.instances?.[0];
  const hasEditor = meshInstance?.editors?.length > 0;

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Typography variant="overline" color="text.disabled" fontWeight={600}>
            DEVICE
          </Typography>
          <HelpButton url={servicemesh} />
        </Stack>
        <Typography variant="h4" fontWeight={800}>
          Service Mesh
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5 }}>
          Network configuration and monitoring.
        </Typography>
      </Box>

      <Paper sx={{ p: 4, borderRadius: 3, textAlign: 'center' }}>
        <Network size={48} strokeWidth={1.2} style={{ opacity: 0.4, marginBottom: 16 }} />

        {meshApp && hasEditor ? (
          <>
            <Typography variant="h6" gutterBottom>
              Service Mesh is running
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              The service mesh has its own UI. Open it to manage your mesh configuration.
            </Typography>
            <EditorButton editor={meshInstance.editors[0]} index={0} />
          </>
        ) : (
          <>
            <Typography variant="h6" gutterBottom>
              {meshApp ? 'Service Mesh is installed' : 'Service Mesh not installed'}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              {meshApp
                ? 'Start the service mesh app to access its UI.'
                : 'Install the FLECS Service Mesh from the marketplace to connect your apps.'}
            </Typography>
            {!meshApp && (
              <Button
                variant="contained"
                startIcon={<Store size={18} />}
                onClick={() => navigate('/marketplace')}
              >
                Go to Marketplace
              </Button>
            )}
          </>
        )}
      </Paper>
    </Box>
  );
}
