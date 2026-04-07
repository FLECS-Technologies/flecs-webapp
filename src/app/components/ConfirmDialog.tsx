import { useEffect, useRef } from 'react';

/**
 * Confirm dialog — uses native <dialog> element.
 * Focus trapping, ESC to close, backdrop — all built-in. Zero portal hacking.
 */
const ConfirmDialog = ({ title, children, open, setOpen, onConfirm, confirmLabel, confirmDestructive }: {
  title: string;
  children: React.ReactNode;
  open: boolean;
  setOpen: (open: boolean) => void;
  onConfirm: () => void;
  confirmLabel?: string;
  confirmDestructive?: boolean;
}) => {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (open) ref.current?.showModal();
    else ref.current?.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onClose={() => setOpen(false)}
      onClick={(e) => { if (e.target === ref.current) setOpen(false); }}
      className="backdrop:bg-black/60 bg-transparent p-0 m-auto max-w-md w-full open:flex open:items-center open:justify-center"
    >
      <div className="bg-surface-raised rounded-2xl p-6 w-full shadow-2xl border border-border mx-4">
        <h3 className="text-lg font-semibold text-text-primary mb-2">{title}</h3>
        <div className="text-sm text-text-secondary mb-6">{children}</div>
        <div className="flex justify-end gap-3">
          <button
            className="px-4 py-2 text-sm font-semibold rounded-lg text-text-primary hover:bg-surface-hover transition cursor-pointer"
            onClick={() => setOpen(false)}
          >
            Cancel
          </button>
          <button
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition cursor-pointer ${confirmDestructive ? 'bg-error text-white hover:bg-error/80' : 'bg-brand text-white hover:bg-brand-end'}`}
            onClick={() => { setOpen(false); onConfirm(); }}
            autoFocus
          >
            {confirmLabel || 'Confirm'}
          </button>
        </div>
      </div>
    </dialog>
  );
};
export default ConfirmDialog;
