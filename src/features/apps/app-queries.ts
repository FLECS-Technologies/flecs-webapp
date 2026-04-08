/**
 * App list — uses TanStack useQueries with combine to merge 3 generated API calls.
 * Zero custom hooks. Pure TanStack standardization.
 */
import { useQueries } from '@tanstack/react-query';
import { getApps, getGetAppsQueryKey } from '@generated/core/apps/apps';
import { getInstances, getGetInstancesQueryKey } from '@generated/core/instances/instances';
import { getApiV2ProductsApps, getGetApiV2ProductsAppsQueryKey } from '@generated/console/products/products';
import { getReverseDomainName, getAppIcon, getAuthor, getVersions, getPrice, getPermalink, getPurchasable, getCustomLinks, getDocumentationUrl } from '@features/marketplace/api/product-service';
import { decodeHtmlEntities } from '@app/html-utils';

export type AppVersion = { version: string; installed: boolean };

function combineAppList(results: any[]) {
  const [pRes, aRes, iRes] = results;
  const isLoading = aRes.isPending;
  const isError = results.some((r: any) => r.isError);

  if (isLoading) return { appList: undefined, products: [], isLoading, isError };

  const products = (pRes.data as any)?.data?.data?.products ?? (pRes.data as any)?.data?.products ?? [];
  const apps = Array.isArray((aRes.data as any)?.data) ? (aRes.data as any).data : [];
  const instances = Array.isArray((iRes.data as any)?.data) ? (iRes.data as any).data : [];

  // Enrich device apps with marketplace metadata + instances
  const appList = apps.filter((a: any) => a?.appKey?.name).map((app: any) => {
    const mp = products.find((p: any) => app.appKey.name === getReverseDomainName(p));
    const installedVersions = apps.filter((a2: any) => a2.appKey?.name === app.appKey.name).map((a2: any) => a2.appKey.version);
    return {
      ...app,
      ...(mp && { avatar: getAppIcon(mp), title: decodeHtmlEntities(mp.name), author: getAuthor(mp), relatedLinks: getCustomLinks(mp), price: getPrice(mp), permalink: getPermalink(mp), purchasable: getPurchasable(mp), documentationUrl: getDocumentationUrl(mp) }),
      instances: instances.filter((i: any) => i.appKey.name === app.appKey.name && i.appKey.version === app.appKey.version),
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
