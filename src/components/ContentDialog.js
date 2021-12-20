import React from 'react'
import PropTypes from 'prop-types'
import { DialogTitle, Dialog, DialogActions, Button, DialogContent, Typography } from '@mui/material'

function ContentDialog (props) {
  const { content, title, open, setOpen, actions } = props

  const handleClose = () => {
    setOpen(false)
  }

  return (
    <Dialog
        open={open}
        onClose={handleClose}
        scroll='paper'
      >
        <DialogTitle data-testid="content-dialog-title">
            {title}
        </DialogTitle>
        <DialogContent dividers={true}>
            {(content == null) ? <Typography>Hm, looks like I was not given any content to display.</Typography> : content}
        </DialogContent>
        <DialogActions>{(actions == null) ? <Button data-testid="close-button" onClick={handleClose}>Close</Button> : actions}</DialogActions>
      </Dialog>
  )
}
ContentDialog.propTypes = {
  content: PropTypes.object,
  title: PropTypes.string,
  open: PropTypes.bool,
  setOpen: PropTypes.func,
  actions: PropTypes.object
}

export default ContentDialog
