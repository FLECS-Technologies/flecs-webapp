/*
 * Copyright (c) 2025 FLECS Technologies GmbH
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useProtectedApi } from '@shared/api/ApiProvider';
import type { SystemInfo, SystemVersionGet200Response, ExportRequest } from '@flecs/core-client-ts';

export const systemKeys = {
  all: ['system'] as const,
  ping: () => [...systemKeys.all, 'ping'] as const,
  info: () => [...systemKeys.all, 'info'] as const,
  version: () => [...systemKeys.all, 'version'] as const,
  license: () => [...systemKeys.all, 'license'] as const,
  exports: () => ['exports'] as const,
};

export function useSystemPing() {
  const api = useProtectedApi();
  return useQuery<boolean>({
    queryKey: systemKeys.ping(),
    queryFn: async () => {
      await api.system.systemPingGet();
      return true;
    },
    retry: false,
    refetchInterval: 30_000,
  });
}

export function useSystemInfo() {
  const api = useProtectedApi();
  return useQuery<SystemInfo>({
    queryKey: systemKeys.info(),
    queryFn: async () => {
      const response = await api.system.systemInfoGet();
      return response.data;
    },
    staleTime: 60_000,
  });
}

export function useSystemVersion() {
  const api = useProtectedApi();
  return useQuery<SystemVersionGet200Response>({
    queryKey: systemKeys.version(),
    queryFn: async () => {
      const response = await api.system.systemVersionGet();
      return response.data;
    },
    staleTime: 60_000,
  });
}

export function useLicenseStatus() {
  const api = useProtectedApi();
  return useQuery({
    queryKey: systemKeys.license(),
    queryFn: async () => {
      const response = await api.device.deviceLicenseActivationStatusGet();
      return response.data;
    },
    staleTime: 60_000,
  });
}

export function useActivateDevice() {
  const api = useProtectedApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => api.device.deviceLicenseActivationPost(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: systemKeys.license() });
    },
  });
}

export function useExports() {
  const api = useProtectedApi();
  return useQuery({
    queryKey: systemKeys.exports(),
    queryFn: async () => {
      const response = await api.export.exportsGet();
      return response.data;
    },
  });
}

export function useCreateExport() {
  const api = useProtectedApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: ExportRequest) =>
      api.export.exportsPost(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: systemKeys.exports() });
    },
  });
}
