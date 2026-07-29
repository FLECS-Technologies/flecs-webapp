import { ArrowRight, Container, Server, Trash2 } from 'lucide-react';
import type {
  InstancePortMappingRange,
  InstancePortMappingSingle,
  TransportProtocol,
} from '@generated/core/schemas';
import TransportProtocolSelector from './TransportProtocolSelector';

interface SinglePortMappingProps {
  port: InstancePortMappingSingle;
  protocol: TransportProtocol;
  index: number;
  onChange: (
    index: number,
    field: keyof InstancePortMappingSingle | keyof InstancePortMappingRange,
    value: number | { start?: number; end?: number },
  ) => void;
  onDelete: (index: number) => void;
  onProtocolChange: (index: number, protocol: TransportProtocol) => void;
}

const numericValue = (value: string) => (value === '' ? 0 : Number(value));

const SinglePortMapping = ({
  port,
  protocol,
  index,
  onChange,
  onDelete,
  onProtocolChange,
}: SinglePortMappingProps) => (
  <div className="grid grid-cols-[1fr_24px_1fr_92px_36px] items-end gap-2 rounded-xl border border-border bg-surface-raised p-3">
    <label className="min-w-0">
      <span className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-muted">
        <Server size={14} /> Host port
      </span>
      <input
        type="number"
        min={1}
        max={65535}
        aria-label="Host port"
        value={port.host_port || ''}
        onChange={(event) => onChange(index, 'host_port', numericValue(event.target.value))}
        className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/15"
      />
    </label>
    <ArrowRight size={16} className="mb-2.5 text-muted" aria-hidden="true" />
    <label className="min-w-0">
      <span className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-muted">
        <Container size={14} /> Container port
      </span>
      <input
        type="number"
        min={1}
        max={65535}
        aria-label="Container port"
        value={port.container_port || ''}
        onChange={(event) => onChange(index, 'container_port', numericValue(event.target.value))}
        className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/15"
      />
    </label>
    <div>
      <span className="mb-1.5 block text-xs font-medium text-muted">Protocol</span>
      <TransportProtocolSelector
        value={protocol}
        onChange={(value) => onProtocolChange(index, value)}
      />
    </div>
    <button
      type="button"
      title="Delete port mapping"
      aria-label="Delete port mapping"
      onClick={() => onDelete(index)}
      className="mb-0.5 inline-flex h-9 w-9 items-center justify-center rounded-lg text-muted transition hover:bg-error/10 hover:text-error focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
    >
      <Trash2 size={16} />
    </button>
  </div>
);

export default SinglePortMapping;
