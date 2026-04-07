import React from 'react';
import { TransportProtocol } from '@generated/core/schemas';
import { Circle } from 'lucide-react';

interface AddSinglePortMappingButtonProps { onAdd: (protocol: TransportProtocol) => void; defaultProtocol: TransportProtocol; }

const AddSinglePortMappingButton: React.FC<AddSinglePortMappingButtonProps> = ({ onAdd, defaultProtocol }) => {
  return (
    <button title="Add a one-to-one port mapping" onClick={() => onAdd(defaultProtocol)} className="px-4 py-2 text-accent rounded-lg font-semibold hover:bg-accent/10 transition inline-flex items-center gap-2">
      <Circle size={18} /> Add Port Mapping
    </button>
  );
};
export default AddSinglePortMappingButton;
