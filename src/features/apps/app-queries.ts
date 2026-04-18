/**
 * App list — uses TanStack useQueries with combine to merge 3 generated API calls.
 * Zero custom hooks. Pure TanStack standardization.
 */
import { useQueries } from '@tanstack/react-query';
import type { UseQueryResult } from '@tanstack/react-query';
import { getApps, getGetAppsQueryKey } from '@generated/core/apps/apps';
import type { getAppsResponse } from '@generated/core/apps/apps';
import { getInstances, getGetInstancesQueryKey } from '@generated/core/instances/instances';
import type { getInstancesResponse } from '@generated/core/instances/instances';
import { getApiV2ProductsApps, getGetApiV2ProductsAppsQueryKey } from '@generated/console/products/products';
import type { getApiV2ProductsAppsResponse } from '@generated/console/products/products';
import type { InstalledApp, AppInstance } from '@generated/core/schemas';
import type { Product } from '@generated/console/schemas';
import { getReverseDomainName, getAppIcon, getAuthor, getVersions, getPrice, getPermalink, getPurchasable, getCustomLinks, getDocumentationUrl } from '@features/marketplace/api/product-service';
import { decodeHtmlEntities } from '@app/html-utils';
import { unwrapSuccess } from '@app/api/unwrap';
import type { EnrichedApp } from '@features/apps/types';

function combineAppList(results: [
  UseQueryResult<getApiV2ProductsAppsResponse>,
  UseQueryResult<getAppsResponse>,
  UseQueryResult<getInstancesResponse>,
]) {
  const [pRes, aRes, iRes] = results;
  const isLoading = pRes.isPending || aRes.isPending || iRes.isPending;
  const isError = results.some((r) => r.isError);

  if (isLoading) return { appList: undefined, products: [] as Product[], isLoading, isError };

  const products: Product[] = unwrapSuccess(pRes.data)?.data?.products ?? [];
  const apps: InstalledApp[] = unwrapSuccess(aRes.data) ?? [];
  const instances: AppInstance[] = unwrapSuccess(iRes.data) ?? [];

  // Enrich device apps with marketplace metadata + instances.
  // Sideloaded apps have no marketplace match — fall back to the app's own reverse-domain name.
  const appList: EnrichedApp[] = apps.filter((a) => a.appKey.name).map((app) => {
    const mp = products.find((p) => app.appKey.name === getReverseDomainName(p));
    const installedVersions = apps.filter((a2) => a2.appKey.name === app.appKey.name).map((a2) => a2.appKey.version);
    return {
      ...app,
      title: mp ? decodeHtmlEntities(mp.name) : app.appKey.name,
      author: mp ? getAuthor(mp) : 'Sideloaded',
      ...(mp && { avatar: getAppIcon(mp), relatedLinks: getCustomLinks(mp), price: getPrice(mp), permalink: getPermalink(mp), purchasable: getPurchasable(mp), documentationUrl: getDocumentationUrl(mp) }),
      instances: instances.filter((i) => i.appKey.name === app.appKey.name && i.appKey.version === app.appKey.version),
      installedVersions,
      versions: (mp ? getVersions(mp) : [])?.map((v: string) => ({ version: v, installed: installedVersions.includes(v) })) ?? [],
    };
  });

  return { appList, products, isLoading, isError };
}

export function useAppList() {
  return useQueries({
    queries: [
      { queryKey: getGetApiV2ProductsAppsQueryKey(), queryFn: () => getApiV2ProductsApps(), staleTime: 300_000 },
      { queryKey: getGetAppsQueryKey(), queryFn: () => getApps(), refetchInterval: 10_000 },
      { queryKey: getGetInstancesQueryKey(), queryFn: () => getInstances(), refetchInterval: 5_000 },
    ],
    combine: combineAppList,
  });
}
