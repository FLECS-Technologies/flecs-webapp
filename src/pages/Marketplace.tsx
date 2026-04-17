import { useEffect, useState, useRef } from 'react';
import { SlidersHorizontal, Search, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAppList } from '@features/apps/app-queries';
import { useMarketplaceFilters } from '@stores/marketplace-filters';
import { useGetSystemInfo } from '@generated/core/system/system';
import type { Product } from '@generated/console/schemas';
import { AppStatus } from '@generated/core/schemas';
import MarketplaceGrid from '@features/marketplace/components/MarketplaceGrid';
import MarketplaceEmpty from '@features/marketplace/components/MarketplaceEmpty';
import Card from '@features/marketplace/components/Card';
import {
  getAppIcon,
  getAuthor,
  getAverageRating,
  getBlacklist,
  getCustomLinks,
  getId,
  getCategories,
  getRatingCount,
  getRequirement,
  getReverseDomainName,
  getShortDescription,
  getVersions,
  getPermalink,
  getPrice,
  getPurchasable,
  getDocumentationUrl,
  getDescription,
} from '@features/marketplace/api/product-service';

function SkeletonCard() {
  return (
    <div className="flex flex-col rounded-2xl border border-white/10 overflow-hidden">
      <div className="p-6 flex-1 flex flex-col">
        <div className="animate-pulse bg-white/10 rounded-xl w-16 h-16 mb-5" />
        <div className="animate-pulse bg-white/10 rounded h-5 w-[55%]" />
        <div className="animate-pulse bg-white/10 rounded h-3.5 w-[35%] mt-1" />
        <div className="animate-pulse bg-white/10 rounded h-4 w-[90%] mt-3" />
        <div className="animate-pulse bg-white/10 rounded h-4 w-[70%] mt-1" />
        <div className="flex items-center mt-auto pt-4">
          <div className="animate-pulse bg-white/10 rounded-lg w-18 h-7" />
          <div className="flex-1" />
          <div className="animate-pulse bg-white/10 rounded h-4 w-8" />
        </div>
      </div>
    </div>
  );
}

