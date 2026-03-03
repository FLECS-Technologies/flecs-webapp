/*
 * Copyright (c) 2025 FLECS Technologies GmbH
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 */

import { useQuery } from '@tanstack/react-query';
import { getProducts, getReverseDomainName } from './api/ProductService';

export const marketplaceKeys = {
  all: ['marketplace'] as const,
  products: () => [...marketplaceKeys.all, 'products'] as const,
};

export function useMarketplaceProducts() {
  return useQuery({
    queryKey: marketplaceKeys.products(),
    queryFn: async () => {
      const products = await getProducts();
      // Deduplicate by reverse domain name
      const seen = new Set();
      return (products || [])
        .filter((p) => {
          const rdn = getReverseDomainName(p);
          if (seen.has(rdn)) return false;
          seen.add(rdn);
          return true;
        })
        .sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));
    },
    staleTime: 5 * 60_000, // marketplace data is relatively stable
  });
}
