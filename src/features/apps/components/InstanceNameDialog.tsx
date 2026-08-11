import { useState } from 'react';
import { AlertCircle, PencilLine, Package } from 'lucide-react';
import ContentDialog from '@app/components/ContentDialog';
import type { EnrichedApp } from '@features/apps/types';

interface InstanceNameDialogProps {
  app: EnrichedApp;
  open: boolean;
  setOpen: (open: boolean) => void;
  busy?: boolean;
  error?: string;
  initialName?: string;
  mode?: 'create' | 'rename';
  onSubmit: (instanceName?: string) => boolean | void | Promise<boolean | void>;
}

export default function InstanceNameDialog({ open, ...props }: InstanceNameDialogProps) {
  if (!open) return null;
  return <OpenInstanceNameDialog {...props} />;
}

type OpenInstanceNameDialogProps = Omit<InstanceNameDialogProps, 'open'>;

function OpenInstanceNameDialog({
  app,
  setOpen,
  busy,
  error,
  initialName = '',
  mode = 'create',
  onSubmit,
}: OpenInstanceNameDialogProps) {
  const [instanceName, setInstanceName] = useState(initialName);
  const isRename = mode === 'rename';
  const trimmedName = instanceName.trim();
  const currentName = initialName.trim();
  const previewName = trimmedName || (isRename ? currentName : 'Instance abcd1234');
  const unchanged = isRename && trimmedName === currentName;
  const disabled = busy || (isRename && (!trimmedName || unchanged));
  const actionLabel = isRename
    ? busy
      ? 'Saving...'
      : 'Save name'
    : trimmedName
      ? `Create "${trimmedName}"`
      : 'Skip name';

  const submit = async () => {
    if (disabled) return;
    const shouldClose = await onSubmit(trimmedName);
    if (shouldClose === false) return;
    setOpen(false);
    setInstanceName(initialName);
  };

  return (
    <ContentDialog
      title={isRename ? 'Edit name' : 'Name this instance'}
      open
      setOpen={setOpen}
      panelClassName="bg-surface-raised rounded-2xl max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl border border-border overflow-hidden"
      actions={
        <>
          <button
            className="px-4 py-2 text-muted rounded-lg font-semibold hover:bg-surface-hover hover:text-text-primary transition text-sm"
            onClick={() => setOpen(false)}
            disabled={busy}
          >
            Cancel
          </button>
          <button
            className="max-w-64 px-4 py-2 border border-brand bg-brand text-white rounded-lg font-semibold hover:bg-brand/90 transition text-sm disabled:opacity-40 disabled:cursor-not-allowed truncate"
            onClick={submit}
            disabled={disabled}
            title={actionLabel}
          >
            {actionLabel}
          </button>
        </>
      }
    >
      <div className="space-y-5">
        <p className="text-sm text-muted">
          {isRename
            ? 'Choose a clear name so you can recognize this copy of the app.'
            : 'A name helps you tell this copy apart when you run the same app more than once.'}
        </p>

        <div>
          <div className="flex items-baseline justify-between gap-3">
            <label
              htmlFor={`instance-name-${app.appKey.name}-${app.appKey.version}`}
              className="text-sm font-semibold text-text-primary"
            >
              {isRename ? 'Name' : 'Instance name'}
            </label>
          </div>
          <input
            id={`instance-name-${app.appKey.name}-${app.appKey.version}`}
            value={instanceName}
            onChange={(event) => setInstanceName(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                void submit();
              }
            }}
            placeholder="main-controller"
            autoComplete="off"
            spellCheck={false}
            onFocus={(event) => {
              if (isRename) event.currentTarget.select();
            }}
            aria-invalid={Boolean(error)}
            className="mt-2 h-11 w-full rounded-lg border border-border bg-surface px-3 text-sm font-mono outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20 aria-invalid:border-error aria-invalid:focus:ring-error/20"
          />
        </div>

        {!isRename && (
          <div className="flex items-center gap-2 text-xs text-muted">
            <PencilLine size={14} className="shrink-0" />
            <span>You can change this name later from the installed app list.</span>
          </div>
        )}

        {error && (
          <div
            role="alert"
            className="flex items-start gap-2 rounded-xl border border-error/30 bg-error/10 px-3 py-2.5 text-sm text-error"
          >
            <AlertCircle size={16} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="rounded-xl border border-border bg-surface/40 p-3">
          <div className="mb-2 text-[0.65rem] font-semibold uppercase tracking-wider text-muted">
            Appears in your list as
          </div>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-surface-hover flex items-center justify-center text-muted border border-border overflow-hidden shrink-0">
              {app.avatar ? (
                <img src={app.avatar} alt="" className="w-full h-full object-cover" />
              ) : (
                <Package size={17} className="text-brand" />
              )}
            </div>
            <div className="min-w-0">
              <div
                className={`text-sm truncate ${trimmedName ? 'text-text-primary' : 'text-muted'}`}
              >
                <span className="font-bold">{app.title}</span>
                <span className="font-normal"> ({previewName})</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-muted">
                {app.author && <span className="truncate">{app.author}</span>}
                {app.author && <span>-</span>}
                <span className="font-mono truncate">v{app.appKey?.version}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ContentDialog>
  );
}