export default function Marketplace() {
  const { appList, products, isLoading } = useAppList();
  const { data: infoResponse } = useGetSystemInfo({ query: { staleTime: 60_000 } });
  const arch = infoResponse?.data?.arch;
  const {
    categories,
    filterParams,
    setCategoryFilter,
    setSearchFilter,
    setCompatibleFilter,
    setFreeOnlyFilter,
    setPageSize,
    setPage,
    page,
    finalProducts,
    applyFilters,
  } = useMarketplaceFilters();

  const [filterOpen, setFilterOpen] = useState(false);
  const filterBtnRef = useRef<HTMLButtonElement>(null);
  const filterDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    if (!filterOpen) return;
    const handler = (e: MouseEvent) => {
      if (
        filterDropdownRef.current &&
        !filterDropdownRef.current.contains(e.target as Node) &&
        filterBtnRef.current &&
        !filterBtnRef.current.contains(e.target as Node)
      ) {
        setFilterOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [filterOpen]);

  // Re-apply filters whenever products or filter params change
  useEffect(() => {
    if (products && products.length > 0) {
      applyFilters(products, arch);
    }
  }, [products, filterParams, applyFilters, arch]);

  const totalApps = products?.length ?? 0;
  const hiddenCount = filterParams.hiddenCategories?.length ?? 0;
  const activeFilterCount =
    (hiddenCount > 0 ? 1 : 0) + (filterParams.compatible ? 1 : 0) + (filterParams.freeOnly ? 1 : 0);
  const hasFilters = activeFilterCount > 0;

  const clearAllFilters = () => {
    if (filterParams.compatible) setCompatibleFilter();
    if (filterParams.freeOnly) setFreeOnlyFilter();
    (filterParams.hiddenCategories ?? []).forEach((id: number) => setCategoryFilter(id));
  };

  const allFiltered = finalProducts ?? [];
  const totalFiltered = allFiltered.length;
  const pageSize = filterParams.pageSize || 20;
  const totalPages = Math.ceil(totalFiltered / pageSize);
  const safePage = Math.min(page, Math.max(totalPages - 1, 0));
  const startIdx = safePage * pageSize;
  const paginatedProducts = allFiltered.slice(startIdx, startIdx + pageSize);

  const productCards = paginatedProducts.map((app: Product) => {
    const rdName = getReverseDomainName(app);
    const matchedApp = appList?.find((o) => o?.appKey?.name === rdName);
    return (
      <Card
        key={rdName ?? app?.id}
        app={rdName}
        appKey={{ name: rdName ?? '', version: matchedApp?.appKey?.version ?? '' }}
        avatar={getAppIcon(app)}
        title={app.name}
        author={getAuthor(app)}
        short_description={getShortDescription(app)}
        description={getDescription(app)}
        status={matchedApp?.status ?? AppStatus.not_installed}
        availability={app.stock_status}
        relatedLinks={getCustomLinks(app)}
        requirement={getRequirement(app)}
        versions={(getVersions(app) ?? []).map((v: string) => ({ version: v, installed: matchedApp?.installedVersions?.includes(v) ?? false }))}
        id={getId(app)}
        categories={getCategories(app)}
        average_rating={getAverageRating(app)}
        rating_count={getRatingCount(app)}
        blacklist={getBlacklist(app)}
        installedVersions={matchedApp?.installedVersions}
        permalink={getPermalink(app)}
        price={getPrice(app)}
        purchasable={getPurchasable(app)}
        documentationUrl={getDocumentationUrl(app)}
        instances={matchedApp?.instances}
      />
    );
  });

  return (
    <div>
      {/* Hero header */}
      <div className="mb-8">
        <h4 className="text-2xl font-extrabold tracking-tight">Marketplace</h4>
        <p className="text-base text-muted mt-1">{totalApps || '...'} apps to extend your device</p>
      </div>

      {/* Search bar */}
      <div className="flex items-center px-5 py-3 rounded-xl border border-white/10 mb-6 transition focus-within:border-brand">
        <Search size={20} className="opacity-35 mr-3.5 shrink-0" />
        <input
          type="text"
          className="flex-1 bg-transparent outline-none text-base placeholder:text-muted"
          placeholder="Search apps, integrations, tools..."
          value={filterParams.search ?? ''}
          onChange={(e) => setSearchFilter(e)}
          onKeyDown={(e) => e.key === 'Enter' && e.preventDefault()}
        />
        {filterParams.search && (
          <button
            onClick={() => setSearchFilter({ target: { value: '' } } as React.ChangeEvent<HTMLInputElement>)}
            className="p-1 rounded-full hover:bg-white/10 transition"
          >
            <X size={16} className="opacity-50" />
          </button>
        )}
      </div>

      {/* Quick filter pills + result count */}
      <div className="flex items-center flex-wrap gap-2 mb-6">
        <p className="text-sm text-muted font-medium mr-1">
          {totalFiltered} app{totalFiltered !== 1 ? 's' : ''}
        </p>

        <div className="w-px h-5 bg-white/10 mx-1" />

        {/* Toggle pills */}
        <button
          onClick={setCompatibleFilter}
          className={`h-8 px-3 text-[0.8rem] font-semibold rounded-lg transition ${
            filterParams.compatible
              ? 'bg-brand text-white'
              : 'border border-white/10 text-muted hover:bg-white/5'
          }`}
        >
          Compatible
        </button>
        <button
          onClick={setFreeOnlyFilter}
          className={`h-8 px-3 text-[0.8rem] font-semibold rounded-lg transition ${
            filterParams.freeOnly
              ? 'bg-brand text-white'
              : 'border border-white/10 text-muted hover:bg-white/5'
          }`}
        >
          Free
        </button>

        {/* Category filter button */}
        <div className="relative">
          <button
            ref={filterBtnRef}
            onClick={() => setFilterOpen(!filterOpen)}
            className={`inline-flex items-center gap-1.5 h-8 px-3 text-[0.8rem] font-semibold rounded-lg transition ${
              hiddenCount > 0
                ? 'bg-brand text-white'
                : 'border border-white/10 text-muted hover:bg-white/5'
            }`}
          >
            <SlidersHorizontal size={14} />
            {hiddenCount > 0
              ? `Categories (${(categories?.length ?? 0) - hiddenCount})`
              : 'Categories'}
          </button>

          {/* Category dropdown */}
          {filterOpen && (
            <div
              ref={filterDropdownRef}
              className="absolute top-full left-0 mt-2 w-70 rounded-xl bg-dark-end border border-white/10 shadow-xl z-50 p-4"
            >
              <p className="text-sm font-bold mb-3">Categories</p>
              <div className="flex flex-col gap-0.5">
                {(categories ?? []).map((cat) => {
                  const active = !(filterParams.hiddenCategories ?? []).includes(cat.id);
                  return (
                    <label
                      key={cat.id}
                      className="flex items-center gap-2 py-1 px-1 rounded hover:bg-white/5 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={active}
                        onChange={() => setCategoryFilter(cat.id)}
                        className="accent-brand w-4 h-4"
                      />
                      <span className="flex-1 text-sm">{cat.name}</span>
                      <span className="text-xs text-muted">{cat.count}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {hasFilters && (
          <button
            onClick={clearAllFilters}
            className="inline-flex items-center gap-1 h-8 px-3 text-[0.8rem] font-medium rounded-lg border border-dashed border-white/10 text-muted hover:bg-white/5 transition"
          >
            Clear all
            <X size={14} />
          </button>
        )}
      </div>

      {/* Skeleton loading */}
      {isLoading && (
        <MarketplaceGrid>
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </MarketplaceGrid>
      )}

      {!isLoading && productCards.length === 0 && <MarketplaceEmpty />}

      {!isLoading && productCards.length > 0 && (
        <MarketplaceGrid>{productCards}</MarketplaceGrid>
      )}

      {/* Pagination footer */}
      {!isLoading && totalFiltered > 0 && (
        <div className="flex items-center justify-between mt-8">
          {/* Per-page selector */}
          <div className="flex items-center gap-3">
            <p className="text-sm text-muted">Rows per page</p>
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="h-8 min-w-[72px] px-2 text-[0.8rem] font-semibold rounded-lg border border-white/10 bg-transparent outline-none"
            >
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>

          {/* Page info + nav */}
          <div className="flex items-center gap-2">
            <p className="text-sm text-muted tabular-nums">
              {startIdx + 1}–{Math.min(startIdx + pageSize, totalFiltered)} of {totalFiltered}
            </p>
            <button
              disabled={safePage === 0}
              onClick={() => setPage(safePage - 1)}
              className="w-8 h-8 flex items-center justify-center border border-white/10 rounded-lg hover:bg-white/5 transition disabled:opacity-30"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              disabled={safePage >= totalPages - 1}
              onClick={() => setPage(safePage + 1)}
              className="w-8 h-8 flex items-center justify-center border border-white/10 rounded-lg hover:bg-white/5 transition disabled:opacity-30"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
