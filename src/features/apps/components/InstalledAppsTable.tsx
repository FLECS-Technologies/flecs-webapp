import type { EnrichedApp } from '@features/apps/types';
import InstalledAppRow from './InstalledAppRow';

interface InstalledAppsTableProps {
  apps: EnrichedApp[];
}

export default function InstalledAppsTable({ apps }: InstalledAppsTableProps) {
  return (
    <div className="rounded-xl border border-white/10 overflow-hidden">
      {apps.map((app, i) => (
        <div key={app.appKey?.name + app.appKey?.version}>
          {i > 0 && <hr className="border-white/10" />}
          <InstalledAppRow app={app} />
        </div>
      ))}
    </div>
  );
}
