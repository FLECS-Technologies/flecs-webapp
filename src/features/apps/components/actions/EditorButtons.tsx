import React, { useState, useRef, useEffect } from 'react';
import type { AppInstance } from '@generated/core/schemas';
import { EditorButton, createUrl } from './EditorButton';
import { ChevronDown, ExternalLink } from 'lucide-react';

interface OpenButtonsProps {
  instance: AppInstance;
}

const EditorDropdown: React.FC<OpenButtonsProps> = ({ instance }: OpenButtonsProps) => {
  const [open, setOpen] = useState(false);
  const anchorRef = useRef<HTMLDivElement>(null);
  const [selectedIndex, setSelectedIndex] = useState(1);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (anchorRef.current && !anchorRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // The parent EditorButtons only renders this component when `instance.editors`
  // has at least 2 entries; the guard narrows the type for TS in this scope.
  const editors = instance.editors ?? [];
  if (editors.length === 0) return null;

  return (
    <div className="relative inline-flex" ref={anchorRef}>
      <div className="inline-flex rounded-lg overflow-hidden">
        <button
          title={`Open ${editors[selectedIndex].name || 'editor'} in a new tab`}
          onClick={() => window.open(createUrl(editors[selectedIndex].url))}
          disabled={instance.status !== 'running'}
          className="px-4 py-2 bg-brand text-white font-semibold hover:bg-brand-end transition inline-flex items-center gap-2 disabled:opacity-50"
          aria-label="open-editor"
        >
          <ExternalLink size={16} />
          {editors[selectedIndex].name || editors[selectedIndex].port}
        </button>
        <button
          title="Select editor"
          onClick={() => setOpen(!open)}
          disabled={instance.status !== 'running'}
          className="px-2 py-2 bg-brand text-white hover:bg-brand-end transition border-l border-white/20 disabled:opacity-50"
          aria-label="select-editor"
        >
          <ChevronDown size={18} />
        </button>
      </div>
      {open && (
        <div className="absolute top-full left-0 mt-1 w-full rounded-lg bg-dark-end border border-white/10 shadow-xl z-50 py-1">
          {editors.map((editor, index) => (
            <button
              key={editor.port}
              onClick={() => { setSelectedIndex(index); setOpen(false); }}
              className={`w-full px-3 py-2 text-sm text-left hover:bg-white/5 transition ${index === selectedIndex ? 'bg-white/5' : ''}`}
            >
              {editor.name || 'Editor at port ' + editor.port}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export const EditorButtons: React.FC<OpenButtonsProps> = ({ instance }: OpenButtonsProps) => {
  return (
    <React.Fragment>
      {instance?.editors && instance.editors.length === 1 && (
        <EditorButton key={0} editor={instance.editors[0]} index={0} />
      )}
      {instance?.editors && instance.editors.length > 1 && <EditorDropdown instance={instance} />}
    </React.Fragment>
  );
};
