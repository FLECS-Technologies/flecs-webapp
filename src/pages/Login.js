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
import React, { useRef } from 'react'
import styled from 'styled-components'
import Visibility from '@mui/icons-material/Visibility'
import VisibilityOff from '@mui/icons-material/VisibilityOff'
import AuthService from '../api/marketplace/AuthService'
import { useAuth } from '../components/AuthProvider'
import { useLocation, useNavigate } from 'react-router-dom'
import { LoadingButton } from '@mui/lab'
import { postMPLogin } from '../api/device/DeviceAuthAPI'

const Header = styled.div`
  display: 'flex';
  alignItems: 'center';
  justifyContent: 'flex-end';
  padding: 32px 32px;
`

export default function Login () {
  const [state, setState] = React.useState({
    username: '',
    password: '',
    showPassword: false,
    loading: false,
    message: ''
  })
  const userRef = useRef('') // creating a refernce for user TextField Component
  const pwRef = useRef('') // creating a refernce for password TextField Component
  const user = useAuth()
  const navigate = useNavigate()
  const [location] = React.useState(useLocation())
  const from = location.state?.from?.pathname || '/'

  function onChangeUsername (event) {
    setState(previousState => {
      return { ...previousState, username: userRef.current.value }
    })
  }

  function onChangePassword (event) {
    setState(previousState => {
      return { ...previousState, password: pwRef.current.value }
    })
  }

  function handleLogin (event) {
    event.preventDefault()

    setState(previousState => {
      return { ...previousState, message: '', loading: true }
    })

    AuthService.login(state.username, state.password).then(
      () => {
        pwRef.current.value = ''
        userRef.current.value = ''
        setState(previousState => {
          return {
            ...previousState,
            username: pwRef.current.value,
            password: userRef.current.value,
            showPassword: false,
            message: 'Successfully logged in!',
            loading: false
          }
        })

        user.setUser(AuthService.getCurrentUser())
        postMPLogin(AuthService.getCurrentUser())
          .then(() => {
            navigate(from, { replace: true })
          },
          error => {
            setState(previousState => {
              return {
                ...previousState,
                message: error.message,
                loading: false
              }
            })
          })
      },
      error => {
        const resMessage =
          (error.response &&
            error.response.data &&
            error.response.data.reason) ||
          error.message ||
          error.toString()

        setState(previousState => {
          return {
            ...previousState,
            message: resMessage,
            loading: false
          }
        })
      }
    )
  }

  function handleClickShowPassword (e) {
    setState(previousState => {
      return {
        ...previousState,
        showPassword: !state.showPassword
      }
    })
  };

  function handleMouseDownPassword (event) {
    event.preventDefault()
  }

  return (
        <>
        <Header/>
            <Grid
                aria-label='login-page'
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
                          <form onSubmit={handleLogin}>
                            <Grid
                                container
                                spacing={2}
                                direction="column"
                                alignItems="center"
                                justifyContent="center"
                                sx={{ backgroundColor: 'standard' }}
                            >
                                <Grid item xs={4}>
                                    <TextField
                                      sx={{ width: '300px' }}
                                      autoFocus={true}
                                      aria-label="user-name"
                                      name="user-name"
                                      // value={state.username}
                                      label="Username"
                                      variant="standard"
                                      type="text"
                                      required
                                      onChange={onChangeUsername}
                                      inputRef={userRef} // connecting inputRef property of TextField to the userRef
                                    ></TextField>
                                </Grid>
                                <Grid item xs={4}>
                                    <TextField
                                        sx={{ width: '300px' }}
                                        aria-label="password"
                                        name="password"
                                        // value={state.password}
                                        label="Password"
                                        variant="standard"
                                        type={state.showPassword ? 'text' : 'password'}
                                        required
                                        onChange={onChangePassword}
                                        inputRef={pwRef} // connecting inputRef property of TextField to the pwRef
                                        InputProps={{
                                          'aria-label': 'password-input',
                                          endAdornment:
                                                <IconButton
                                                    aria-label="toggle password visibility"
                                                    onClick={handleClickShowPassword}
                                                    onMouseDown={handleMouseDownPassword}

                                                >
                                                    {state.showPassword ? <VisibilityOff /> : <Visibility />}
                                                </IconButton>
                                        }}
                                    >

                                    </TextField>
                                </Grid>
                                <Grid item xs={4}>
                                    <LoadingButton sx={{ width: '300px' }} variant="contained" aria-label="login-button" loading={state.loading} type="submit" disabled={!state.username || !state.password || state.loading}>GO</LoadingButton>
                                </Grid>
                                <Grid item xs={4}>
                                    <Box maxWidth="300px">
                                    {state.message && (
                                        <div aria-label='message' dangerouslySetInnerHTML={{ __html: state.message }}/>
                                    )}
                                    </Box>
                                </Grid>
                            </Grid>
                          </form>
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
                                        <Link aria-label='create-account-link' href="https://flecs.tech/my-account" target="_blank">Create an account</Link>
                                    </Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography aria-label='forgot-password' variant='body'>
                                        Forgot your password?<br/>
                                        <Link aria-label='forgot-password-link' href="https://flecs.tech/my-account/lost-password" target="_blank">Reset password</Link>
                                    </Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography aria-label='privacy-policy' variant='body' >
                                        How do we treat your data?<br/>
                                        <Link aria-label='privacy-policy-link' href="https://flecs.tech/privacy-policy" target="_blank">Read our privacy policy</Link><br/><br/>
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
