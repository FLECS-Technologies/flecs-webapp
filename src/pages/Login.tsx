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
import * as React from 'react';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { Grid, Link, Paper, TextField, Typography, IconButton, Box, Button } from '@mui/material';
import styled from 'styled-components';
import AuthService from '../api/marketplace/AuthService';
// import { useAuth } from '../components/AuthProvider';
import { useLocation, useNavigate } from 'react-router-dom';
import { postMPLogin } from '../api/device/DeviceAuthAPI';
import { DeviceActivationContext } from '../components/providers/DeviceActivationContext';

const Header = styled.div`
  display: 'flex';
  alignitems: 'center';
  justifycontent: 'flex-end';
  padding: 32px 32px;
`;

export default function Login() {
  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);
  const [loginInProgress, setLoginInProgress] = React.useState(false);
  const [message, setMessage] = React.useState('');
  const { validate } = React.useContext(DeviceActivationContext);

  const user = null;
  const navigate = useNavigate();
  const [location] = React.useState(useLocation());
  const from = location.state?.from?.pathname || '/';

  function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setMessage('');
    setLoginInProgress(true);

    AuthService.login(username, password)
      .then(
        () => {
          setMessage('Successfully logged in!');

          // user.setUser(AuthService.getCurrentUser());
          postMPLogin(AuthService.getCurrentUser()).then(
            () => {
              validate();
              navigate(from, { replace: true });
            },
            (error) => {
              setMessage(error.message);
            },
          );
        },
        (error) => {
          const resMessage =
            (error.response && error.response.data && error.response.data.reason) ||
            error.message ||
            error.toString();

          setMessage(resMessage);
        },
      )
      .finally(() => {
        setLoginInProgress(false);
      });
  }

  return (
    <>
      <Header />
      <Grid
        aria-label="login-page"
        container
        spacing={0}
        direction="column"
        alignItems="center"
        justifyContent="center"
        style={{ minHeight: '80vh' }}
      >
        <Paper sx={{ width: '50%', minWidth: '670px' }}>
          <Grid container direction="row" justifyContent="flex-start" alignItems="flex-start">
            <Grid size={{ xs: 12 }}>
              <Typography
                aria-label="login"
                variant="h2"
                color="primary.main"
                align="center"
                sx={{ width: '100%', mt: 2, mb: 2 }}
              >
                Login
              </Typography>
            </Grid>
            <Grid size={{ xs: 6 }}>
              <form onSubmit={handleLogin}>
                <Grid
                  container
                  spacing={2}
                  direction="column"
                  alignItems="center"
                  justifyContent="center"
                  sx={{ backgroundColor: 'standard' }}
                >
                  <Grid>
                    <TextField
                      sx={{ width: '300px' }}
                      autoFocus={true}
                      aria-label="user-name"
                      name="user-name"
                      label="Username"
                      variant="standard"
                      type="text"
                      required
                      onChange={(event) => setUsername(event.currentTarget.value)}
                    />
                  </Grid>
                  <Grid>
                    <TextField
                      sx={{ width: '300px' }}
                      aria-label="password"
                      name="password"
                      label="Password"
                      variant="standard"
                      type={showPassword ? 'text' : 'password'}
                      required
                      onChange={(event) => setPassword(event.currentTarget.value)}
                      InputProps={{
                        'aria-label': 'password-input',
                        endAdornment: (
                          <IconButton
                            aria-label="toggle password visibility"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        ),
                      }}
                    />
                  </Grid>
                  <Grid>
                    <Button
                      sx={{ width: '300px' }}
                      variant="contained"
                      aria-label="login-button"
                      loading={loginInProgress}
                      type="submit"
                      disabled={!username || !password}
                    >
                      {' '}
                      GO{' '}
                    </Button>
                  </Grid>
                  <Grid>
                    <Box maxWidth="300px">
                      {message && (
                        <div aria-label="message" dangerouslySetInnerHTML={{ __html: message }} />
                      )}
                    </Box>
                  </Grid>
                </Grid>
              </form>
            </Grid>
            <Grid size={{ xs: 6 }}>
              <Grid
                container
                spacing={2}
                direction="column"
                alignItems="left"
                justifyContent="center"
              >
                <Grid>
                  <Typography aria-label="create-account" variant="body1">
                    Don&apos;t have an account yet? <br />
                    <Link
                      aria-label="create-account-link"
                      href="https://flecs.tech/my-account"
                      target="_blank"
                    >
                      {' '}
                      Create an account{' '}
                    </Link>
                  </Typography>
                </Grid>
                <Grid>
                  <Typography aria-label="forgot-password" variant="body1">
                    Forgot your password ? <br />
                    <Link
                      aria-label="forgot-password-link"
                      href="https://flecs.tech/my-account/lost-password"
                      target="_blank"
                    >
                      {' '}
                      Reset password{' '}
                    </Link>
                  </Typography>
                </Grid>
                <Grid>
                  <Typography aria-label="privacy-policy" variant="body1">
                    How do we treat your data ? <br />
                    <Link
                      aria-label="privacy-policy-link"
                      href="https://flecs.tech/privacy-policy"
                      target="_blank"
                    >
                      {' '}
                      Read our privacy policy{' '}
                    </Link>
                    <br /> <br />
                  </Typography>
                </Grid>
              </Grid>
            </Grid>
            <Grid size={{ xs: 12 }} sx={{ width: '100%', mt: 2, mb: 2 }} />
          </Grid>
        </Paper>
      </Grid>
    </>
  );
}
