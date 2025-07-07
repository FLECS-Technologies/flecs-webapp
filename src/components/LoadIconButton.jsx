import React from 'react';
import PropTypes from 'prop-types';
import { Box } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import CircularProgress from '@mui/material/CircularProgress';

const LoadIconButton = (props) => {
  const { icon, variant, color, disabled, onClick, displaystate, loading, label } = props;

  return (
    <Box sx={{ position: 'relative' }}>
      <IconButton
        aria-label={label}
        data-testid="icon-button"
        variant={variant}
        color={color}
        disabled={disabled}
        onClick={() => onClick(props)}
        style={{ display: displaystate }}
      >
        {icon}
        {loading && (
          <CircularProgress
            data-testid="circularprogress"
            size={30}
            sx={{
              color: 'info',
              position: 'absolute',
            }}
          />
        )}
      </IconButton>
    </Box>
  );
};

LoadIconButton.propTypes = {
  icon: PropTypes.any,
  variant: PropTypes.string,
  color: PropTypes.string,
  disabled: PropTypes.bool,
  onClick: PropTypes.func,
  displaystate: PropTypes.string,
  loading: PropTypes.bool,
  label: PropTypes.string,
};

export default LoadIconButton;
