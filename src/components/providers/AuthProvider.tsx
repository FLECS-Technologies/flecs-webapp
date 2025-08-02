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
import { AuthProvider as OidcAuthProvider, useAuth, useAutoSignin } from 'react-oidc-context';
import { CircularProgress, Box } from '@mui/material';
import SplashScreen from '../../pages/SplashScreen';
import { WebStorageStateStore } from 'oidc-client-ts';

const oidcConfig = {
  authority: 'http://localhost:8080/realms/master',
  client_id: 'flecs',
  redirect_uri: `${window.location.origin}`,
  automaticSilentRenew: true,
  userStore: new WebStorageStateStore({ store: window.localStorage }),
  accessTokenExpiringNotificationTimeInSeconds: 300, // refresh token 5 minutes before expiry
};

interface AuthProviderProps {
  children: React.ReactNode;
}

function AuthGuard({ children }: { children: React.ReactNode }) {
  const auth = useAuth();

  // Show loading while either auth is loading or auto sign-in is in progress
  if (auth.isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  // If not authenticated and auto sign-in failed, show splash screen
  if (!auth.isAuthenticated) {
    return <SplashScreen />;
  }

  // If there's an auth error that's not related to auto sign-in, show splash screen
  if (auth.error) {
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
