import { useEffect, useId, useRef } from 'react';

/**
 * Confirm dialog using the native <dialog> element.
 * Focus trapping, Escape to close, and backdrop behavior are built in.
 */
const ConfirmDialog = ({
  title,
  children,
  open,
  setOpen,
  onConfirm,
  confirmLabel,
  cancelLabel,
  confirmDestructive,
}: {
  title: string;
  children: React.ReactNode;
  open: boolean;
  setOpen: (open: boolean) => void;
  onConfirm: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmDestructive?: boolean;
}) => {
  const ref = useRef<HTMLDialogElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();

  useEffect(() => {
    if (open) {
      ref.current?.showModal();
      cancelRef.current?.focus();
    } else ref.current?.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onClose={() => setOpen(false)}
      className="backdrop:bg-black/60 bg-transparent p-0 m-auto max-w-md w-full open:flex open:items-center open:justify-center"
    >
      <div className="bg-surface-raised rounded-2xl p-6 w-full shadow-2xl border border-border mx-4">
        <h3 id={titleId} className="text-lg font-semibold text-text-primary mb-2">
          {title}
        </h3>
        <div className="text-sm text-text-secondary mb-6">{children}</div>
        <div className="flex justify-end gap-3">
          <button
            ref={cancelRef}
            className="px-4 py-2 text-sm font-semibold rounded-lg text-text-primary hover:bg-surface-hover transition cursor-pointer"
            onClick={() => setOpen(false)}
          >
            {cancelLabel || 'Cancel'}
          </button>
          <button
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition cursor-pointer ${confirmDestructive ? 'bg-error text-white hover:bg-error/80' : 'bg-brand text-white hover:bg-brand-end'}`}
            onClick={() => {
              setOpen(false);
              onConfirm();
            }}
          >
            {confirmLabel || 'Confirm'}
          </button>
        </div>
      </div>
    </dialog>
  );
};
export default ConfirmDialog;
