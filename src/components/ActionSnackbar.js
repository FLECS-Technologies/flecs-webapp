import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { Snackbar, Alert, IconButton } from '@mui/material'
import { Close, ContentCopy } from '@mui/icons-material'

export default function ActionSnackbar (props) {
  const { text, errorText, open, setOpen, alertSeverity } = props
  const [displayCopyState] = useState(alertSeverity !== 'error' ? 'none' : 'block')

  function copyErrorToClipboard () {
    if (errorText) {
      navigator.clipboard.writeText(errorText)
    } else {
      navigator.clipboard.writeText('No further error information available. Please check your browser\'s console for further information')
    }
  }

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return
    }

    setOpen(false)
  }

  return (
        <Snackbar
          data-testid="snackbar"
          anchorOrigin={{ horizontal: 'center', vertical: 'bottom' }}
          open={open}
          autoHideDuration={3000}
        >
          <Alert
            data-testid="alert"
            onClose={handleSnackbarClose}
            severity={alertSeverity}
            sx={{ width: '100%' }}
            action={[
              <IconButton
                data-testid="copy-button"
                key='snackbar-copy-button'
                size='small'
                onClick={() => copyErrorToClipboard()}
                style={{ display: displayCopyState }}
                color='inherit'
              >
                <ContentCopy fontSize="inherit" />
              </IconButton>,
              <IconButton
                data-testid="close-button"
                key='snackbar-close-button'
                size='small'
                onClick={handleSnackbarClose}
                color='inherit'
              >
                <Close fontSize="inherit"/>
              </IconButton>
            ]}
          >
            {text}
          </Alert>
        </Snackbar>
  )
}

ActionSnackbar.propTypes = {
  text: PropTypes.string,
  errorText: PropTypes.string,
  open: PropTypes.bool,
  setOpen: PropTypes.func,
  alertSeverity: PropTypes.string
}
