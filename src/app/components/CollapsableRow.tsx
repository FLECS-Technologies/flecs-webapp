import { useId, useState, type ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';

interface CollapsableRowProps {
  title: string;
  children: ReactNode;
}

export default function CollapsableRow({ title, children }: CollapsableRowProps) {
  const [open, setOpen] = useState(false);
  const contentId = useId();

  return (
    <div>
      <button
        type="button"
        aria-controls={contentId}
        aria-expanded={open}
        className="group flex w-full items-center justify-between gap-4 px-4 py-3 text-left text-sm font-medium text-text-primary transition hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand/30"
        onClick={() => setOpen((current) => !current)}
      >
        <span>{title}</span>
        <ChevronDown
          size={16}
          aria-hidden="true"
          className={`shrink-0 text-muted transition-transform duration-150 group-hover:text-text-primary motion-reduce:transition-none ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && (
        <div id={contentId} className="border-t border-border bg-surface-raised">
          {children}
        </div>
      )}
    </div>
  );
}
