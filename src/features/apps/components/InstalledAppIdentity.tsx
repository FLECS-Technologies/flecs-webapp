import type { ReactNode } from 'react';
import { Package } from 'lucide-react';
import type { AppInstance } from '@generated/core/schemas';
import type { EnrichedApp } from '@features/apps/types';
import AppStatusDot from './AppStatusDot';

interface InstalledAppIdentityProps {
  app: EnrichedApp;
  instance?: AppInstance;
  instanceDisplayName?: string;
  statusLabel?: string;
  showStatus?: boolean;
  isInstalling?: boolean;
  badge?: ReactNode;
}

export default function InstalledAppIdentity({
  app,
  instance,
  instanceDisplayName,
  statusLabel,
  showStatus = true,
  isInstalling = false,
  badge,
}: InstalledAppIdentityProps) {
  const isRunning = instance?.status === 'running';

  return (
    <>
      <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-surface-hover text-muted">
        {app.avatar ? (
          <img src={app.avatar} alt={app.title} className="h-full w-full object-cover" />
        ) : (
          <Package size={22} />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-sm truncate">
            <span className="font-bold">{app.title}</span>
            {instanceDisplayName && (
              <span className="font-normal text-text-primary"> ({instanceDisplayName})</span>
            )}
          </span>
          {badge}
        </div>
        <div className="flex items-center gap-1 text-xs text-muted">
          {app.author && <span className="truncate">{app.author}</span>}
          {app.author && <span>-</span>}
          <span className="truncate font-mono">{app.appKey.version}</span>
        </div>
        {showStatus && statusLabel && (
          <div className="mt-0.5 flex items-center gap-1.5">
            {isInstalling ? (
              <div className="h-2 w-2 animate-pulse rounded-full bg-brand" />
            ) : (
              <AppStatusDot status={instance?.status ?? 'stopped'} size={8} />
            )}
            <span
              className={`text-xs font-medium ${
                isInstalling ? 'text-brand' : isRunning ? 'text-success' : 'text-muted'
              }`}
            >
              {statusLabel}
            </span>
          </div>
        )}
      </div>
    </>
  );
}
