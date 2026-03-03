import { Divider, Typography, Stack } from '@mui/material';
import { App } from '@features/apps/types';
import InstanceRow from './InstanceRow';

interface InstanceListProps {
  instances: any[];
  app: App;
  onCreateInstance: (start: boolean) => void;
  creating: boolean;
}

export default function InstanceList({ instances, app }: InstanceListProps) {
  if (instances.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary" sx={{ py: 1 }}>
        No instances running
      </Typography>
    );
  }

  return (
    <Stack spacing={0} divider={<Divider />}>
      {instances.map((instance) => (
        <InstanceRow
          key={instance.instanceId}
          instance={instance}
          showEditors={instances.length > 1}
        />
      ))}
    </Stack>
  );
}
