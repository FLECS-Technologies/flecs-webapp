import React, { Fragment, useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

export default function CollapsableRow(props: any) {
  const { title, children } = props;
  const [open, setOpen] = useState(false);
  return (
    <Fragment>
      <tr>
        <td data-testid="expand-cell" className="border-b-0 py-2 px-4">
          <button
            data-testid="expand-button"
            aria-label="expand row"
            className="p-1 rounded-lg hover:bg-white/10 transition mr-2 inline-flex"
            onClick={() => setOpen(!open)}
          >
            {open ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
          {title}
        </td>
      </tr>
      {open && (
        <tr>
          <td data-testid="instances-cell" className="p-0" colSpan={6}>
            {children}
          </td>
        </tr>
      )}
    </Fragment>
  );
}
