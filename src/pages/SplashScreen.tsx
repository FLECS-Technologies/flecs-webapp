/*
 * Copyright (c) 2022 FLECS Technologies GmbH
 *
 * Created on Fri Jul 25 2025
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
import React, { useEffect, useState } from 'react';
import { Box, Button, CircularProgress, Typography, Alert, Paper, Container } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import WhiteLabelLogo from '../whitelabeling/WhiteLabelLogo';
import { useAuth } from 'react-oidc-context';
// import { useApi } from '../components/providers/ApiProvider';

export default function SplashScreen() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [identityProviderUrl, setIdentityProviderUrl] = useState<string | null>(null);
  const auth = useAuth();
  // const api = useApi();

  useEffect(() => {
    checkBackendAvailability();
  }, []);

  const checkBackendAvailability = async () => {
    setLoading(false);
    setError(null);
    setIdentityProviderUrl('https://your-identity-provider.com/login');

    /*api.system
    //  .systemPingGet()
    //  .then(() => {
        // Backend is available, proceed to fetch identity provider URL
        // Fetch identity provider URL (adjust the API call based on your actual endpoint)
        // This is an example - replace with your actual API call
        // const response = await api.system.getIdentityProviderUrl?.();
        // const idpUrl = response?.data || 'https://your-identity-provider.com/login';
        const idpUrl = 'https://your-identity-provider.com/login';

        setIdentityProviderUrl(idpUrl);
      })
      .catch(() => {
        // Handle backend not available case
        setError('Backend is not available. Please try again later.');
      })
      .finally(() => {
        setLoading(false);
      });
      */
  };

  const handleLoginClick = () => {
    if (identityProviderUrl) {
      auth.signinRedirect();
    }
  };

  const handleRetry = () => {
    checkBackendAvailability();
  };

  return (
    <Container maxWidth="sm">
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        minHeight="80vh"
        gap={3}
      >
        <Paper
          elevation={3}
          sx={{
            p: 4,
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 3,
          }}
        >
          <WhiteLabelLogo logoColor={'primary'} />
          <Typography variant="h4" component="h1" align="center" color="primary">
            Welcome
          </Typography>

          <Typography variant="body1" align="center" color="text.secondary">
            Please authenticate to continue
          </Typography>

          {loading && (
            <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
              <CircularProgress />
              <Typography variant="body2" color="text.secondary">
                Checking system availability...
              </Typography>
            </Box>
          )}

          {error && (
            <Box width="100%">
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
              <Button variant="outlined" onClick={handleRetry} fullWidth size="large">
                Retry
              </Button>
            </Box>
          )}

          {!loading && !error && identityProviderUrl && (
            <Button
              variant="contained"
              onClick={handleLoginClick}
              size="large"
              fullWidth
              sx={{ py: 1.5 }}
            >
              Login
            </Button>
          )}
        </Paper>
      </Box>
    </Container>
  );
}
