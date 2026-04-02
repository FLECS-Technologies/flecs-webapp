/**
 * App list — merges 3 generated hooks. This is the ONLY manual composition.
 * Each hook is generated from a spec. This file just combines the results.
 */
import { useMemo, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useGetApps } from '@generated/core/apps/apps';
import { useGetInstances } from '@generated/core/instances/instances';
import { useGetApiV2ProductsApps } from '@generated/console/products/products';
import { getReverseDomainName, getAppIcon, getAuthor, getVersions, getPrice, getPermalink, getPurchasable, getCustomLinks, getDocumentationUrl } from '@features/marketplace/api/product-service';
import { decodeHtmlEntities } from '@app/utils/html-utils';

export function useInvalidateAppData() {
  const qc = useQueryClient();
  return useCallback(() => qc.invalidateQueries(), [qc]);
}

export function useAppList() {
  const { data: pRes, isLoading: pL } = useGetApiV2ProductsApps(undefined, { query: { staleTime: 300_000 } });
  const { data: aRes, isLoading: aL } = useGetApps({ query: { refetchInterval: 10_000 } });
  const { data: iRes, isLoading: iL } = useGetInstances(undefined, { query: { refetchInterval: 5_000 } });

  // Unwrap — fetch instance returns { data: { statusCode, data: { products } }, status }
  const products = (pRes as any)?.data?.data?.products ?? (pRes as any)?.data?.products ?? [];
  const apps = (aRes as any)?.data ?? [];
  const instances = (iRes as any)?.data ?? [];

  const appList = useMemo(() => {
    if (!apps.length && !products.length) return undefined;
    if (!apps.length) return products;

    return apps.filter((a: any) => a?.appKey?.name).map((app: any) => {
      const mp = products.find((p: any) => app.appKey.name === getReverseDomainName(p));
      return {
        ...app,
        ...(mp && { avatar: getAppIcon(mp), title: decodeHtmlEntities(mp.name), author: getAuthor(mp), relatedLinks: getCustomLinks(mp), price: getPrice(mp), permalink: getPermalink(mp), purchasable: getPurchasable(mp), documentationUrl: getDocumentationUrl(mp), versions: getVersions(mp) }),
        instances: instances.filter((i: any) => i.appKey.name === app.appKey.name && i.appKey.version === app.appKey.version),
        installedVersions: apps.filter((a2: any) => a2.appKey?.name === app.appKey.name).map((a2: any) => a2.appKey.version),
      };
    });
  }, [products, apps, instances]);

  return { appList, products, isLoading: pL || aL || iL, invalidateAll: useInvalidateAppData() };
}
