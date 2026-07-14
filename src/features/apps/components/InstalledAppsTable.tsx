import type { EnrichedApp } from '@features/apps/types';
import InstalledAppRow from './InstalledAppRow';
import type { AppInstance } from '@generated/core/schemas';

interface InstalledAppsTableProps {
  apps: EnrichedApp[];
}

type InstalledAppListRow =
  | { kind: 'app'; app: EnrichedApp; instance?: undefined }
  | { kind: 'instance'; app: EnrichedApp; instance: AppInstance };

function createInstalledAppRows(apps: EnrichedApp[]): InstalledAppListRow[] {
  return apps.flatMap((app) => {
    const instances = app.instances ?? [];
    if (instances.length === 0) return [{ kind: 'app', app }];
    return instances.map((instance) => ({ kind: 'instance', app, instance }));
  });
}

function getRowKey(row: InstalledAppListRow) {
  const appKey = `${row.app.appKey.name}:${row.app.appKey.version}`;
  return row.kind === 'instance' ? `${appKey}:${row.instance.instanceId}` : `${appKey}:app`;
}

export default function InstalledAppsTable({ apps }: InstalledAppsTableProps) {
  const rows = createInstalledAppRows(apps);

  return (
    <div className="rounded-xl border border-border overflow-hidden">
      {rows.map((row, i) => (
        <div key={getRowKey(row)}>
          {i > 0 && <hr className="border-border" />}
          <InstalledAppRow app={row.app} instance={row.instance} />
        </div>
      ))}
    </div>
  );
}
