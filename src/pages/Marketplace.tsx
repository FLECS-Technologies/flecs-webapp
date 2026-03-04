import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Skeleton,
  Card as MuiCard,
  Stack,
  Popover,
  Chip,
  InputBase,
  Paper,
  Divider,
  Checkbox,
  FormControlLabel,
  IconButton,
  Select,
  MenuItem,
} from '@mui/material';
import { SlidersHorizontal, Search, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAppList } from '@shared/hooks/app-queries';
import { useMarketplaceFilters } from '@stores/marketplace-filters';
import { useSystemInfo } from '@shared/hooks/system-queries';
import { MarketplaceGrid, MarketplaceEmpty } from '@features/marketplace';
import Card from '@features/marketplace/components/cards/Card';
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
} from '@shared/api/product-service';

function SkeletonCard() {
  return (
    <MuiCard
      variant="outlined"
      sx={{
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 4,
        overflow: 'hidden',
      }}
    >
      <Box sx={{ p: 3, flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Skeleton variant="rounded" width={64} height={64} sx={{ borderRadius: 2.5, mb: 2.5 }} />
        <Skeleton variant="text" width="55%" height={22} />
        <Skeleton variant="text" width="35%" height={14} sx={{ mt: 0.5 }} />
        <Skeleton variant="text" width="90%" height={16} sx={{ mt: 1.5 }} />
        <Skeleton variant="text" width="70%" height={16} />
        <Stack direction="row" alignItems="center" sx={{ mt: 'auto', pt: 2 }}>
          <Skeleton variant="rounded" width={72} height={28} sx={{ borderRadius: 2 }} />
          <Box sx={{ flex: 1 }} />
          <Skeleton variant="text" width={32} height={16} />
        </Stack>
      </Box>
    </MuiCard>
  );
}

export default function Marketplace() {
  const { appList, products, isLoading, isError } = useAppList();
  const { data: systemInfo } = useSystemInfo();
  const arch = systemInfo?.arch;
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

  const [filterAnchor, setFilterAnchor] = useState<HTMLElement | null>(null);

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

  const productCards = paginatedProducts.map((app: any) => {
    const rdName = getReverseDomainName(app);
    const matchedApp = appList?.find((o: any) => o?.appKey?.name === rdName);
    return (
      <Card
        key={rdName ?? app?.id}
        app={rdName}
        appKey={{ name: rdName, version: matchedApp?.appKey?.version }}
        avatar={getAppIcon(app)}
        title={app.name}
        author={getAuthor(app)}
        short_description={getShortDescription(app)}
        description={getDescription(app)}
        status={matchedApp?.status || 'uninstalled'}
        availability={app.stock_status}
        relatedLinks={getCustomLinks(app)}
        requirement={getRequirement(app)}
        versions={getVersions(app)}
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
    <Box>
      {/* Hero header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={800} sx={{ letterSpacing: '-0.02em' }}>
          Marketplace
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5 }}>
          {totalApps || '...'} apps to extend your device
        </Typography>
      </Box>

      {/* Search bar — hero element */}
      <Paper
        elevation={0}
        sx={{
          display: 'flex',
          alignItems: 'center',
          px: 2.5,
          py: 1.5,
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'divider',
          mb: 3,
          transition: 'border-color 0.2s',
          '&:focus-within': {
            borderColor: 'primary.main',
          },
        }}
      >
        <Search size={20} style={{ opacity: 0.35, marginRight: 14, flexShrink: 0 }} />
        <InputBase
          fullWidth
          placeholder="Search apps, integrations, tools..."
          value={filterParams.search ?? ''}
          onChange={(e) => setSearchFilter(e as any)}
          onKeyDown={(e) => e.key === 'Enter' && e.preventDefault()}
          sx={{ fontSize: '1rem' }}
        />
        {filterParams.search && (
          <Box
            component="button"
            onClick={() => setSearchFilter({ target: { value: '' } } as any)}
            sx={{
              all: 'unset',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              p: 0.5,
              borderRadius: '50%',
              '&:hover': { bgcolor: 'action.hover' },
            }}
          >
            <X size={16} style={{ opacity: 0.5 }} />
          </Box>
        )}
      </Paper>

      {/* Quick filter pills + result count */}
      <Stack
        direction="row"
        spacing={1}
        alignItems="center"
        flexWrap="wrap"
        useFlexGap
        sx={{ mb: 3 }}
      >
        <Typography variant="body2" color="text.secondary" fontWeight={500} sx={{ mr: 0.5 }}>
          {totalFiltered} app{totalFiltered !== 1 ? 's' : ''}
        </Typography>

        <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

        {/* Toggle pills — inline, always visible */}
        <Chip
          label="Compatible"
          size="small"
          variant={filterParams.compatible ? 'filled' : 'outlined'}
          onClick={setCompatibleFilter}
          sx={{
            height: 32,
            fontSize: '0.8rem',
            fontWeight: 600,
            borderRadius: 2,
            borderColor: filterParams.compatible ? 'transparent' : 'divider',
            bgcolor: filterParams.compatible ? 'primary.main' : 'transparent',
            color: filterParams.compatible ? '#fff' : 'text.secondary',
            '&:hover': {
              bgcolor: filterParams.compatible ? 'primary.dark' : 'action.hover',
            },
          }}
        />
        <Chip
          label="Free"
          size="small"
          variant={filterParams.freeOnly ? 'filled' : 'outlined'}
          onClick={setFreeOnlyFilter}
          sx={{
            height: 32,
            fontSize: '0.8rem',
            fontWeight: 600,
            borderRadius: 2,
            borderColor: filterParams.freeOnly ? 'transparent' : 'divider',
            bgcolor: filterParams.freeOnly ? 'primary.main' : 'transparent',
            color: filterParams.freeOnly ? '#fff' : 'text.secondary',
            '&:hover': {
              bgcolor: filterParams.freeOnly ? 'primary.dark' : 'action.hover',
            },
          }}
        />

        {/* Category filter button — opens popover for advanced */}
        <Chip
          icon={<SlidersHorizontal size={14} />}
          label={hiddenCount > 0 ? `Categories (${(categories?.length ?? 0) - hiddenCount})` : 'Categories'}
          size="small"
          variant={hiddenCount > 0 ? 'filled' : 'outlined'}
          onClick={(e) => setFilterAnchor(e.currentTarget as HTMLElement)}
          sx={{
            height: 32,
            fontSize: '0.8rem',
            fontWeight: 600,
            borderRadius: 2,
            borderColor: hiddenCount > 0 ? 'transparent' : 'divider',
            bgcolor: hiddenCount > 0 ? 'primary.main' : 'transparent',
            color: hiddenCount > 0 ? '#fff' : 'text.secondary',
            '& .MuiChip-icon': {
              color: hiddenCount > 0 ? '#fff' : 'text.secondary',
            },
            '&:hover': {
              bgcolor: hiddenCount > 0 ? 'primary.dark' : 'action.hover',
            },
          }}
        />

        {hasFilters && (
          <Chip
            label="Clear all"
            size="small"
            variant="outlined"
            onClick={clearAllFilters}
            deleteIcon={<X size={14} />}
            onDelete={clearAllFilters}
            sx={{
              height: 32,
              fontSize: '0.8rem',
              fontWeight: 500,
              borderRadius: 2,
              borderStyle: 'dashed',
              borderColor: 'divider',
              color: 'text.disabled',
            }}
          />
        )}
      </Stack>

      {/* Category popover */}
      <Popover
        open={Boolean(filterAnchor)}
        anchorEl={filterAnchor}
        onClose={() => setFilterAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        slotProps={{ paper: { sx: { width: 280, borderRadius: 3, mt: 1, p: 0.5 } } }}
      >
        <Box sx={{ p: 2 }}>
          <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5 }}>
            Categories
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            {(categories ?? []).map((cat) => {
              const active = !(filterParams.hiddenCategories ?? []).includes(cat.id);
              return (
                <FormControlLabel
                  key={cat.id}
                  control={
                    <Checkbox
                      size="small"
                      checked={active}
                      onChange={() => setCategoryFilter(cat.id)}
                      sx={{ py: 0.5, px: 1 }}
                    />
                  }
                  label={
                    <Stack direction="row" alignItems="center" spacing={1} sx={{ width: '100%' }}>
                      <Typography variant="body2" fontSize="0.85rem" sx={{ flex: 1 }}>
                        {cat.name}
                      </Typography>
                      <Typography variant="caption" color="text.disabled" fontSize="0.75rem">
                        {cat.count}
                      </Typography>
                    </Stack>
                  }
                  sx={{ mx: 0, width: '100%', '& .MuiFormControlLabel-label': { flex: 1 } }}
                />
              );
            })}
          </Box>
        </Box>
      </Popover>

      {/* Skeleton loading — 6 placeholder cards */}
      {isLoading && (
        <MarketplaceGrid>
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </MarketplaceGrid>
      )}

      {isError && !isLoading && <MarketplaceEmpty error />}

      {!isLoading && !isError && productCards.length === 0 && <MarketplaceEmpty />}

      {!isLoading && productCards.length > 0 && (
        <MarketplaceGrid>{productCards}</MarketplaceGrid>
      )}

      {/* Pagination footer */}
      {!isLoading && totalFiltered > 0 && (
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ mt: 4 }}
        >
          {/* Per-page selector */}
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Typography variant="body2" color="text.secondary">
              Rows per page
            </Typography>
            <Select
              value={pageSize}
              onChange={(e) => setPageSize(e.target.value as number)}
              size="small"
              variant="outlined"
              sx={{
                minWidth: 72,
                height: 32,
                fontSize: '0.8rem',
                fontWeight: 600,
                borderRadius: 2,
                '& .MuiOutlinedInput-notchedOutline': { borderColor: 'divider' },
              }}
            >
              <MenuItem value={20}>20</MenuItem>
              <MenuItem value={50}>50</MenuItem>
              <MenuItem value={100}>100</MenuItem>
            </Select>
          </Stack>

          {/* Page info + nav */}
          <Stack direction="row" alignItems="center" spacing={1}>
            <Typography variant="body2" color="text.secondary" sx={{ fontVariantNumeric: 'tabular-nums' }}>
              {startIdx + 1}–{Math.min(startIdx + pageSize, totalFiltered)} of {totalFiltered}
            </Typography>
            <IconButton
              size="small"
              disabled={safePage === 0}
              onClick={() => setPage(safePage - 1)}
              sx={{
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 2,
                width: 32,
                height: 32,
              }}
            >
              <ChevronLeft size={16} />
            </IconButton>
            <IconButton
              size="small"
              disabled={safePage >= totalPages - 1}
              onClick={() => setPage(safePage + 1)}
              sx={{
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 2,
                width: 32,
                height: 32,
              }}
            >
              <ChevronRight size={16} />
            </IconButton>
          </Stack>
        </Stack>
      )}
    </Box>
  );
}
