import React from 'react';
import { TransportProtocol } from '@generated/core/schemas';
import { ArrowLeftRight } from 'lucide-react';

interface AddPortRangeMappingButtonProps { onAdd: (protocol: TransportProtocol) => void; defaultProtocol: TransportProtocol; }

const AddPortRangeMappingButton: React.FC<AddPortRangeMappingButtonProps> = ({ onAdd, defaultProtocol }) => {
  return (
    <button title="Add a range of ports (e.g., 8000-8010:8000-8010)" onClick={() => onAdd(defaultProtocol)} className="px-4 py-2 text-accent rounded-lg font-semibold hover:bg-accent/10 transition inline-flex items-center gap-2">
      <ArrowLeftRight size={18} /> Add Port Range Mapping
    </button>
  );
};
export default AddPortRangeMappingButton;
