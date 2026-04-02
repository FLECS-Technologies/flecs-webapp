/*
 * Copyright (c) 2022 FLECS Technologies GmbH
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 */
import React, { useEffect } from 'react';
import { useOAuth4WebApiAuth } from '@features/auth/AuthProvider';
import { setAuthToken } from '@app/api/fetch-instance';

// ── URL utilities (used by auth providers + fetch instance) ──

export function getBaseURL(): string {
  const base = host();
  const path = baseURL();
  if (!base) return path;
  return new URL(path, base).toString();
}

export function host() {
  if (import.meta.env.VITE_APP_ENVIRONMENT === 'development') {
    return '';
  }
  return window.location.origin;
}

export function getAuthProviderURL(providerId: string) {
  const base = host();
  const path = '/flecs/providers/auth/' + providerId;
  if (!base) return path;
  return new URL(path, base).toString();
}

export function baseURL() {
  if (import.meta.env.VITE_APP_ENVIRONMENT === 'development') {
    return '/api/v2';
  }
  return '../api/v2';
}

// ── Auth token sync — keeps orval's fetch instance authenticated ──

export function AuthTokenSync({ children }: { children: React.ReactNode }) {
  const auth = useOAuth4WebApiAuth();

  useEffect(() => {
    setAuthToken(auth.user?.access_token);
  }, [auth.user?.access_token]);

  return <>{children}</>;
}
