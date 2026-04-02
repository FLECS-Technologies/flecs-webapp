import { useGetSystemInfo } from '@generated/core/system/system';
import SystemInfoCard from '@features/system/components/SystemInfoCard';
import VersionCard from '@features/system/components/VersionCard';
import LicenseCard from '@features/system/components/LicenseCard';
import QuickActions from '@features/system/components/QuickActions';
import ExportsCard from '@features/system/components/ExportsCard';

export default function System() {
  const { data: infoResponse } = useGetSystemInfo({ query: { staleTime: 60_000 } });
  const systemInfo = infoResponse?.data;

  return (
    <div>
      <div className="mb-3">
        <span className="text-xs uppercase tracking-wider font-semibold text-muted">DEVICE</span>
        <h4 className="text-2xl font-extrabold">System</h4>
        <p className="text-base text-muted mt-1">Device management and configuration.</p>
      </div>

      <div className="flex flex-col gap-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <SystemInfoCard
            hostname={window.location.hostname}
            distro={systemInfo?.distro?.name}
            kernel={systemInfo?.kernel?.version}
            arch={systemInfo?.arch}
          />
          <LicenseCard />
        </div>

        <VersionCard />
        <QuickActions />
        <ExportsCard />
      </div>
    </div>
  );
}
