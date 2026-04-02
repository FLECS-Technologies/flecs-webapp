import { X, Copy } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function ActionSnackbar(props: any) {
  const { text, errorText, open, setOpen, alertSeverity } = props;
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (open) {
      setVisible(true);
      const timer = setTimeout(() => {
        setOpen(false);
        setVisible(false);
      }, 3000);
      return () => clearTimeout(timer);
    } else {
      setVisible(false);
    }
  }, [open]);

  function copyErrorToClipboard() {
    if (errorText) {
      navigator.clipboard.writeText(errorText);
    } else {
      navigator.clipboard.writeText(
        "No further error information available. Please check your browser's console for further information",
      );
    }
  }

  if (!visible) return null;

  const severityStyles: Record<string, string> = {
    success: 'bg-success/10 text-success border-success/30',
    error: 'bg-error/10 text-error border-error/30',
    warning: 'bg-warning/10 text-warning border-warning/30',
    info: 'bg-accent/10 text-accent border-accent/30',
  };

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50" data-testid="snackbar">
      <div
        data-testid="alert"
        className={`flex items-center gap-2 px-4 py-3 rounded-lg border ${severityStyles[alertSeverity] || severityStyles.info}`}
      >
        <span className="flex-1 text-sm">{text}</span>
        {alertSeverity === 'error' && (
          <button
            data-testid="copy-button"
            className="p-1 rounded hover:bg-white/10 transition"
            onClick={copyErrorToClipboard}
          >
            <Copy size={16} />
          </button>
        )}
        <button
          data-testid="close-button"
          className="p-1 rounded hover:bg-white/10 transition"
          onClick={() => { setOpen(false); setVisible(false); }}
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
