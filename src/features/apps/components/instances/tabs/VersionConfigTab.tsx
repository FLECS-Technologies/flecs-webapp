import { useMemo, useState } from 'react';
import VersionSelector from '@app/components/VersionSelector';
import UpdateButton from '@features/apps/components/actions/UpdateButton';
import type { AppVersion, EnrichedApp } from '@features/apps/types';

interface VersionConfigTabProps {
  app: EnrichedApp;
  currentVersion: string;
  versions: AppVersion[];
}

const VersionConfigTab = ({ app, currentVersion, versions }: VersionConfigTabProps) => {
  const availableVersions = useMemo(() => {
    const options = versions.some(({ version }) => version === currentVersion)
      ? versions
      : [...versions, { version: currentVersion, installed: true }];
    const compare = new Intl.Collator('en', { numeric: true, sensitivity: 'base' }).compare;
    return [...options].sort((a, b) => compare(b.version, a.version));
  }, [currentVersion, versions]);
  const [selectedVersion, setSelectedVersion] = useState<AppVersion>(
    () =>
      availableVersions.find(({ version }) => version === currentVersion) ??
      availableVersions[0] ?? { version: currentVersion, installed: true },
  );
  const currentIndex = availableVersions.findIndex(({ version }) => version === currentVersion);
  const selectedIndex = availableVersions.findIndex(
    ({ version }) => version === selectedVersion.version,
  );
  const operation =
    selectedVersion.version === currentVersion
      ? undefined
      : selectedIndex < currentIndex
        ? 'update'
        : 'downgrade';

  return (
    <div>
      <div className="overflow-hidden rounded-2xl border border-border bg-surface-raised">
        <div className="flex min-h-16 items-center gap-6 px-4 py-3.5">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-text-primary">Current version</p>
            <p className="mt-0.5 text-xs text-muted">Installed on this instance</p>
          </div>
          <span className="shrink-0 font-mono text-sm font-semibold text-text-primary">
            {currentVersion}
          </span>
        </div>
        <div className="flex min-h-16 items-center gap-6 border-t border-border px-4 py-3.5">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-text-primary">Change version</p>
            <p className="mt-0.5 text-xs text-muted">Choose a newer or older release</p>
          </div>
          <div className="w-64 shrink-0">
            <VersionSelector
              availableVersions={availableVersions}
              selectedVersion={selectedVersion}
              setSelectedVersion={setSelectedVersion}
              currentVersion={currentVersion}
              label="Target version"
            />
          </div>
        </div>
      </div>

      {operation && (
        <div className="mt-5 flex items-center justify-between gap-6">
          <p className="text-sm text-text-secondary">
            {operation === 'update'
              ? 'Move this app and its instances to a newer version.'
              : 'This moves this app and its instances to an older version.'}
          </p>
          <UpdateButton
            app={app}
            to={selectedVersion}
            fromVersion={currentVersion}
            operation={operation}
            showSelectedVersion
          />
        </div>
      )}
    </div>
  );
};

export default VersionConfigTab;
