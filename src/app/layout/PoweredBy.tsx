import FLECSLogo from './FLECSLogo';
import { useTenant } from '@app/theme/TenantContext';

export default function PoweredByFLECS({ collapsed }: { collapsed?: boolean }) {
  const { features } = useTenant();
  if (!features.powered_by_flecs) return null;

  if (collapsed) {
    return (
      <div className="flex justify-center py-1.5 opacity-30">
        <FLECSLogo size={12} />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5 px-4 py-1.5 opacity-30">
      <FLECSLogo size={12} />
      <span className="text-[9px] text-muted leading-none tracking-wide">powered by FLECS</span>
    </div>
  );
}
