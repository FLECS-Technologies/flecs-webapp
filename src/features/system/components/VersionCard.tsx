import Version from './Version';
import { useTenant } from '@app/theme/TenantContext';

export default function VersionCard() {
  const { app_title } = useTenant();
  return (
    <div className="rounded-xl bg-surface-raised p-6 border border-border">
      <h6 className="text-base font-semibold mb-4">{app_title} Version</h6>
      <Version />
    </div>
  );
}
