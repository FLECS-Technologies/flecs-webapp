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
  const { handleOAuthCallback, error, isConfigReady } = useOAuth4WebApiAuth();
  const [localError, setLocalError] = useState<string | null>(null);
  const [hasProcessed, setHasProcessed] = useState(false);

  useEffect(() => {
    const processCallback = async () => {
      // Wait for config to be ready
      if (!isConfigReady) {
        console.log('OAuthCallback: Waiting for config to be ready...');
        return;
      }

      // Prevent multiple executions
      if (hasProcessed) {
        console.log('Already processed callback, skipping...');
        return;
      }

      console.log('OAuthCallback: Starting callback processing');
      setHasProcessed(true);

      try {
        // Check for error in URL params
        const urlParams = new URLSearchParams(window.location.search);
        const errorParam = urlParams.get('error');
        const errorDescription = urlParams.get('error_description');
        const code = urlParams.get('code');
        
        console.log('OAuthCallback: URL params', { errorParam, errorDescription, code: code ? 'present' : 'missing' });
        
        if (errorParam) {
          setLocalError(errorDescription || errorParam);
          return;
        }

        if (!code) {
          setLocalError('No authorization code received');
          return;
        }

        console.log('OAuthCallback: Calling handleOAuthCallback');
        // Process the OAuth callback
        await handleOAuthCallback();
        
        console.log('OAuthCallback: Success, redirecting to home');
        // Redirect to home page after successful authentication
        navigate('/', { replace: true });
      } catch (err) {
        console.error('OAuth callback processing failed:', err);
        setLocalError(err instanceof Error ? err.message : 'Authentication failed');
      }
    };

    processCallback();
  }, [handleOAuthCallback, navigate, isConfigReady, hasProcessed]);

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
