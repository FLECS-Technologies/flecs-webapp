/*
 * Copyright (c) 2022 FLECS Technologies GmbH
 *
 * Created on Fri Jan 14 2022
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
import { AuthProvider as OidcAuthProvider, useAuth } from 'react-oidc-context';
import { CircularProgress, Box } from '@mui/material';
import SplashScreen from '../pages/SplashScreen';

const oidcConfig = {
  authority: 'http://localhost:8080/realms/master',
  client_id: 'flecs',
  redirect_uri: `${window.location.origin}`,
};

interface AuthProviderProps {
  children: React.ReactNode;
}

function AuthGuard({ children }: { children: React.ReactNode }) {
  const auth = useAuth();

  if (auth.isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!auth.isAuthenticated || auth.error) {
    return <SplashScreen />;
  }

  return <>{children}</>;
}

function AuthProvider({ children }: AuthProviderProps) {
  return (
    <OidcAuthProvider {...oidcConfig}>
      <AuthGuard>{children}</AuthGuard>
    </OidcAuthProvider>
  );
}

export { AuthProvider };
