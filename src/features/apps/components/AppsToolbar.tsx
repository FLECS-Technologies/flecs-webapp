import { Stack, Typography, CircularProgress, Tooltip } from '@mui/material';
import { Code } from 'lucide-react';
import Yaml from 'js-yaml';
import Export from '@features/system/components/export/Export';
import Import from '@features/system/components/device/Import';
import FileOpen from '@shared/components/FileOpen';

interface AppsToolbarProps {
  loading: boolean;
  hasApps: boolean;
  onSideload: (doc: any) => void;
}

export default function AppsToolbar({ loading, hasApps, onSideload }: AppsToolbarProps) {
  const handleSideloadConfirm = (text: string) => {
    try {
      const doc = Yaml.load(text);
      onSideload(doc);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 3 }}>
      <Typography variant="h5" fontWeight={700} sx={{ flex: 1 }}>
        {loading ? (
          <Stack direction="row" alignItems="center" spacing={1}>
            <span>Loading Apps</span>
            <CircularProgress size="1rem" />
          </Stack>
        ) : (
          'Installed Apps'
        )}
      </Typography>

      <Tooltip title="Export all apps and data">
        <div>
          <Export disabled={!hasApps} />
        </div>
      </Tooltip>

      <Tooltip title="Import apps from file">
        <div>
          <Import />
        </div>
      </Tooltip>

      <Tooltip title="Sideload your own app">
        <div>
          <FileOpen
            buttonText="Sideload"
            buttonIcon={<Code size={18} />}
            accept=".json"
            onConfirm={handleSideloadConfirm}
          />
        </div>
      </Tooltip>
    </Stack>
  );
}
