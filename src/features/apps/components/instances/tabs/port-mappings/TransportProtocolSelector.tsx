import React from 'react';
import { TransportProtocol } from '@generated/core/schemas';

interface TransportProtocolSelectorProps {
  value: TransportProtocol;
  onChange: (protocol: TransportProtocol) => void;
  label?: string;
  sx?: object;
}

const TransportProtocolSelector: React.FC<TransportProtocolSelectorProps> = ({ value, onChange }) => {
  return (
    <select
      aria-label="Transport Protocol"
      value={value}
      onChange={(e) => onChange(e.target.value as TransportProtocol)}
      className="px-3 py-2 bg-dark rounded-lg border border-white/10 text-white text-sm focus:outline-none focus:border-brand"
    >
      <option value={TransportProtocol.tcp}>TCP</option>
      <option value={TransportProtocol.udp}>UDP</option>
    </select>
  );
};

export default TransportProtocolSelector;
