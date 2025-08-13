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
import {
  Box,
  Button,
  CircularProgress,
  Typography,
  Alert,
  Paper,
  Container,
  TextField,
  InputAdornment,
  IconButton,
} from '@mui/material';
import { Check } from '@mui/icons-material';
import WhiteLabelLogo from '../whitelabeling/WhiteLabelLogo';
import { useAuth } from 'react-oidc-context';
import { usePublicApi } from '../components/providers/ApiProvider';
import { useAuthConfig } from '../components/providers/AuthProvider';

export default function SplashScreen() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [clientId, setClientId] = useState('');

  const auth = useAuth();
  const api = usePublicApi();
  const { oidcConfig, updateClientId } = useAuthConfig();

  useEffect(() => {
    // Initialize clientId from current config
    setClientId(oidcConfig.client_id);
  }, [oidcConfig.client_id]);

  useEffect(() => {
    checkBackendAvailability();
  }, []);

  const checkBackendAvailability = async () => {
    setLoading(true);
    setError(null);

    api.system
      .systemPingGet()
      .catch(() => {
        // Handle backend not available case
        setError('Backend is not available. Please try again later.');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleClientIdChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newClientId = event.target.value;
    setClientId(newClientId); // Only update local state
  };

  const handleApplyClientId = () => {
    updateClientId(clientId);
  };

  const handleLoginClick = () => {
    if (!error) {
      auth.signinRedirect();
    }
  };

  const handleRetry = () => {
    checkBackendAvailability();
  };

  // Check if clientId has changed from the current config
  const hasClientIdChanged = clientId !== oidcConfig.client_id;

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

          {!loading && !error && (
            <Box display="flex" flexDirection="column" gap={2} width="100%">
              <TextField
                label="Client ID"
                value={clientId}
                onChange={handleClientIdChange}
                variant="outlined"
                fullWidth
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={handleApplyClientId}
                          disabled={!hasClientIdChanged}
                          color="primary"
                          title="Apply Client ID"
                        >
                          <Check />
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }}
              />
              <Button
                variant="contained"
                onClick={handleLoginClick}
                size="large"
                fullWidth
                sx={{ py: 1.5 }}
              >
                Login
              </Button>
            </Box>
          )}
        </Paper>
      </Box>
    </Container>
  );
}
