import { useState, useRef, useEffect } from 'react';
import { Sparkles, ChevronDown } from 'lucide-react';
import type { AppVersion } from '@features/apps/types';

interface VersionSelectorProps {
  availableVersions: AppVersion[];
  selectedVersion: AppVersion | undefined;
  setSelectedVersion: (v: AppVersion) => void;
}

export function VersionSelector({ availableVersions, selectedVersion, setSelectedVersion }: VersionSelectorProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const hasUpdate = availableVersions.length > 0 && !availableVersions[0]?.installed;

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  if (!availableVersions.length) return null;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-3 py-2.5 bg-surface rounded-lg border border-border text-text-primary text-sm hover:border-border-strong transition cursor-pointer"
      >
        <span>{selectedVersion?.version || 'Select version'}</span>
        <div className="flex items-center gap-1.5">
          {selectedVersion?.installed && <span className="text-[11px] text-muted px-1.5 py-0.5 rounded bg-surface-hover">installed</span>}
          {hasUpdate && <Sparkles size={13} className="text-brand" />}
          <ChevronDown size={15} className={`text-muted transition-transform ${open ? 'rotate-180' : ''}`} />
        </div>
      </button>
      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-lg bg-surface-raised border border-border shadow-xl max-h-60 overflow-auto">
          {availableVersions.map((v) => (
            <button
              key={v.version}
              onClick={() => { setSelectedVersion(v); setOpen(false); }}
              className={`w-full flex items-center justify-between px-3 py-2 text-sm transition cursor-pointer ${v.version === selectedVersion?.version ? 'bg-surface-hover text-text-primary' : 'text-text-secondary hover:bg-surface-hover hover:text-text-primary'}`}
            >
              <span>{v.version}</span>
              {v.installed && <span className="text-[11px] text-muted">installed</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default VersionSelector;
