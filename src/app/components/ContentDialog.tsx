function ContentDialog(props: any) {
  const { title, open, setOpen, actions } = props;

  const handleClose = () => {
    setOpen(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={handleClose}>
      <div className="bg-dark-end rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-white/10" onClick={(e) => e.stopPropagation()}>
        <div className="px-6 py-4 border-b border-white/10">
          <h3 data-testid="content-dialog-title" className="text-lg font-semibold">{title}</h3>
        </div>
        <div className="flex-1 overflow-auto px-6 py-4 border-b border-white/10">
          {props.children == null ? (
            <p className="text-sm text-muted">Hm, looks like I was not given any content to display.</p>
          ) : (
            props.children
          )}
        </div>
        <div className="px-6 py-3 flex justify-end gap-2">
          {actions == null ? (
            <button
              data-testid="close-button"
              className="px-4 py-2 border border-brand text-brand rounded-lg font-semibold hover:bg-brand/10 transition text-sm"
              onClick={handleClose}
            >
              Close
            </button>
          ) : (
            actions
          )}
        </div>
      </div>
    </div>
  );
}
export default ContentDialog;
