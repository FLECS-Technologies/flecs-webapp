import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Skeleton,
  Card as MuiCard,
  Stack,
  Button,
  Popover,
  Chip,
  Switch,
  InputBase,
  Paper,
  Divider,
  Checkbox,
  FormControlLabel,
} from '@mui/material';
import { SlidersHorizontal, Search, X } from 'lucide-react';
import { useAppList } from '@shared/hooks/app-queries';
import { useMarketplaceFilters } from '@stores/marketplace-filters';
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
        borderRadius: 3,
        overflow: 'hidden',
      }}
    >
      <Box sx={{ p: 2.5, pb: 0, flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Stack direction="row" spacing={1.5} alignItems="flex-start">
          <Skeleton variant="rounded" width={44} height={44} sx={{ borderRadius: 1.5, flexShrink: 0 }} />
          <Box sx={{ flex: 1 }}>
            <Skeleton variant="text" width="60%" height={18} />
            <Skeleton variant="text" width="90%" height={14} sx={{ mt: 0.5 }} />
            <Skeleton variant="text" width="70%" height={14} />
          </Box>
        </Stack>
        <Box sx={{ mt: 'auto', pt: 2, pb: 2 }}>
          <Stack direction="row" spacing={0.75} alignItems="center">
            <Skeleton variant="text" width="28%" height={12} />
            <Skeleton variant="circular" width={10} height={10} />
            <Skeleton variant="text" width="12%" height={12} />
            <Box sx={{ flex: 1 }} />
            <Skeleton variant="rounded" width={36} height={20} sx={{ borderRadius: 2 }} />
          </Stack>
          <Stack direction="row" spacing={0.5} sx={{ mt: 1 }}>
            <Skeleton variant="rounded" width={52} height={20} sx={{ borderRadius: 2 }} />
            <Skeleton variant="rounded" width={64} height={20} sx={{ borderRadius: 2 }} />
          </Stack>
        </Box>
      </Box>
      <Box sx={{
        bgcolor: (theme: any) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.04)' : 'grey.50',
        borderTop: '1px solid',
        borderColor: 'divider',
        px: 2.5,
        py: 1.5,
      }}>
        <Skeleton variant="rounded" height={40} sx={{ borderRadius: 1.5 }} />
      </Box>
    </MuiCard>
  );
}

