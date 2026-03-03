import { Box, Tooltip } from '@mui/material';
import { brand } from '@app/theme/tokens';

const statusConfig: Record<string, { color: string; label: string }> = {
  running: { color: brand.success, label: 'Running' },
  stopped: { color: brand.muted, label: 'Stopped' },
  error: { color: brand.error, label: 'Error' },
  installing: { color: brand.warning, label: 'Installing' },
  uninstalling: { color: brand.warning, label: 'Uninstalling' },
};

interface AppStatusDotProps {
  status: string;
  size?: number;
  pulse?: boolean;
}

export default function AppStatusDot({ status, size = 10, pulse = false }: AppStatusDotProps) {
  const config = statusConfig[status] ?? { color: brand.muted, label: status };
  const shouldPulse = pulse || status === 'running';

  return (
    <Tooltip title={config.label} arrow>
      <Box
        role="status"
        aria-label={config.label}
        sx={{
          width: size,
          height: size,
          borderRadius: '50%',
          bgcolor: config.color,
          flexShrink: 0,
          ...(shouldPulse && {
            boxShadow: `0 0 0 0 ${config.color}`,
            animation: 'pulse 2s ease-in-out infinite',
            '@keyframes pulse': {
              '0%, 100%': { boxShadow: `0 0 0 0 ${config.color}40` },
              '50%': { boxShadow: `0 0 0 4px ${config.color}00` },
            },
          }),
        }}
      />
    </Tooltip>
  );
}
