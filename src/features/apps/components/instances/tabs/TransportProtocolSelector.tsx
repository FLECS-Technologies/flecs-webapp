import React from 'react';
import { TransportProtocol } from '@generated/core/schemas';

interface TransportProtocolSelectorProps {
  value: TransportProtocol;
  onChange: (protocol: TransportProtocol) => void;
  label?: string;
  sx?: object;
}

const TransportProtocolSelector: React.FC<TransportProtocolSelectorProps> = ({
  value,
  onChange,
}) => {
  return (
    <select
      aria-label="Transport protocol"
      value={value}
      onChange={(e) => onChange(e.target.value as TransportProtocol)}
      className="w-full rounded-lg border border-border bg-surface px-2 py-2 text-sm text-text-primary outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/15"
    >
      <option value={TransportProtocol.tcp}>TCP</option>
      <option value={TransportProtocol.udp}>UDP</option>
      <option value={TransportProtocol.sctp}>SCTP</option>
    </select>
  );
};

export default TransportProtocolSelector;
