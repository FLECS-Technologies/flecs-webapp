

const statusConfig: Record<string, { color: string; label: string }> = {
  running: { color: 'var(--color-success)', label: 'Running' },
  stopped: { color: 'var(--color-muted)', label: 'Stopped' },
  error: { color: 'var(--color-error)', label: 'Error' },
  installing: { color: 'var(--color-warning)', label: 'Installing' },
  uninstalling: { color: 'var(--color-warning)', label: 'Uninstalling' },
};

interface AppStatusDotProps {
  status: string;
  size?: number;
  pulse?: boolean;
}

export default function AppStatusDot({ status, size = 10, pulse = false }: AppStatusDotProps) {
  const config = statusConfig[status] ?? { color: 'var(--color-muted)', label: status };
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
