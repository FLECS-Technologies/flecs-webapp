/*
 * Copyright (c) 2025 FLECS Technologies GmbH
 *
 * Created on Nov 08 2025
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
import { useNavigate } from 'react-router-dom';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useOAuth4WebApiAuth } from '../components/providers/OAuth4WebApiAuthProvider';

/**
 * OAuth callback page that handles the OAuth redirect
 * This component will be shown at /oauth/callback
 */
const OAuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const { handleOAuthCallback, refreshAuthState, error, isConfigReady } = useOAuth4WebApiAuth();
  const [localError, setLocalError] = useState<string | null>(null);
  const executedRef = React.useRef(false);

  useEffect(() => {
    if (executedRef.current) {
      return;
    }
    const processCallback = async () => {
      // Wait for config to be ready
      if (!isConfigReady) {
        return;
      }

      try {
        // Check for error in URL params
        const urlParams = new URLSearchParams(window.location.search);
        const errorParam = urlParams.get('error');
        const errorDescription = urlParams.get('error_description');
        const code = urlParams.get('code');

        if (errorParam) {
          setLocalError(errorDescription || errorParam);
          return;
        }

        if (!code) {
          setLocalError('No authorization code received');
          return;
        }

        // Process the OAuth callback
        await handleOAuthCallback();

        // Refresh the auth state to ensure the context is updated
        await refreshAuthState();

        // Redirect to home page after successful authentication
        navigate('/', { replace: true });
      } catch (err) {
        setLocalError(err instanceof Error ? err.message : 'Authentication failed');
      }
    };

    processCallback();
    executedRef.current = true;
  }, [isConfigReady]);

  const displayError = localError || error?.message;

  if (displayError) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <Box textAlign="center">
          <Typography color="error" variant="h6">
            Authentication Failed
          </Typography>
          <Typography sx={{ mt: 1 }}>{displayError}</Typography>
          <Typography sx={{ mt: 2 }} variant="body2">
            <a href="/">Return to home</a>
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
      <Box textAlign="center">
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Completing sign in...</Typography>
      </Box>
    </Box>
  );
};

export default OAuthCallback;
