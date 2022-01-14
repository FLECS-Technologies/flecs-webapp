import React from 'react'
import PropTypes from 'prop-types'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'

const LoadButton = (props) => {
  const { startIcon, text, variant, color, disabled, displayState, loading, label, width } = props

  return (
        <Box sx={{ position: 'relative' }}>
          <Button
            {...props}
            sx={{ width: { width } }}
            data-testid="button"
            aria-label={label}
            startIcon={startIcon}
            variant={variant}
            color={color}
            disabled={disabled}
            style={{ display: displayState }}
          >
            {text}
          </Button>
          {loading && (<CircularProgress data-testid="circularprogress" size={16} sx={{
            color: 'info',
            position: 'absolute',
            top: '50%',
            left: '50%',
            marginTop: '-7px',
            marginLeft: '-7px'
          }}/>)}
        </Box>
  )
}

LoadButton.propTypes = {
  startIcon: PropTypes.any,
  text: PropTypes.string,
  variant: PropTypes.string,
  color: PropTypes.string,
  disabled: PropTypes.bool,
  displayState: PropTypes.string,
  loading: PropTypes.bool,
  label: PropTypes.string,
  width: PropTypes.string
}

export default LoadButton
