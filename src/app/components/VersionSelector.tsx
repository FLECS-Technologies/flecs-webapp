import { ChevronDown } from 'lucide-react';
import type { AppVersion } from '@features/apps/types';

interface VersionSelectorProps {
  availableVersions: AppVersion[];
  selectedVersion: AppVersion | undefined;
  setSelectedVersion: (v: AppVersion) => void;
  currentVersion?: string;
  label?: string;
}

export function VersionSelector({
  availableVersions,
  selectedVersion,
  setSelectedVersion,
  currentVersion,
  label = 'Version',
}: VersionSelectorProps) {
  if (!availableVersions.length) return null;

  return (
    <div className="relative">
      <select
        aria-label={label}
        value={selectedVersion?.version ?? ''}
        onChange={(event) => {
          const version = availableVersions.find((item) => item.version === event.target.value);
          if (version) setSelectedVersion(version);
        }}
        className="w-full cursor-pointer appearance-none rounded-lg border border-border bg-surface py-2.5 pl-3 pr-9 text-sm font-medium text-text-primary outline-none transition hover:border-border-strong focus:border-brand focus:ring-2 focus:ring-brand/15"
      >
        {availableVersions.map((version, index) => {
          const detail =
            version.version === currentVersion
              ? 'Current'
              : index === 0
                ? 'Latest'
                : version.installed
                  ? 'Downloaded'
                  : undefined;
          return (
            <option key={version.version} value={version.version}>
              {version.version}
              {detail ? ` (${detail})` : ''}
            </option>
          );
        })}
      </select>
      <ChevronDown
        aria-hidden="true"
        size={15}
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted"
      />
    </div>
  );
}

export default VersionSelector;
