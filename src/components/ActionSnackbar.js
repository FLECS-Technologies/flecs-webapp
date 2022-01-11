/*
 * Copyright (c) 2021 FLECS Technologies GmbH
 *
 * Created on Wed Dec 15 2021
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React from 'react'
import PropTypes from 'prop-types'
import { Snackbar, Alert, IconButton } from '@mui/material'
import { Close, ContentCopy } from '@mui/icons-material'

export default function ActionSnackbar (props) {
  const { text, errorText, open, setOpen, alertSeverity } = props
  const displayCopyState = (alertSeverity === 'error') ? 'block' : 'none'

  function copyErrorToClipboard () {
    if (errorText) {
      navigator.clipboard.writeText(errorText)
    } else {
      navigator.clipboard.writeText('No further error information available. Please check your browser\'s console for further information')
    }
  }

  function handleSnackbarClose (event, reason) {
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
          onClose={handleSnackbarClose}
        >
          <Alert
            data-testid="alert"
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
