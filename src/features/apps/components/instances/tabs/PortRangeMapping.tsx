import { Container, Server, Trash2 } from 'lucide-react';
import type {
  InstancePortMappingRange,
  InstancePortMappingSingle,
  TransportProtocol,
} from '@generated/core/schemas';
import TransportProtocolSelector from './TransportProtocolSelector';

interface PortRangeMappingProps {
  port: InstancePortMappingRange;
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

const RangeInputs = ({
  label,
  icon,
  start,
  end,
  onStart,
  onEnd,
}: {
  label: string;
  icon: React.ReactNode;
  start: number;
  end: number;
  onStart: (value: number) => void;
  onEnd: (value: number) => void;
}) => (
  <fieldset className="min-w-0">
    <legend className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-muted">
      {icon} {label}
    </legend>
    <div className="grid grid-cols-[1fr_12px_1fr] items-center gap-1">
      <input
        type="number"
        min={1}
        max={65535}
        aria-label={`${label} start`}
        value={start || ''}
        onChange={(event) => onStart(numericValue(event.target.value))}
        className="min-w-0 rounded-lg border border-border bg-surface px-2 py-2 text-sm text-text-primary outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/15"
      />
      <span className="text-center text-muted">-</span>
      <input
        type="number"
        min={1}
        max={65535}
        aria-label={`${label} end`}
        value={end || ''}
        onChange={(event) => onEnd(numericValue(event.target.value))}
        className="min-w-0 rounded-lg border border-border bg-surface px-2 py-2 text-sm text-text-primary outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/15"
      />
    </div>
  </fieldset>
);

const PortRangeMapping = ({
  port,
  protocol,
  index,
  onChange,
  onDelete,
  onProtocolChange,
}: PortRangeMappingProps) => (
  <div className="grid grid-cols-[1fr_1fr_92px_36px] items-end gap-3 rounded-xl border border-border bg-surface-raised p-3">
    <RangeInputs
      label="Host range"
      icon={<Server size={14} />}
      start={port.host_ports.start}
      end={port.host_ports.end}
      onStart={(value) => onChange(index, 'host_ports', { start: value })}
      onEnd={(value) => onChange(index, 'host_ports', { end: value })}
    />
    <RangeInputs
      label="Container range"
      icon={<Container size={14} />}
      start={port.container_ports.start}
      end={port.container_ports.end}
      onStart={(value) => onChange(index, 'container_ports', { start: value })}
      onEnd={(value) => onChange(index, 'container_ports', { end: value })}
    />
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

export default PortRangeMapping;
