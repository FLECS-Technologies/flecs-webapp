import React from 'react';
import { Trash2, Save, ChevronsRight, Server, Container } from 'lucide-react';
import TransportProtocolSelector from './TransportProtocolSelector';
import {
  InstancePortMappingRange,
  InstancePortMappingSingle,
  TransportProtocol,
} from '@generated/core/schemas';

interface PortRangeMappingProps {
  port: InstancePortMappingRange;
  protocol: TransportProtocol;
  index: number;
  onChange: (
    index: number,
    field: keyof InstancePortMappingSingle | keyof InstancePortMappingRange,
    value: number | { start?: number; end?: number },
  ) => void;
  sx?: object;
  handleDeletePort: (index: number) => void;
  handleSavePort: (protocol: string, index: number) => void;
  handleProtocolChange: (index: number, protocol: TransportProtocol) => void;
}

const PortRangeMapping: React.FC<PortRangeMappingProps> = ({
  port,
  protocol,
  index,
  onChange,
  handleDeletePort,
  handleSavePort,
  handleProtocolChange,
}) => {
  const [changes, setChanges] = React.useState(false);
  return (
    <div className="flex items-center w-full p-4 mb-2 rounded-xl bg-surface-raised border border-border gap-2">
      <span className="inline-flex items-center justify-center w-6 h-6">
        <ChevronsRight size={18} />
      </span>
      <div className="flex items-center gap-1 w-46">
        <span title="Host" className="inline-flex items-center text-muted">
          <Server size={16} />
        </span>
        <input
          className="w-18 px-3 py-2 bg-surface rounded-lg border border-border text-text-primary text-sm focus:outline-none focus:border-brand"
          placeholder="Start"
          aria-label="Host range start"
          value={port.host_ports.start}
          onChange={(e) => {
            setChanges(true);
            onChange(index, 'host_ports', { start: parseInt(e.target.value, 10) || 0 });
          }}
        />
        <span className="text-muted">-</span>
        <input
          className="w-18 px-3 py-2 bg-surface rounded-lg border border-border text-text-primary text-sm focus:outline-none focus:border-brand"
          placeholder="End"
          aria-label="Host range end"
          value={port.host_ports.end}
          onChange={(e) => {
            setChanges(true);
            onChange(index, 'host_ports', { end: parseInt(e.target.value, 10) || 0 });
          }}
        />
      </div>
      <div className="flex items-center gap-1 w-46">
        <span title="Container" className="inline-flex items-center text-muted">
          <Container size={16} />
        </span>
        <input
          className="w-18 px-3 py-2 bg-surface rounded-lg border border-border text-text-primary text-sm focus:outline-none focus:border-brand"
          placeholder="Start"
          aria-label="Container range start"
          value={port.container_ports.start}
          onChange={(e) =>
            onChange(index, 'container_ports', { start: parseInt(e.target.value, 10) || 0 })
          }
        />
        <span className="text-muted">-</span>
        <input
          className="w-18 px-3 py-2 bg-surface rounded-lg border border-border text-text-primary text-sm focus:outline-none focus:border-brand"
          placeholder="End"
          aria-label="Container range end"
          value={port.container_ports.end}
          onChange={(e) =>
            onChange(index, 'container_ports', { end: parseInt(e.target.value, 10) || 0 })
          }
        />
      </div>
      <TransportProtocolSelector
        value={protocol}
        onChange={(p) => {
          handleProtocolChange(index, p);
          setChanges(true);
        }}
      />
      <button
        title="Delete Port Mapping"
        className="p-1.5 rounded-lg hover:bg-surface-hover transition ml-auto"
        onClick={() => handleDeletePort(index)}
      >
        <Trash2 size={18} />
      </button>
      <button
        title="Save Port Mapping"
        aria-label="Save Port Mapping"
        className="p-1.5 rounded-lg hover:bg-surface-hover transition disabled:opacity-30"
        disabled={!changes}
        onClick={() => {
          handleSavePort(protocol, index);
          setChanges(false);
        }}
      >
        <Save size={18} />
      </button>
    </div>
  );
};
export default PortRangeMapping;
