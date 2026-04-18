import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Product, ProductCategory } from '@generated/console/schemas';
import { getRequirement, isArchCompatible } from '@features/marketplace/api/product-service';

interface Category {
  id: number;
  name: string;
  count: number;
}

interface FilterParams {
  hiddenCategories: number[];
  search: string | undefined;
  compatible: boolean;
  freeOnly: boolean;
  pageSize: number;
}

interface MarketplaceFiltersState {
  // State
  filterParams: FilterParams;
  categories: Category[];
  showFilter: boolean;
  isSearchEnabled: boolean;
  finalProducts: Product[];
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
  applyFilters: (loadedProducts: Product[], arch?: string) => void;
}

function searchProducts(products: Product[], search: string, isSearchEnabled: boolean): Product[] {
  if (!search || !isSearchEnabled) return products;
  const query = search.toLowerCase();
  return products.filter(
    (p) =>
      p.short_description?.toLowerCase().includes(query) ||
      p.name?.toLowerCase().includes(query),
  );
}

function filterByCompatibility(products: Product[], compatible: boolean, arch: string | undefined): Product[] {
  if (!compatible || !arch) return products;
  return products.filter((p) => isArchCompatible(getRequirement(p), arch));
}

function filterByPrice(products: Product[], freeOnly: boolean): Product[] {
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

function filterByCategories(products: Product[], hiddenCategories: number[]): Product[] {
  if (hiddenCategories.length === 0) return products;
  return products.filter((p) => !isCategoryHidden(p.categories, hiddenCategories));
}

function getIntersection(...arrays: Product[][]): Product[] {
  if (arrays.length < 2) return arrays[0] ?? [];
  return arrays[0].filter((item) =>
    arrays.slice(1).every((arr) => arr.some((p) => p.id === item.id)),
  );
}

function getCleanName(name: string): string {
  return name.includes('&amp;') ? name.replace('&amp;', '&') : name;
}

function getUniqueCategories(products: Product[]): Category[] {
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

export const useMarketplaceFilters = create<MarketplaceFiltersState>()(
  persist(
    (set, get) => ({
      filterParams: { hiddenCategories: [], search: undefined, compatible: false, freeOnly: false, pageSize: 100 },
      categories: [],
      showFilter: false,
      isSearchEnabled: true,
      finalProducts: [],
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

      applyFilters: (loadedProducts, arch) => {
        if (!loadedProducts || loadedProducts.length === 0) return;

        const { filterParams, isSearchEnabled } = get();

        const byCompatible = filterByCompatibility(loadedProducts, filterParams.compatible, arch);
        const byCategories = filterByCategories(loadedProducts, filterParams.hiddenCategories);
        const bySearch = searchProducts(loadedProducts, filterParams.search ?? '', isSearchEnabled);
        const byPrice = filterByPrice(loadedProducts, filterParams.freeOnly);

        const finalProducts = getIntersection(byCompatible, byCategories, bySearch, byPrice);
        const forCategories = getIntersection(byCompatible, bySearch, byPrice);
        const categories = getUniqueCategories(forCategories);

        set({ finalProducts, categories });
      },
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
