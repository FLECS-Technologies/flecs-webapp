import React from 'react';
import { Check, X } from 'lucide-react';
import { toast } from 'sonner';
import webappSbomSpdxHref from '@assets/sbom.json?url';
import { getErrorMessage } from '@app/api/fetch-error';
import { getSystemSbom } from '@generated/core/system/system';
import type { SbomFormat } from '@generated/core/schemas';

const coreFiles: Record<SbomFormat, string> = {
  spdx: 'core.sbom.spdx.json',
  cyclonedx: 'core.sbom.cyclonedx.json',
};

const webappFiles: Partial<Record<SbomFormat, { filename: string; href: string }>> = {
  spdx: { filename: 'webapp.sbom.spdx.json', href: webappSbomSpdxHref },
};

function downloadJson(data: unknown, filename: string) {
  const body = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
  const url = URL.createObjectURL(new Blob([body], { type: 'application/json' }));
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

function Option({
  checked,
  title,
  subtitle,
  onClick,
}: {
  checked: boolean;
  title: string;
  subtitle: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      className={`relative cursor-pointer rounded-lg border p-3 text-left transition hover:border-brand hover:bg-brand/5 ${
        checked ? 'border-brand bg-brand/3 ring-1 ring-brand' : 'border-border'
      }`}
      onClick={onClick}
    >
      {checked && (
        <span className="absolute right-2.5 top-2.5 grid h-4 w-4 place-items-center rounded-full bg-brand text-white">
          <Check size={10} strokeWidth={3} />
        </span>
      )}
      <span className="block text-[0.82rem] font-medium">{title}</span>
      <span className="mt-0.5 block font-mono text-[0.68rem] text-muted">{subtitle}</span>
    </button>
  );
}

export default function SbomDialog({
  open,
  coreVersion,
  appTitle,
  onClose,
}: {
  open: boolean;
  coreVersion?: string;
  appTitle: string;
  onClose: () => void;
}) {
  const [core, setCore] = React.useState(true);
  const [webapp, setWebapp] = React.useState(true);
  const [spdx, setSpdx] = React.useState(true);
  const [cycloneDx, setCycloneDx] = React.useState(true);
  const [exporting, setExporting] = React.useState(false);
  const dialogRef = React.useRef<HTMLDivElement>(null);
  const fileCount = (Number(core) + Number(webapp)) * (Number(spdx) + Number(cycloneDx));

  React.useEffect(() => {
    if (!open) return;
    dialogRef.current?.focus();
    const closeOnEscape = (event: KeyboardEvent) => event.key === 'Escape' && onClose();
    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, [open, onClose]);

  if (!open) return null;

  const exportSbom = async () => {
    if (!fileCount) return;
    setExporting(true);
    try {
      const formats = [spdx && 'spdx', cycloneDx && 'cyclonedx'].filter(
        (format): format is SbomFormat => Boolean(format),
      );

      for (const format of formats) {
        if (core) {
          const response = await getSystemSbom({ format });
          if (response.status !== 200) throw new Error('Core SBOM is not available.');
          downloadJson(response.data, coreFiles[format]);
        }
        if (webapp) {
          const file = webappFiles[format];
          if (!file) throw new Error('Web app CycloneDX SBOM is not available yet.');
          const anchor = document.createElement('a');
          anchor.href = file.href;
          anchor.download = file.filename;
          document.body.appendChild(anchor);
          anchor.click();
          anchor.remove();
        }
      }
      toast.success(`${fileCount === 1 ? 'SBOM export' : `${fileCount} SBOM exports`} started`);
      onClose();
    } catch (error) {
      toast.error('SBOM export failed', { description: getErrorMessage(error) });
    } finally {
      setExporting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[70] grid place-items-center bg-black/35 p-4"
      role="presentation"
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
    >
      <div
        ref={dialogRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="sbom-dialog-title"
        className="w-full max-w-[480px] rounded-[14px] border border-border bg-surface-raised shadow-2xl outline-none"
      >
        <div className="flex items-start justify-between gap-4 px-5 pb-1 pt-5">
          <div>
            <h2 id="sbom-dialog-title" className="text-[0.95rem] font-semibold">
              Export software bill of materials
            </h2>
            <p className="mt-1 text-xs text-muted">
              Choose what you need for {appTitle}{' '}
              <span className="font-mono">{coreVersion ?? 'version unavailable'}</span>
            </p>
          </div>
          <button
            type="button"
            className="rounded-md p-1 text-muted hover:bg-surface-hover hover:text-text-primary"
            onClick={onClose}
            aria-label="Close dialog"
          >
            <X size={16} />
          </button>
        </div>
        <div className="space-y-5 px-5 py-4">
          <fieldset>
            <legend className="mb-2 text-xs font-semibold">What should be included?</legend>
            <div className="grid grid-cols-2 gap-2.5">
              <Option
                checked={core}
                title="Core"
                subtitle={coreVersion ?? 'Unavailable'}
                onClick={() => setCore(!core)}
              />
              <Option
                checked={webapp}
                title="Web app"
                subtitle={import.meta.env.VITE_APP_VERSION ?? 'Current'}
                onClick={() => setWebapp(!webapp)}
              />
            </div>
          </fieldset>
          <fieldset>
            <legend className="mb-2 text-xs font-semibold">Which formats do you need?</legend>
            <div className="grid grid-cols-2 gap-2.5">
              <Option
                checked={spdx}
                title="SPDX"
                subtitle="Common for license compliance"
                onClick={() => setSpdx(!spdx)}
              />
              <Option
                checked={cycloneDx}
                title="CycloneDX"
                subtitle="Common for security tooling"
                onClick={() => setCycloneDx(!cycloneDx)}
              />
            </div>
          </fieldset>
          <p className="text-xs text-muted" role="status">
            {fileCount
              ? `${fileCount} ${fileCount === 1 ? 'file' : 'files'} will be downloaded.`
              : 'Select at least one component and one format.'}
          </p>
        </div>
        <div className="flex justify-end gap-2 px-5 pb-5 pt-1">
          <button
            type="button"
            className="cursor-pointer rounded-lg border border-border px-4 py-2 text-xs font-medium transition hover:border-brand hover:bg-brand/5 hover:text-brand"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="button"
            className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-brand px-4 py-2 text-xs font-semibold text-white transition hover:bg-brand-end disabled:cursor-not-allowed disabled:opacity-45"
            disabled={!fileCount || exporting}
            onClick={exportSbom}
          >
            {exporting && (
              <span className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
            )}
            Export {fileCount ? `${fileCount} ${fileCount === 1 ? 'file' : 'files'}` : ''}
          </button>
        </div>
      </div>
    </div>
  );
}
