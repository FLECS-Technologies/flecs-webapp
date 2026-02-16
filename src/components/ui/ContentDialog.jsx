import React from 'react';
import PropTypes from 'prop-types';
import {
  DialogTitle,
  Dialog,
  DialogActions,
  Button,
  DialogContent,
  Typography,
} from '@mui/material';

function ContentDialog(props) {
  const { title, open, setOpen, actions } = props;

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <Dialog fullWidth={true} maxWidth="lg" open={open} onClose={handleClose} scroll="paper">
      <DialogTitle data-testid="content-dialog-title">{title}</DialogTitle>
      <DialogContent dividers={true}>
        {props.children == null ? (
          <Typography>Hm, looks like I was not given any content to display.</Typography>
        ) : (
          props.children
        )}
      </DialogContent>
      <DialogActions>
        {actions == null ? (
          <Button data-testid="close-button" variant="outlined" onClick={handleClose}>
            Close
          </Button>
        ) : (
          actions
        )}
      </DialogActions>
    </Dialog>
  );
}
ContentDialog.propTypes = {
  children: PropTypes.any,
  title: PropTypes.string,
  open: PropTypes.bool,
  setOpen: PropTypes.func,
  actions: PropTypes.object,
};

export default ContentDialog;