export default function Marketplace() {
  const { appList, products, isLoading, isError } = useAppList();
  const {
    categories,
    filterParams,
    setCategoryFilter,
    setSearchFilter,
    setAvailableFilter,
    setFreeOnlyFilter,
    finalProducts,
    applyFilters,
  } = useMarketplaceFilters();

  const [filterAnchor, setFilterAnchor] = useState<HTMLElement | null>(null);

  // Re-apply filters whenever products or filter params change
  useEffect(() => {
    if (products && products.length > 0) {
      applyFilters(products);
    }
  }, [products, filterParams, applyFilters]);

  const totalApps = products?.length ?? 0;
  const hiddenCount = filterParams.hiddenCategories?.length ?? 0;
  const activeFilterCount =
    (hiddenCount > 0 ? 1 : 0) + (filterParams.available ? 1 : 0) + (filterParams.freeOnly ? 1 : 0);
  const hasFilters = activeFilterCount > 0;

  const clearAllFilters = () => {
    if (filterParams.available) setAvailableFilter();
    if (filterParams.freeOnly) setFreeOnlyFilter();
    (filterParams.hiddenCategories ?? []).forEach((id: number) => setCategoryFilter(id));
  };

  const productCards = (finalProducts ?? []).map((app: any) => {
    const rdName = getReverseDomainName(app);
    const matchedApp = appList?.find((o: any) => o?.appKey?.name === rdName);
    return (
      <Card
        key={rdName ?? app?.id}
        app={rdName}
        appKey={{ name: rdName, version: matchedApp?.appKey.version }}
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
      {/* Header row */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="overline" color="text.disabled" fontWeight={600}>
          MARKETPLACE
        </Typography>
        <Typography variant="h4" fontWeight={800}>
          Browse Apps
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5 }}>
          Extend your device with {totalApps || '...'} integrations.
        </Typography>
      </Box>

      {/* Search + filter bar */}
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
        <Paper
          sx={{
            display: 'flex',
            alignItems: 'center',
            px: 1.5,
            py: 0.75,
            borderRadius: 2,
            flex: 1,
            border: '1px solid',
            borderColor: 'divider',
            boxShadow: 'none',
          }}
        >
          <Search size={18} style={{ opacity: 0.4, marginRight: 10, flexShrink: 0 }} />
          <InputBase
            fullWidth
            placeholder="Search apps..."
            value={filterParams.search ?? ''}
            onChange={(e) => setSearchFilter(e as any)}
            onKeyDown={(e) => e.key === 'Enter' && e.preventDefault()}
            sx={{ fontSize: '0.875rem' }}
          />
        </Paper>

        <Button
          variant="outlined"
          size="small"
          startIcon={<SlidersHorizontal size={15} />}
          onClick={(e) => setFilterAnchor(e.currentTarget)}
          sx={{
            textTransform: 'none',
            fontWeight: 600,
            fontSize: '0.8rem',
            borderRadius: 2,
            px: 1.5,
            borderColor: hasFilters ? 'primary.main' : 'divider',
            color: hasFilters ? 'primary.main' : 'text.secondary',
            whiteSpace: 'nowrap',
          }}
        >
          Filters{hasFilters ? ` (${activeFilterCount})` : ''}
        </Button>

        {/* Filter popover */}
        <Popover
          open={Boolean(filterAnchor)}
          anchorEl={filterAnchor}
          onClose={() => setFilterAnchor(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          slotProps={{ paper: { sx: { width: 300, borderRadius: 2.5, mt: 0.5 } } }}
        >
          <Box sx={{ p: 2 }}>
            {/* Header */}
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
              <Typography variant="subtitle2" fontWeight={700} fontSize="0.85rem">
                Filters
              </Typography>
              {hasFilters && (
                <Button
                  size="small"
                  onClick={clearAllFilters}
                  sx={{ textTransform: 'none', fontSize: '0.75rem', fontWeight: 500, minWidth: 0, px: 1 }}
                >
                  Clear all
                </Button>
              )}
            </Stack>

            {/* Categories */}
            <Typography variant="overline" color="text.disabled" sx={{ fontSize: '0.6rem', letterSpacing: '0.08em', display: 'block', mb: 0.75 }}>
              Category
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
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
                        sx={{ py: 0.25, px: 1 }}
                      />
                    }
                    label={
                      <Stack direction="row" alignItems="center" spacing={1} sx={{ width: '100%' }}>
                        <Typography variant="body2" fontSize="0.8rem" sx={{ flex: 1 }}>
                          {cat.name}
                        </Typography>
                        <Typography variant="caption" color="text.disabled" fontSize="0.7rem">
                          {cat.count}
                        </Typography>
                      </Stack>
                    }
                    sx={{ mx: 0, width: '100%', '& .MuiFormControlLabel-label': { flex: 1 } }}
                  />
                );
              })}
            </Box>

            <Divider sx={{ my: 1.5 }} />

            {/* Toggles */}
            <Stack spacing={1.5}>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="body2" fontWeight={600} fontSize="0.8rem">
                    Compatible only
                  </Typography>
                  <Typography variant="caption" color="text.disabled" fontSize="0.7rem">
                    Match your device architecture
                  </Typography>
                </Box>
                <Switch
                  size="small"
                  checked={filterParams.available}
                  onChange={setAvailableFilter}
                />
              </Stack>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="body2" fontWeight={600} fontSize="0.8rem">
                    Free only
                  </Typography>
                  <Typography variant="caption" color="text.disabled" fontSize="0.7rem">
                    Hide paid apps
                  </Typography>
                </Box>
                <Switch
                  size="small"
                  checked={filterParams.freeOnly}
                  onChange={setFreeOnlyFilter}
                />
              </Stack>
            </Stack>
          </Box>
        </Popover>
      </Stack>

      {/* Active filter chips + result count */}
      <Stack direction="row" spacing={0.75} alignItems="center" flexWrap="wrap" sx={{ mb: 2, gap: 0.75 }}>
        <Typography variant="body2" color="text.secondary" fontSize="0.8rem">
          {productCards.length} app{productCards.length !== 1 ? 's' : ''}
        </Typography>
        {hasFilters && (
          <>
            <Typography variant="body2" color="text.disabled" fontSize="0.8rem">
              &middot;
            </Typography>
            {filterParams.available && (
              <Chip
                label="Compatible"
                size="small"
                onDelete={setAvailableFilter}
                deleteIcon={<X size={12} />}
                sx={{ height: 24, fontSize: '0.75rem', fontWeight: 500 }}
              />
            )}
            {filterParams.freeOnly && (
              <Chip
                label="Free"
                size="small"
                onDelete={setFreeOnlyFilter}
                deleteIcon={<X size={12} />}
                sx={{ height: 24, fontSize: '0.75rem', fontWeight: 500 }}
              />
            )}
            {hiddenCount > 0 && (
              <Chip
                label={`${(categories?.length ?? 0) - hiddenCount} of ${categories?.length ?? 0} categories`}
                size="small"
                onDelete={() => {
                  (filterParams.hiddenCategories ?? []).forEach((id: number) => setCategoryFilter(id));
                }}
                deleteIcon={<X size={12} />}
                sx={{ height: 24, fontSize: '0.75rem', fontWeight: 500 }}
              />
            )}
            <Chip
              label="Clear all"
              size="small"
              variant="outlined"
              onClick={clearAllFilters}
              sx={{ height: 24, fontSize: '0.75rem', fontWeight: 500, borderStyle: 'dashed' }}
            />
          </>
        )}
      </Stack>

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
    </Box>
  );
}
