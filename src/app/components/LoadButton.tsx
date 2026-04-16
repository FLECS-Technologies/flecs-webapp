import React from 'react';
import { Loading } from './Loading';

interface LoadButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  startIcon?: React.ReactNode;
  text?: React.ReactNode;
  variant?: string;
  color?: string;
  displaystate?: string;
  loading?: boolean;
  label?: string;
  width?: string | number;
}

const LoadButton: React.FC<LoadButtonProps> = (props) => {
  const {
    startIcon,
    text,
    variant,
    color,
    disabled,
    displaystate,
    loading,
    label,
    width,
    ...buttonProps
  } = props;

  const base = 'px-4 py-2 rounded-lg font-semibold transition text-sm inline-flex items-center gap-2';
  const colorMap: Record<string, string> = {
    error: 'border border-error text-error hover:bg-error/10',
    success: 'border border-success text-success hover:bg-success/10',
    primary: 'bg-brand text-white hover:bg-brand-end',
  };
  const variantMap: Record<string, string> = {
    contained: 'bg-brand text-white hover:bg-brand-end',
    outlined: 'border border-brand text-brand hover:bg-brand/10',
  };

  const classes = `${base} ${(color && colorMap[color]) || (variant && variantMap[variant]) || variantMap.outlined}`;

  return (
    <Loading loading={loading ?? false}>
      <button
        {...buttonProps}
        data-testid="button"
        aria-label={label}
        disabled={disabled}
        className={classes}
        style={{ display: displaystate }}
      >
        {startIcon}
        {text}
      </button>
    </Loading>
  );
};

export default LoadButton;
