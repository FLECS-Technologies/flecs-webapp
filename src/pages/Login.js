/*
 * Copyright (c) 2022 FLECS Technologies GmbH
 *
 * Created on Wed Jan 12 2022
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
import { Grid, Link, Paper, TextField, Typography, IconButton, Box } from '@mui/material'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import styled from 'styled-components'
import Visibility from '@mui/icons-material/Visibility'
import VisibilityOff from '@mui/icons-material/VisibilityOff'
import LoadButton from '../components/LoadButton'
import AuthService from '../api/AuthService'

const Header = styled.div`
  display: 'flex';
  alignItems: 'center';
  justifyContent: 'flex-end';
  padding: 32px 32px;
`

export default class Login extends Component {
  constructor (props) {
    super(props)
    this.handleLogin = this.handleLogin.bind(this)
    this.onChangeUsername = this.onChangeUsername.bind(this)
    this.onChangePassword = this.onChangePassword.bind(this)
    this.handleClickShowPassword = this.handleClickShowPassword.bind(this)
    this.handleMouseDownPassword = this.handleMouseDownPassword.bind(this)

    this.state = {
      username: '',
      password: '',
      showPassword: false,
      loading: false,
      message: ''
    }
  }

  onChangeUsername (e) {
    this.setState({
      username: e.target.value
    })
  }

  onChangePassword (e) {
    this.setState({
      password: e.target.value
    })
  }

  handleLogin (e) {
    e.preventDefault()

    this.setState((state, props) => ({
      message: '',
      loading: true
    }))

    AuthService.login(this.state.username, this.state.password).then(
      () => {
        this.setState({
          username: '',
          password: '',
          showPassword: false,
          message: 'Successfully logged in!',
          loading: false
        })
      },
      error => {
        const resMessage =
          (error.response &&
            error.response.data &&
            error.response.data.reason) ||
          error.message ||
          error.toString()

        this.setState((state, props) => ({
          message: resMessage,
          loading: false
        }))
      }
    )
  }

  handleClickShowPassword (e) {
    this.setState({
      showPassword: !this.state.showPassword,
      loading: !this.state.loading
    })
  };

  handleMouseDownPassword (event) {
    event.preventDefault()
  }

  render () {
    return (
        <>
        <Header/>

            <Grid
                container
                spacing={0}
                direction="column"
                alignItems="center"
                justifyContent="center"
                style={{ minHeight: '80vh' }}
            >
                <Paper sx={{ width: '50%', minWidth: '670px' }}>
                    <Grid
                        container
                        direction="row"
                        justify="flex-start"
                        alignItems="flex-start"
                    >
                        <Grid item xs={12} >
                            <Typography aria-label='login' variant='h2' color='primary.main' align='center' sx={{ width: '100%', mt: 2, mb: 2 }}>Login</Typography>
                        </Grid>
                        <Grid item xs={6}>
                            <Grid
                                container
                                spacing={2}
                                direction="column"
                                alignItems="center"
                                justifyContent="center"
                                sx={{ backgroundColor: 'standard' }}
                            >
                                <Grid item xs={4}>
                                    <TextField sx={{ width: '300px' }} autoFocus={true} aria-label="user-name" name="user-name" value={this.state.username} label="Username" variant="standard" type="text" required onChange={this.onChangeUsername} onSubmit={this.handleLogin}></TextField>
                                </Grid>
                                <Grid item xs={4}>
                                    <TextField
                                        sx={{ width: '300px' }}
                                        aria-label="password"
                                        name="password"
                                        value={this.state.password}
                                        label="Password"
                                        variant="standard"
                                        type={this.state.showPassword ? 'text' : 'password'}
                                        required
                                        onChange={this.onChangePassword}
                                        onSubmit={this.handleLogin}
                                        InputProps={{
                                          endAdornment:
                                                <IconButton
                                                    aria-label="toggle password visibility"
                                                    onClick={this.handleClickShowPassword}
                                                    onMouseDown={this.handleMouseDownPassword}

                                                >
                                                    {this.state.showPassword ? <VisibilityOff /> : <Visibility />}
                                                </IconButton>
                                        }}
                                    >

                                    </TextField>
                                </Grid>
                                <Grid item xs={4}>
                                    <LoadButton width="300px" size="medium" text="GO" variant="contained" onClick={this.handleLogin} label="login-button" loading={this.state.loading} type="submit" disabled={!this.state.username || !this.state.password || this.state.loading}></LoadButton>
                                </Grid>
                                <Grid item xs={4}>
                                    <Box maxWidth="300px">
                                    {this.state.message && (
                                        <div aria-label='message' dangerouslySetInnerHTML={{ __html: this.state.message }}/>
                                    )}
                                    </Box>
                                </Grid>
                            </Grid>
                        </Grid>
                        <Grid item xs={6} >
                            <Grid
                                container
                                spacing={2}
                                direction="column"
                                alignItems="left"
                                justifyContent="center"
                                // style={{ height: '100%' }}
                            >
                                <Grid item xs={6}>
                                    <Typography aria-label='create-account' variant='body'>
                                        Don&apos;t have an account yet?<br/>
                                        <Link href="/" target="_blank">Create an account</Link>
                                    </Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography aria-label='forgot-password' variant='body'>
                                        Forgot your password?<br/>
                                        <Link href="/" target="_blank">Reset password</Link>
                                    </Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography aria-label='privacy-policy' variant='body' >
                                        How do we treat your data?<br/>
                                        <Link href="https://flecs-technologies.com/privacy-policy" target="_blank">Read our privacy policy</Link><br/><br/>
                                    </Typography>
                                </Grid>
                            </Grid>
                        </Grid>
                        <Grid item xs={12} sx={{ width: '100%', mt: 2, mb: 2 }}>
                        </Grid>
                    </Grid>
                </Paper>
            </Grid>

        </>
    )
  }

  static get propTypes () {
    return {
      history: PropTypes.any
    }
  }
}
