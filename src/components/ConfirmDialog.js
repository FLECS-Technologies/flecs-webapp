import React from 'react'
import PropTypes from 'prop-types'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'

const ConfirmDialog = (props) => {
  const { title, children, open, setOpen, onConfirm } = props
  return (
    <Dialog
      open={open}
      onClose={() => setOpen(false)}
      aria-labelledby="confirm-dialog"
    >
      <DialogTitle id="confirm-dialog">{title}</DialogTitle>
      <DialogContent>{children}</DialogContent>
      <DialogActions>
        <Button
          // variant="contained"
          onClick={() => setOpen(false)}
          // color="default"
        >
          No
        </Button>
        <Button
          // variant="contained"
          onClick={() => {
            setOpen(false)
            onConfirm()
          }}
          // color="default"
        >
          Yes
        </Button>
      </DialogActions>
    </Dialog>
  )
}
export default ConfirmDialog

ConfirmDialog.propTypes = {
  title: PropTypes.string,
  children: PropTypes.any,
  open: PropTypes.bool,
  setOpen: PropTypes.func,
  onConfirm: PropTypes.func
}
