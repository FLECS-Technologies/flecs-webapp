/*
 * Copyright (c) 2022 FLECS Technologies GmbH
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 */
// ── URL utilities (used by auth providers + fetch instance) ──

export function getBaseURL(): string {
  const base = host();
  const path = baseURL();
  if (!base) return path;
  return new URL(path, base).toString();
}

export function host() {
  if (import.meta.env.DEV) return '';
  return window.location.origin;
}

export function getAuthProviderURL(providerId: string) {
  const base = host();
  const path = '/flecs/providers/auth/' + providerId;
  if (!base) return path;
  return new URL(path, base).toString();
}

export function baseURL() {
  if (import.meta.env.DEV) return '/api/v2';
  return '../api/v2';
}
