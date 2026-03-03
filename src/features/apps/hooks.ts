/*
 * Copyright (c) 2025 FLECS Technologies GmbH
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 */

import { useMemo, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useProtectedApi } from '@shared/api/ApiProvider';
import type { InstalledApp, AppInstance } from '@flecs/core-client-ts';
import { useMarketplaceProducts, marketplaceKeys } from '@features/marketplace/hooks';
import {
  getAppIcon,
  getAuthor,
  getCustomLinks,
  getDocumentationUrl,
  getPermalink,
  getPrice,
  getPurchasable,
  getReverseDomainName,
} from '@features/marketplace/api/ProductService';
import { decodeHtmlEntities } from '@shared/utils/html-utils';

export const appKeys = {
  all: ['apps'] as const,
  list: () => [...appKeys.all, 'list'] as const,
  instances: () => ['instances'] as const,
  instanceDetail: (id: string) => ['instances', id] as const,
  instanceLogs: (id: string) => ['instances', id, 'logs'] as const,
};

export function useApps() {
  const api = useProtectedApi();
  return useQuery<InstalledApp[]>({
    queryKey: appKeys.list(),
    queryFn: async () => {
      const response = await api.app.appsGet();
      return response.data;
    },
    refetchInterval: 10_000,
  });
}

export function useInstances(app?: string, version?: string) {
  const api = useProtectedApi();
  return useQuery<AppInstance[]>({
    queryKey: [...appKeys.instances(), app, version],
    queryFn: async () => {
      const response = await api.instances.instancesGet(app, version);
      return response.data;
    },
    refetchInterval: 5_000,
  });
}

export function useInstanceDetail(instanceId: string) {
  const api = useProtectedApi();
  return useQuery({
    queryKey: appKeys.instanceDetail(instanceId),
    queryFn: async () => {
      const response = await api.instances.instancesInstanceIdGet(instanceId);
      return response.data;
    },
    enabled: !!instanceId,
  });
}

export function useInstanceLogs(instanceId: string) {
  const api = useProtectedApi();
  return useQuery({
    queryKey: appKeys.instanceLogs(instanceId),
    queryFn: async () => {
      const response = await api.instances.instancesInstanceIdLogsGet(instanceId);
      return response.data;
    },
    enabled: !!instanceId,
  });
}

export function useStartInstance() {
  const api = useProtectedApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (instanceId: string) =>
      api.instances.instancesInstanceIdStartPost(instanceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: appKeys.instances() });
    },
  });
}

export function useStopInstance() {
  const api = useProtectedApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (instanceId: string) =>
      api.instances.instancesInstanceIdStopPost(instanceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: appKeys.instances() });
    },
  });
}

export function useDeleteInstance() {
  const api = useProtectedApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (instanceId: string) =>
      api.instances.instancesInstanceIdDelete(instanceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: appKeys.instances() });
      queryClient.invalidateQueries({ queryKey: appKeys.list() });
    },
  });
}

export function useCreateInstance() {
  const api = useProtectedApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { appName: string; version: string }) =>
      api.instances.instancesCreatePost({
        appKey: { name: payload.appName, version: payload.version },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: appKeys.instances() });
    },
  });
}

export function useUninstallApp() {
  const api = useProtectedApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { appName: string; version: string }) =>
      api.app.appsAppDelete(payload.appName, payload.version),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: appKeys.list() });
      queryClient.invalidateQueries({ queryKey: appKeys.instances() });
    },
  });
}

// ---------------------------------------------------------------------------
// Composite hooks — replace ReferenceDataContext
// ---------------------------------------------------------------------------

/**
 * Invalidate all app-related queries (marketplace products, installed apps, instances).
 * Drop-in replacement for the old `setUpdateAppList(true)` pattern.
 */
export function useInvalidateAppData() {
  const queryClient = useQueryClient();
  return useCallback(() => {
    queryClient.invalidateQueries({ queryKey: marketplaceKeys.all });
    queryClient.invalidateQueries({ queryKey: appKeys.list() });
    queryClient.invalidateQueries({ queryKey: appKeys.instances() });
  }, [queryClient]);
}

/**
 * Merged app list — combines marketplace products, installed apps, and instances.
 * Direct replacement for ReferenceDataContext.
 *
 * TanStack Query deduplicates the underlying network calls, so this hook
 * can safely be called in multiple components without redundant fetches.
 */
export function useAppList() {
  const {
    data: marketplaceProducts,
    isLoading: productsLoading,
    isError: productsError,
  } = useMarketplaceProducts();

  const {
    data: installedApps,
    isLoading: appsLoading,
    isError: appsError,
  } = useApps();

  const {
    data: instances,
    isLoading: instancesLoading,
  } = useInstances();

  const invalidateAll = useInvalidateAppData();

  const collator = useMemo(
    () => new Intl.Collator('en', { numeric: true, sensitivity: 'base' }),
    [],
  );

  const appList = useMemo(() => {
    if (!marketplaceProducts) return undefined;
    if (!installedApps || appsError) return [...marketplaceProducts] as any[];

    const mergedList = installedApps.map((app: any) => ({ ...app }));

    mergedList.forEach((app: any) => {
      const mpApp = marketplaceProducts.find(
        (product: any) => app.appKey.name === getReverseDomainName(product),
      );

      if (mpApp) {
        app.avatar = getAppIcon(mpApp);
        app.title = decodeHtmlEntities(mpApp?.name);
        app.author = getAuthor(mpApp);
        app.relatedLinks = getCustomLinks(mpApp);
        app.price = getPrice(mpApp);
        app.permalink = getPermalink(mpApp);
        app.purchasable = getPurchasable(mpApp);
        app.documentationUrl = getDocumentationUrl(mpApp);
      }

      if (typeof app === 'object' && app !== null) {
        const installedVersions = mergedList
          .filter((a: any) => a.appKey.name === app.appKey.name)
          .map((a: any) => a.appKey.version);
        installedVersions.sort((a: string, b: string) => collator.compare(a, b));
        installedVersions.reverse();
        app.installedVersions = installedVersions;

        if (instances) {
          app.instances = instances.filter(
            (i) =>
              i.appKey.name === app.appKey.name &&
              i.appKey.version === app.appKey.version,
          );
        }
      }
    });

    return mergedList;
  }, [marketplaceProducts, installedApps, instances, appsError, collator]);

  const isLoading = productsLoading || appsLoading || instancesLoading;
  const isError = productsError || (appsError && !productsError);

  return {
    appList,
    products: marketplaceProducts,
    isLoading,
    isError,
    invalidateAll,
  };
}
