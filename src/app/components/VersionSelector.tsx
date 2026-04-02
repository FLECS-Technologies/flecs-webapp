import React, { useState, useRef, useEffect } from 'react';
import { ExternalLink, Sparkles, ChevronDown } from 'lucide-react';
const getLatestVersion = (versions: string[]) => versions?.[0];
type Version = string;

interface VersionSelectorProps {
  availableVersions: Version[];
  setSelectedVersion: (version: Version) => void;
  selectedVersion: Version | undefined;
}

export const VersionSelector: React.FC<VersionSelectorProps> = ({
  availableVersions,
  setSelectedVersion,
  selectedVersion,
}) => {
  const newVersionAvailable =
    !getLatestVersion(availableVersions)?.installed &&
    availableVersions?.filter((version) => version?.installed).length > 0;

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const onReleaseNoteButtonClick = () => {
    if (selectedVersion?.release_notes) {
      window.open(selectedVersion.release_notes);
    }
  };

  const onBreakingChangesButtonClick = () => {
    if (selectedVersion?.breaking_changes) {
      window.open(selectedVersion.breaking_changes);
    }
  };

  return (
    <div className="my-2">
      {availableVersions?.length === 1 && availableVersions[0]?.version && (
        <p className="text-sm text-muted mb-1">Version {availableVersions[0].version}</p>
      )}
      {availableVersions?.length > 1 && (
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="w-full flex items-center justify-between px-3 py-2 bg-dark rounded-lg border border-white/10 text-white text-sm focus:outline-none focus:border-brand"
          >
            <span>{selectedVersion?.version || 'Select version'}</span>
            <div className="flex items-center gap-1">
              {selectedVersion?.installed && <span className="text-xs text-muted">installed</span>}
              {newVersionAvailable && <Sparkles size={14} className="text-brand" />}
              <ChevronDown size={16} />
            </div>
          </button>
          {dropdownOpen && (
            <div className="absolute z-50 mt-1 w-full rounded-lg bg-dark-end border border-white/10 shadow-xl max-h-60 overflow-auto">
              {availableVersions.map((option) => (
                <button
                  key={option.version}
                  onClick={() => {
                    setSelectedVersion(findVersionByProperty(availableVersions, option.version));
                    setDropdownOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-white/5 transition ${option.version === selectedVersion?.version ? 'bg-white/5' : ''}`}
                >
                  <span>{option.version}</span>
                  {option.installed && <span className="text-xs text-muted">installed</span>}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
      <div className="flex gap-2 mt-1">
        {selectedVersion?.release_notes && (
          <button className="text-xs text-brand hover:underline inline-flex items-center gap-1" onClick={onReleaseNoteButtonClick}>
            <ExternalLink size={12} /> Release Notes
          </button>
        )}
        {selectedVersion?.breaking_changes && (
          <button className="text-xs text-brand hover:underline inline-flex items-center gap-1" onClick={onBreakingChangesButtonClick}>
            <ExternalLink size={12} /> Breaking Changes
          </button>
        )}
      </div>
    </div>
  );
};

export default VersionSelector;
