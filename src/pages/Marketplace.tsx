import { useEffect } from 'react';
import { Box, Typography, Stack, Collapse, Chip, Skeleton, Card as MuiCard } from '@mui/material';
import { useAppList } from '@features/apps/hooks';
import { useMarketplaceFilters } from '@stores/marketplace-filters';
import { MarketplaceSearch, CategoryChips, MarketplaceGrid, MarketplaceEmpty } from '@features/marketplace';
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
} from '@features/marketplace/api/ProductService';

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
      <Box sx={{ p: 2.5, flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <Skeleton variant="rounded" width={56} height={56} sx={{ borderRadius: 2, flexShrink: 0 }} />
          <Box sx={{ flex: 1 }}>
            <Skeleton variant="text" width="70%" height={24} />
            <Skeleton variant="text" width="90%" height={18} sx={{ mt: 0.5 }} />
            <Skeleton variant="text" width="60%" height={18} />
          </Box>
        </Stack>
      </Box>
      <Box sx={{ px: 2.5, pb: 2.5, pt: 0 }}>
        <Skeleton variant="rounded" height={40} sx={{ borderRadius: 2 }} />
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
    toggleFilter,
    showFilter,
    finalProducts,
    applyFilters,
  } = useMarketplaceFilters();

  // Re-apply filters whenever products or filter params change
  useEffect(() => {
    if (products && products.length > 0) {
      applyFilters(products);
    }
  }, [products, filterParams, applyFilters]);

  const totalApps = products?.length ?? 0;

  const productCards = (finalProducts ?? []).map((app: any) => {
    const rdName = getReverseDomainName(app);
    const matchedApp = appList?.find((o: any) => o.appKey.name === rdName);
    return (
      <Card
        key={rdName ?? app?.id}
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
      {/* Header */}
      <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 1 }}>
        <Typography variant="h4" fontWeight={800}>
          FLECS Marketplace
        </Typography>
        {totalApps > 0 && (
          <Chip
            label={`${totalApps}+ Apps`}
            size="small"
            sx={{
              fontWeight: 600,
              fontSize: '0.75rem',
              height: 26,
              bgcolor: 'action.selected',
            }}
          />
        )}
      </Stack>

      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Choose from our curated collection of industry-leading applications
      </Typography>

      {/* Category chips — always visible */}
      <Box sx={{ mb: 2.5 }}>
        <CategoryChips
          categories={categories ?? []}
          hiddenCategories={filterParams.hiddenCategories ?? []}
          onToggle={setCategoryFilter}
        />
      </Box>

      {/* Search + filters */}
      <Stack spacing={2} sx={{ mb: 3 }}>
        <MarketplaceSearch
          value={filterParams.search}
          onSearch={setSearchFilter}
          onToggleFilter={toggleFilter}
        />

        <Collapse in={showFilter}>
          <Chip
            label="Available only"
            variant={filterParams.available ? 'filled' : 'outlined'}
            color={filterParams.available ? 'primary' : 'default'}
            size="small"
            onClick={setAvailableFilter}
            sx={{ alignSelf: 'flex-start' }}
          />
        </Collapse>
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
