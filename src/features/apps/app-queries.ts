/**
 * App list - uses TanStack useQueries with combine to merge generated API calls.
 * Zero custom hooks. Pure TanStack standardization.
 */
import { useQueries } from '@tanstack/react-query';
import type { UseQueryResult } from '@tanstack/react-query';
import { getApps, getGetAppsQueryKey } from '@generated/core/apps/apps';
import type { getAppsResponse } from '@generated/core/apps/apps';
import { getInstances, getGetInstancesQueryKey } from '@generated/core/instances/instances';
import type { getInstancesResponse } from '@generated/core/instances/instances';
import {
  getApiV2ProductsApps,
  getGetApiV2ProductsAppsQueryKey,
} from '@generated/console/products/products';
import type { getApiV2ProductsAppsResponse } from '@generated/console/products/products';
import type { InstalledApp, AppInstance } from '@generated/core/schemas';
import type { GetApiV2ProductsAppsParams, Product } from '@generated/console/schemas';
import { useTenant } from '@app/theme/TenantContext';
import {
  getReverseDomainName,
  getAppIcon,
  getAuthor,
  getVersions,
  getPrice,
  getPermalink,
  getPurchasable,
  getCustomLinks,
  getDocumentationUrl,
  type WCProduct,
} from '@features/marketplace/api/product-service';
import { decodeHtmlEntities } from '@app/html-utils';
import { unwrapSuccess } from '@app/api/unwrap';
import type { EnrichedApp } from '@features/apps/types';

export type MarketplaceProduct = WCProduct & { name: string };

export function enrichInstalledApps(
  products: MarketplaceProduct[],
  apps: InstalledApp[],
  instances: AppInstance[],
): EnrichedApp[] {
  return apps
    .filter((app) => app.appKey.name)
    .map((app) => {
      const marketplaceApp = products.find(
        (product) => app.appKey.name === getReverseDomainName(product),
      );
      const installedVersions = apps
        .filter((candidate) => candidate.appKey.name === app.appKey.name)
        .map((candidate) => candidate.appKey.version);

      return {
        ...app,
        title: marketplaceApp ? decodeHtmlEntities(marketplaceApp.name) : app.appKey.name,
        author: marketplaceApp ? getAuthor(marketplaceApp) : 'Sideloaded',
        ...(marketplaceApp && {
          avatar: getAppIcon(marketplaceApp),
          relatedLinks: getCustomLinks(marketplaceApp),
          price: getPrice(marketplaceApp),
          permalink: getPermalink(marketplaceApp),
          purchasable: getPurchasable(marketplaceApp),
          documentationUrl: getDocumentationUrl(marketplaceApp),
        }),
        instances: instances.filter(
          (instance) =>
            instance.appKey.name === app.appKey.name &&
            instance.appKey.version === app.appKey.version,
        ),
        installedVersions,
        versions:
          (marketplaceApp ? getVersions(marketplaceApp) : [])?.map((version: string) => ({
            version,
            installed: installedVersions.includes(version),
          })) ?? [],
      };
    });
}

function combineAppList(
  results: [
    UseQueryResult<getApiV2ProductsAppsResponse>,
    UseQueryResult<getAppsResponse>,
    UseQueryResult<getInstancesResponse>,
  ],
) {
  const [pRes, aRes, iRes] = results;
  const isLoading = pRes.isPending || aRes.isPending || iRes.isPending;
  const isError = results.some((r) => r.isError);

  if (isLoading) return { appList: undefined, products: [] as Product[], isLoading, isError };

  const products: Product[] = unwrapSuccess(pRes.data)?.data?.products ?? [];
  const apps: InstalledApp[] = unwrapSuccess(aRes.data) ?? [];
  const instances: AppInstance[] = unwrapSuccess(iRes.data) ?? [];

  // Keep enrichment as a pure mapper so every installed-app surface shares
  // the same title, icon, author, version, and instance model.
  const appList = enrichInstalledApps(products, apps, instances);

  return { appList, products, isLoading, isError };
}

export function useAppList() {
  const { vendor_id } = useTenant();
  // vendor_id maps to DeviceLicenseManufacturer.id; the console API uses store_id
  // to scope the marketplace to a vendor's store. Assumed to share the same ID space.
  const params: GetApiV2ProductsAppsParams | undefined =
    vendor_id > 0 ? { store_id: vendor_id } : undefined;

  return useQueries({
    queries: [
      {
        queryKey: getGetApiV2ProductsAppsQueryKey(params),
        queryFn: () => getApiV2ProductsApps(params),
        staleTime: 300_000,
      },
      { queryKey: getGetAppsQueryKey(), queryFn: () => getApps(), refetchInterval: 10_000 },
      {
        queryKey: getGetInstancesQueryKey(),
        queryFn: () => getInstances(),
        refetchInterval: 5_000,
      },
    ],
    combine: combineAppList,
  });
}
