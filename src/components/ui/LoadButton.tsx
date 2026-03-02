import Button from '@mui/material/Button';
import { Loading } from './Loading';

const LoadButton = (props) => {
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

  return (
    <Loading loading={loading}>
      <Button
        {...buttonProps}
        data-testid="button"
        aria-label={label}
        startIcon={startIcon}
        variant={variant}
        color={color}
        disabled={disabled}
        style={{ display: displaystate }}
      >
        {text}
      </Button>
    </Loading>
  );
};

export default LoadButton;
