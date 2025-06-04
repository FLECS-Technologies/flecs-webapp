import React from 'react'
import PropTypes from 'prop-types'
import Button from '@mui/material/Button'
import { Loading } from './Loading'

const LoadButton = (props) => {
  const { startIcon, text, variant, color, disabled, displaystate, loading, label, width, ...buttonProps } = props

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
  )
}

LoadButton.propTypes = {
  startIcon: PropTypes.any,
  text: PropTypes.string,
  variant: PropTypes.string,
  color: PropTypes.string,
  disabled: PropTypes.bool,
  displaystate: PropTypes.string,
  loading: PropTypes.bool,
  label: PropTypes.string,
  width: PropTypes.string
}

export default LoadButton
