import React from 'react';
import { Trash2, Save, ArrowLeftRight } from 'lucide-react';
import TransportProtocolSelector from './TransportProtocolSelector';
import { InstancePortMappingRange, InstancePortMappingSingle, TransportProtocol } from '@generated/core/schemas';

interface PortRangeMappingProps { port: InstancePortMappingRange; protocol: TransportProtocol; index: number; onChange: (index: number, field: keyof InstancePortMappingSingle | keyof InstancePortMappingRange, value: number | { start?: number; end?: number }) => void; sx?: object; handleDeletePort: (index: number) => void; handleSavePort: (protocol: string, index: number) => void; handleProtocolChange: (index: number, protocol: TransportProtocol) => void; }

const PortRangeMapping: React.FC<PortRangeMappingProps> = ({ port, protocol, index, onChange, handleDeletePort, handleSavePort, handleProtocolChange }) => {
  const [changes, setChanges] = React.useState(false);
  return (
    <div className="flex items-center w-full p-4 mb-2 rounded-xl bg-dark-end border border-white/10 gap-2">
      <span className="inline-flex items-center justify-center w-6 h-6 mr-2"><ArrowLeftRight size={18} /></span>
      <input className="flex-1 px-3 py-2 bg-dark rounded-lg border border-white/10 text-white text-sm focus:outline-none focus:border-brand" placeholder="Host Start" value={port.host_ports.start} onChange={(e) => { setChanges(true); onChange(index, 'host_ports', { start: parseInt(e.target.value, 10) || 0 }); }} />
      <input className="flex-1 px-3 py-2 bg-dark rounded-lg border border-white/10 text-white text-sm focus:outline-none focus:border-brand" placeholder="Host End" value={port.host_ports.end} onChange={(e) => { setChanges(true); onChange(index, 'host_ports', { end: parseInt(e.target.value, 10) || 0 }); }} />
      <input className="flex-1 px-3 py-2 bg-dark rounded-lg border border-white/10 text-white text-sm focus:outline-none focus:border-brand" placeholder="Container Start" value={port.container_ports.start} onChange={(e) => onChange(index, 'container_ports', { start: parseInt(e.target.value, 10) || 0 })} />
      <input className="flex-1 px-3 py-2 bg-dark rounded-lg border border-white/10 text-white text-sm focus:outline-none focus:border-brand" placeholder="Container End" value={port.container_ports.end} onChange={(e) => onChange(index, 'container_ports', { end: parseInt(e.target.value, 10) || 0 })} />
      <TransportProtocolSelector value={protocol} onChange={(p) => { handleProtocolChange(index, p); setChanges(true); }} />
      <button title="Delete Port Mapping" className="p-1.5 rounded-lg hover:bg-white/10 transition" onClick={() => handleDeletePort(index)}><Trash2 size={18} /></button>
      <button title="Save Port Mapping" aria-label="Save Port Mapping" className="p-1.5 rounded-lg hover:bg-white/10 transition disabled:opacity-30" disabled={!changes} onClick={() => { handleSavePort(protocol, index); setChanges(false); }}><Save size={18} /></button>
    </div>
  );
};
export default PortRangeMapping;
