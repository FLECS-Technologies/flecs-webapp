import { Monitor, Cpu, Server } from 'lucide-react';

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center gap-4 py-2">
      <span className="text-muted w-6">{icon}</span>
      <span className="text-sm text-muted min-w-[120px]">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}

interface SystemInfoCardProps { hostname: string; distro?: string; kernel?: string; arch?: string; loading?: boolean; }

export default function SystemInfoCard({ hostname, distro, kernel, arch, loading }: SystemInfoCardProps) {
  if (loading) return (
    <div className="rounded-xl bg-dark-end p-6 border border-white/10">
      <div className="animate-pulse bg-white/10 rounded h-7 w-40 mb-4" />
      <div className="animate-pulse bg-white/10 rounded h-6 mb-2" />
      <div className="animate-pulse bg-white/10 rounded h-6 mb-2" />
      <div className="animate-pulse bg-white/10 rounded h-6" />
    </div>
  );
  return (
    <div className="rounded-xl bg-dark-end p-6 border border-white/10">
      <h6 className="text-base font-semibold mb-4">Device</h6>
      <InfoRow icon={<Monitor size={18} />} label="Hostname" value={hostname} />
      {distro && <InfoRow icon={<Server size={18} />} label="Platform" value={`${arch ?? ''} / ${distro}`} />}
      {kernel && <InfoRow icon={<Cpu size={18} />} label="Kernel" value={kernel} />}
    </div>
  );
}
