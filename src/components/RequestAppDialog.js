/*
 * Copyright (c) 2021 FLECS Technologies GmbH
 *
 * Created on Tue Nov 30 2021
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

import React, { useRef } from 'react'
import PropTypes from 'prop-types'
import emailjs from 'emailjs-com'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

const RequestAppDialog = (props) => {
  const { appName, appauthor, open, setOpen, onConfirm } = props
  const form = useRef()
  let success = true

  const sendEmail = (e) => {
    e.preventDefault()

    emailjs.sendForm('service_4vofhbc', 'template_6sskeph', form.current, 'user_y9Vql9stihOoZcX6xhomX')
      .then((result) => {
        console.log('App request: ' + result.text)
        success = true
      }, (error) => {
        console.log(error.text)
        success = false
      })
    setOpen(false)
    onConfirm(success)
  }

  return (
    <Dialog
      open={open}
      onClose={() => setOpen(false)}
      aria-labelledby="request-app-dialog"
    >
      <DialogTitle>Request {appName} app</DialogTitle>
      <DialogContent>
      <Box
        component="form"
        ref={form}
        onSubmit={sendEmail}
        sx={{
          '& .MuiTextField-root': { m: 1, width: '25ch' }
        }}
        noValidate
        autoComplete="off"
      >
        <Typography name="message">
          <br/>
            Hi FLECS-Team, <br/>
            Can you please ask {appauthor} to support {appName} as an app for FLECS?<br/><br/>
            Cheers!
            <br/>
        </Typography>
        <div>
          <TextField aria-label="Name" name="user_name" label="Name" variant="standard" helperText="Optional" />
          <TextField aria-label="E-Mail" name="user_email" label="E-Mail" variant="standard" helperText="Optional"/>
          <TextField aria-label="App" name="app_title" label="App" variant="standard" defaultValue={appName} style={{ display: 'none' }}/>
          <TextField aria-label="author" name="app_author" label="author" variant="standard" defaultValue={appauthor} style={{ display: 'none' }}/>
        </div>
      </Box>
      </DialogContent>
      <DialogActions>
        <Button
          variant="outlined"
          onClick={() => setOpen(false)}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={sendEmail}
        >
          Send Request
        </Button>
      </DialogActions>
    </Dialog>
  )
}
RequestAppDialog.propTypes = {
  appName: PropTypes.string,
  appauthor: PropTypes.string,
  open: PropTypes.bool,
  setOpen: PropTypes.func,
  onConfirm: PropTypes.func
}
export default RequestAppDialog
