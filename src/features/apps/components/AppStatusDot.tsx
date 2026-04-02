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
    <div
      title={config.label}
      role="status"
      aria-label={config.label}
      className={`rounded-full shrink-0 ${shouldPulse ? 'animate-pulse' : ''}`}
      style={{
        width: size,
        height: size,
        backgroundColor: config.color,
      }}
    />
  );
}
