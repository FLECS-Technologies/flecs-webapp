import { Loading } from './Loading';

const LoadButton = (props: any) => {
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

  const classes = `${base} ${colorMap[color] || variantMap[variant] || variantMap.outlined}`;

  return (
    <Loading loading={loading}>
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
