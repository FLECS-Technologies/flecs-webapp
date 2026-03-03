import { Paper, Typography, Stack, Skeleton } from '@mui/material';
import { Monitor, Cpu, Server } from 'lucide-react';

interface InfoRowProps {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}

function InfoRow({ icon, label, value }: InfoRowProps) {
  return (
    <Stack direction="row" spacing={2} alignItems="center" sx={{ py: 1 }}>
      <Stack sx={{ color: 'text.secondary', minWidth: 24 }}>{icon}</Stack>
      <Typography variant="body2" color="text.secondary" sx={{ minWidth: 120 }}>
        {label}
      </Typography>
      <Typography variant="body2" fontWeight={500}>
        {value}
      </Typography>
    </Stack>
  );
}

interface SystemInfoCardProps {
  hostname: string;
  distro?: string;
  kernel?: string;
  arch?: string;
  loading?: boolean;
}

export default function SystemInfoCard({ hostname, distro, kernel, arch, loading }: SystemInfoCardProps) {
  if (loading) {
    return (
      <Paper sx={{ p: 3, borderRadius: 3 }}>
        <Skeleton width={160} height={28} sx={{ mb: 2 }} />
        <Skeleton height={24} />
        <Skeleton height={24} />
        <Skeleton height={24} />
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 3, borderRadius: 3 }}>
      <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
        Device
      </Typography>
      <InfoRow icon={<Monitor size={18} />} label="Hostname" value={hostname} />
      {distro && <InfoRow icon={<Server size={18} />} label="Platform" value={`${arch ?? ''} / ${distro}`} />}
      {kernel && <InfoRow icon={<Cpu size={18} />} label="Kernel" value={kernel} />}
    </Paper>
  );
}
