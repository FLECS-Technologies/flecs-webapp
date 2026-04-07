import React from 'react';
import { Trash2, Circle, Save } from 'lucide-react';
import TransportProtocolSelector from './TransportProtocolSelector';
import { InstancePortMappingRange, InstancePortMappingSingle, TransportProtocol } from '@generated/core/schemas';

interface SinglePortMappingProps { port: InstancePortMappingSingle; protocol: TransportProtocol; index: number; onChange: (index: number, field: keyof InstancePortMappingSingle | keyof InstancePortMappingRange, value: number | { start?: number; end?: number }) => void; sx?: object; handleDeletePort: (index: number) => void; handleSavePort: (protocol: string, index: number) => void; handleProtocolChange: (index: number, protocol: TransportProtocol) => void; }

const SinglePortMapping: React.FC<SinglePortMappingProps> = ({ port, protocol, index, onChange, handleDeletePort, handleSavePort, handleProtocolChange }) => {
  const [changes, setChanges] = React.useState(false);
  return (
    <div className="flex items-center w-full p-4 mb-2 rounded-xl bg-dark-end border border-white/10 gap-2">
      <span className="inline-flex items-center justify-center w-6 h-6 mr-2"><Circle size={18} /></span>
      <input className="flex-1 px-3 py-2 bg-dark rounded-lg border border-white/10 text-white text-sm focus:outline-none focus:border-brand mr-2" placeholder="Host Port" value={port.host_port} onChange={(e) => { setChanges(true); onChange(index, 'host_port', parseInt(e.target.value, 10) || 0); }} />
      <input className="flex-1 px-3 py-2 bg-dark rounded-lg border border-white/10 text-white text-sm focus:outline-none focus:border-brand mr-2" placeholder="Container Port" value={port.container_port} onChange={(e) => { setChanges(true); onChange(index, 'container_port', parseInt(e.target.value, 10) || 0); }} />
      <TransportProtocolSelector value={protocol} onChange={(p) => { handleProtocolChange(index, p); setChanges(true); }} />
      <button title="Delete Port Mapping" className="p-1.5 rounded-lg hover:bg-white/10 transition" onClick={() => handleDeletePort(index)}><Trash2 size={18} /></button>
      <button title="Save Port Mapping" aria-label="Save Port Mapping" className="p-1.5 rounded-lg hover:bg-white/10 transition disabled:opacity-30" disabled={!changes} onClick={() => { handleSavePort(protocol as TransportProtocol, index); setChanges(false); }}><Save size={18} /></button>
    </div>
  );
};
export default SinglePortMapping;
