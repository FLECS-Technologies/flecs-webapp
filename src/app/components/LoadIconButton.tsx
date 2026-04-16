import React from 'react';

interface LoadIconButtonProps {
  icon: React.ReactNode;
  variant?: string;
  color?: string;
  disabled?: boolean;
  onClick: () => void;
  displaystate?: string;
  loading?: boolean;
  label?: string;
}

const LoadIconButton: React.FC<LoadIconButtonProps> = ({ icon, disabled, onClick, displaystate, loading, label }) => {
  return (
    <div className="relative">
      <button
        aria-label={label}
        data-testid="icon-button"
        disabled={disabled}
        onClick={() => onClick()}
        className="p-1.5 rounded-lg hover:bg-white/10 transition"
        style={{ display: displaystate }}
      >
        {icon}
        {loading && (
          <div
            data-testid="circularprogress"
            className="absolute inset-0 flex items-center justify-center"
          >
            <div className="animate-spin h-7 w-7 border-2 border-accent border-t-transparent rounded-full" />
          </div>
        )}
      </button>
    </div>
  );
};

export default LoadIconButton;
