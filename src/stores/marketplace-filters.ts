import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Product, ProductCategory } from '@generated/console/schemas';
import { getRequirement, isArchCompatible } from '@features/marketplace/api/product-service';

export interface Category {
  id: number;
  name: string;
  count: number;
}

export interface FilterParams {
  hiddenCategories: number[];
  search: string | undefined;
  compatible: boolean;
  freeOnly: boolean;
  pageSize: number;
}

interface MarketplaceFiltersState {
  // UI-only state — never mirrors server data
  filterParams: FilterParams;
  showFilter: boolean;
  isSearchEnabled: boolean;
  page: number;

  // Actions
  setSearchFilter: (e: React.ChangeEvent<HTMLInputElement> | undefined) => void;
  setCategoryFilter: (categoryId: number) => void;
  setCompatibleFilter: () => void;
  setFreeOnlyFilter: () => void;
  setPageSize: (size: number) => void;
  setPage: (page: number) => void;
  toggleFilter: () => void;
  setIsSearchEnabled: (val: boolean) => void;
}

// ── Pure filter helpers — imported by the Marketplace page for useMemo derivation.
// Server state (products, arch) is never stored here; we only transform it. ──

export function searchProducts(products: Product[], search: string, isSearchEnabled: boolean): Product[] {
  if (!search || !isSearchEnabled) return products;
  const query = search.toLowerCase();
  return products.filter(
    (p) =>
      p.short_description?.toLowerCase().includes(query) ||
      p.name?.toLowerCase().includes(query),
  );
}

export function filterByCompatibility(products: Product[], compatible: boolean, arch: string | undefined): Product[] {
  if (!compatible) return products;
  if (!arch) return [];
  return products.filter((p) => isArchCompatible(getRequirement(p), arch));
}

export function filterByPrice(products: Product[], freeOnly: boolean): Product[] {
  if (!freeOnly) return products;
  return products.filter((p) => {
    const price = p.price;
    return !price || price === '' || price === '0' || price === '$0';
  });
}

function isCategoryHidden(productCategories: ProductCategory[] | undefined, hiddenCategories: number[]): boolean {
  const filtered = productCategories?.filter((p) => p.id !== 27);
  const categoryId = filtered?.map((p) => p.id)[0];
  return categoryId !== undefined && hiddenCategories.includes(categoryId);
}

export function filterByCategories(products: Product[], hiddenCategories: number[]): Product[] {
  if (hiddenCategories.length === 0) return products;
  return products.filter((p) => !isCategoryHidden(p.categories, hiddenCategories));
}

function getCleanName(name: string): string {
  return name.includes('&amp;') ? name.replace('&amp;', '&') : name;
}

export function getUniqueCategories(products: Product[]): Category[] {
  const uniqueCategories: Category[] = [];
  products.forEach((product) => {
    product.categories?.forEach((category) => {
      if (category.id !== 27) {
        const index = uniqueCategories.findIndex((c) => c.id === category.id);
        if (index > -1) {
          uniqueCategories[index].count++;
        } else {
          uniqueCategories.push({
            id: category.id,
            name: getCleanName(category.name),
            count: 1,
          });
        }
      }
    });
  });
  uniqueCategories.sort((a, b) => (a.name < b.name ? -1 : 1));
  return uniqueCategories;
}

// ── Store — UI state only ──

export const useMarketplaceFilters = create<MarketplaceFiltersState>()(
  persist(
    (set) => ({
      filterParams: { hiddenCategories: [], search: undefined, compatible: false, freeOnly: false, pageSize: 100 },
      showFilter: false,
      isSearchEnabled: true,
      page: 0,

      setSearchFilter: (e) => {
        if (!e) return;
        set((state) => ({
          filterParams: { ...state.filterParams, search: e.target.value },
          page: 0,
        }));
      },

      setCategoryFilter: (categoryId) => {
        set((state) => {
          const hidden = state.filterParams.hiddenCategories;
          const newHidden = hidden.includes(categoryId)
            ? hidden.filter((c) => c !== categoryId)
            : [...hidden, categoryId];
          newHidden.sort((a, b) => a - b);
          return { filterParams: { ...state.filterParams, hiddenCategories: newHidden }, page: 0 };
        });
      },

      setCompatibleFilter: () => {
        set((state) => ({
          filterParams: { ...state.filterParams, compatible: !state.filterParams.compatible },
          page: 0,
        }));
      },

      setFreeOnlyFilter: () => {
        set((state) => ({
          filterParams: { ...state.filterParams, freeOnly: !state.filterParams.freeOnly },
          page: 0,
        }));
      },

      setPageSize: (size) => {
        set((state) => ({
          filterParams: { ...state.filterParams, pageSize: size },
          page: 0,
        }));
      },

      setPage: (page) => set({ page }),

      toggleFilter: () => {
        set((state) => ({ showFilter: !state.showFilter }));
      },

      setIsSearchEnabled: (val) => set({ isSearchEnabled: val }),
    }),
    {
      name: 'marketplace-filters',
      partialize: (state) => ({
        filterParams: state.filterParams,
        showFilter: state.showFilter,
        isSearchEnabled: state.isSearchEnabled,
      }),
    },
  ),
);
