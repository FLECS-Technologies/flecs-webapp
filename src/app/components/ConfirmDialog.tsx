const ConfirmDialog = (props: any) => {
  const { title, children, open, setOpen, onConfirm } = props;
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={() => setOpen(false)}>
      <div className="bg-dark-end rounded-2xl p-6 max-w-md w-full shadow-2xl border border-white/10" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-lg font-semibold mb-3" id="confirm-dialog">{title}</h3>
        <div className="text-sm text-gray-300 mb-6">{children}</div>
        <div className="flex justify-end gap-2">
          <button
            className="px-4 py-2 text-sm font-semibold rounded-lg hover:bg-white/10 transition"
            onClick={() => setOpen(false)}
          >
            No
          </button>
          <button
            className="px-4 py-2 text-sm font-semibold rounded-lg bg-brand text-white hover:bg-brand-end transition"
            onClick={() => { setOpen(false); onConfirm(); }}
          >
            Yes
          </button>
        </div>
      </div>
    </div>
  );
};
export default ConfirmDialog;
