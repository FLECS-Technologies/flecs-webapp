import { useEffect, useId, useRef } from 'react';

interface ContentDialogProps {
  title: string;
  open: boolean;
  setOpen: (open: boolean) => void;
  actions?: React.ReactNode;
  children?: React.ReactNode;
  panelClassName?: string;
}

type OpenContentDialogProps = Omit<ContentDialogProps, 'open'>;

function OpenContentDialog({
  title,
  setOpen,
  actions,
  children,
  panelClassName,
}: OpenContentDialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    ref.current?.showModal();
  }, []);

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onClose={() => setOpen(false)}
      className="m-auto w-[min(896px,94vw)] max-w-none overflow-visible bg-transparent p-0 text-text-primary backdrop:bg-black/60"
    >
      <div
        className={`mx-auto ${
          panelClassName ??
          'bg-surface-raised rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-border'
        }`}
      >
        <div className="border-b border-border px-6 py-4">
          <h3 id={titleId} className="text-lg font-semibold">
            {title}
          </h3>
        </div>
        <div className="flex-1 overflow-auto border-b border-border px-6 py-4">
          {children ?? <p className="text-sm text-muted">No content to display.</p>}
        </div>
        <div className="flex justify-end gap-2 px-6 py-3">
          {actions ?? (
            <button
              type="button"
              className="cursor-pointer rounded-lg border border-brand px-4 py-2 text-sm font-semibold text-brand transition hover:bg-brand/10"
              onClick={() => setOpen(false)}
            >
              Close
            </button>
          )}
        </div>
      </div>
    </dialog>
  );
}

function ContentDialog(props: ContentDialogProps) {
  if (!props.open) return null;
  return <OpenContentDialog {...props} />;
}

export default ContentDialog;
