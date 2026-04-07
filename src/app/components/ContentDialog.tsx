import { createPortal } from 'react-dom';

function ContentDialog(props: any) {
  const { title, open, setOpen, actions } = props;
  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={() => setOpen(false)}>
      <div className="bg-dark-end rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-white/10" onClick={(e) => e.stopPropagation()}>
        <div className="px-6 py-4 border-b border-white/10">
          <h3 className="text-lg font-semibold">{title}</h3>
        </div>
        <div className="flex-1 overflow-auto px-6 py-4 border-b border-white/10">
          {props.children ?? <p className="text-sm text-muted">No content to display.</p>}
        </div>
        <div className="px-6 py-3 flex justify-end gap-2">
          {actions ?? <button className="px-4 py-2 border border-brand text-brand rounded-lg font-semibold hover:bg-brand/10 transition text-sm" onClick={() => setOpen(false)}>Close</button>}
        </div>
      </div>
    </div>,
    document.body
  );
}
export default ContentDialog;
