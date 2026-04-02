const LoadIconButton = (props: any) => {
  const { icon, variant, color, disabled, onClick, displaystate, loading, label } = props;

  return (
    <div className="relative">
      <button
        aria-label={label}
        data-testid="icon-button"
        disabled={disabled}
        onClick={() => onClick(props)}
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
