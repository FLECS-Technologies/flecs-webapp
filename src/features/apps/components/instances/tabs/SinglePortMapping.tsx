import React from 'react';
import { Trash2, ArrowRight, Save, Server, Container } from 'lucide-react';
import TransportProtocolSelector from './TransportProtocolSelector';
import {
  InstancePortMappingRange,
  InstancePortMappingSingle,
  TransportProtocol,
} from '@generated/core/schemas';

interface SinglePortMappingProps {
  port: InstancePortMappingSingle;
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

const SinglePortMapping: React.FC<SinglePortMappingProps> = ({
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
        <ArrowRight size={18} />
      </span>
      <div className="flex items-center gap-1 w-46">
        <span title="Host" className="inline-flex items-center text-muted">
          <Server size={16} />
        </span>
        <input
          className="flex-1 min-w-0 px-3 py-2 bg-surface rounded-lg border border-border text-text-primary text-sm focus:outline-none focus:border-brand"
          placeholder="Port"
          aria-label="Host port"
          value={port.host_port}
          onChange={(e) => {
            setChanges(true);
            onChange(index, 'host_port', parseInt(e.target.value, 10) || 0);
          }}
        />
      </div>
      <div className="flex items-center gap-1 w-46">
        <span title="Container" className="inline-flex items-center text-muted">
          <Container size={16} />
        </span>
        <input
          className="flex-1 min-w-0 px-3 py-2 bg-surface rounded-lg border border-border text-text-primary text-sm focus:outline-none focus:border-brand"
          placeholder="Port"
          aria-label="Container port"
          value={port.container_port}
          onChange={(e) => {
            setChanges(true);
            onChange(index, 'container_port', parseInt(e.target.value, 10) || 0);
          }}
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
          handleSavePort(protocol as TransportProtocol, index);
          setChanges(false);
        }}
      >
        <Save size={18} />
      </button>
    </div>
  );
};
export default SinglePortMapping;
