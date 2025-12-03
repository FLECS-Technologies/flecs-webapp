/*
 * Copyright (c) 2025 FLECS Technologies GmbH
 *
 * Created on Nov 10 2025
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

import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import DeviceLogin from '../../pages/DeviceLogin';
import { AuthContextValue } from '../providers/oauth/types';

interface AuthGuardProps {
  children: React.ReactNode;
  auth: AuthContextValue;
}

/**
 * AuthGuard component that handles authentication states and routing
 */
export const AuthGuard: React.FC<AuthGuardProps> = ({ children, auth }) => {
  // Don't guard the OAuth callback route
  // Check for both /oauth/callback and /ui/oauth/callback
  const isCallbackRoute = window.location.hash.endsWith('/oauth/callback');

  if (isCallbackRoute) {
    return <>{children}</>;
  }

  // Handle authentication errors
  if (auth.error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <Box textAlign="center">
          <Typography color="error" variant="h6">
            Authentication Error
          </Typography>
          <Typography sx={{ mt: 1 }}>{auth.error.message}</Typography>
        </Box>
      </Box>
    );
  }

  if (auth.isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <Box textAlign="center">
          <CircularProgress />
          <Typography sx={{ mt: 2 }}>Loading authentication...</Typography>
        </Box>
      </Box>
    );
  }

  if (!auth.isAuthenticated) {
    return <DeviceLogin />;
  }

  return <>{children}</>;
};
