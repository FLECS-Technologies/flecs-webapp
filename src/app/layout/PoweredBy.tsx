import FLECSLogo from './FLECSLogo';
import { useTenant } from '@app/theme/TenantContext';

export default function PoweredByFLECS({ collapsed }: { collapsed?: boolean }) {
  const { features } = useTenant();
  if (!features.powered_by_flecs) return null;

  if (collapsed) {
    return (
      <div className="flex justify-center px-2 py-2 shrink-0">
        <div
          className="w-8 h-8 rounded-full border border-border flex items-center justify-center opacity-50 hover:opacity-75 transition-opacity cursor-default"
          title="Powered by FLECS"
        >
          <FLECSLogo size={14} />
        </div>
      </div>
    );
  }

  return (
    <div className="px-3 py-2 shrink-0">
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-border opacity-60 hover:opacity-90 transition-opacity cursor-default w-fit">
        <FLECSLogo size={13} />
        <span className="text-[10px] font-medium text-muted tracking-wide whitespace-nowrap">
          powered by FLECS
        </span>
      </div>
    </div>
  );
}
