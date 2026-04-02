import { HelpCircle } from 'lucide-react';
import React from 'react';

interface HelpButtonProps {
  url: string;
  label?: string;
}

const HelpButton: React.FC<HelpButtonProps> = ({ url, label = 'Help', ...props }) => {
  const handleClick = () => {
    window.open(url);
  };

  return (
    <button
      title={label}
      onClick={handleClick}
      className="p-1.5 rounded-lg hover:bg-white/10 transition"
      {...props}
    >
      <HelpCircle size={20} />
    </button>
  );
};

export default HelpButton;
