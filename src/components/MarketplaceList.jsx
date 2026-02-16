/*
 * Copyright (c) 2021 FLECS Technologies GmbH
 *
 * Created on Tue Nov 30 2021
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React, { useContext, useState } from 'react';
import PropTypes from 'prop-types';
import Card from './apps/cards/Card';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import { Box } from '@mui/material';
import TablePagination from '@mui/material/TablePagination';
import SearchBar from './SearchBar';
import CloudOffIcon from '@mui/icons-material/CloudOff';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
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
} from '../api/marketplace/ProductService';
import { CircularProgress, Collapse, Typography } from '@mui/material';
import { AppFilter } from './AppFilter';
import { ReferenceDataContext } from '@contexts/data/ReferenceDataContext';
import { getInstalledVersions } from '../data/AppList';
import { FilterContext } from '@contexts/data/FilterContext';
import usePagination from '../hooks/usePagination';
import PoweredByFLECS from './navigation/PoweredBy';

const MarketplaceList = (props) => {
  const [products, setProducts] = useState();
  const [expandedGroups, setExpandedGroups] = useState({
    installed: true,
    allApps: true,
  });
  const { appList, loadedProducts, appListError } = useContext(ReferenceDataContext);
  const [loading, setLoading] = useState(true);
  const {
    categories,
    filterParams,
    setFilterParams,
    getFilteredProducts,
    setAvailableFilter,
    setCategoryFilter,
    setSearchFilter,
    isSearchEnabled,
    setIsSearchEnabled,
    toggleFilter,
    showFilter,
    finalProducts,
  } = React.useContext(FilterContext);
  const { page, rowsPerPage, handleChangePage, handleChangeRowsPerPage } = usePagination(
    'marketplaceApps',
    0,
    100,
  );

  const createFinalProducts = () => {
    const productCards = createProductCards(finalProducts);
    setProducts(productCards);
  };

  const createProductCards = (newProducts) => {
    let productCards = [];
    if (newProducts && !appListError) {
      productCards = newProducts.map((app) => (
        <Card
          key={getReverseDomainName(app) ? getReverseDomainName(app) : app?.id}
          appKey={{
            name: getReverseDomainName(app),
            version: appList?.find((o) => o.appKey.name === getReverseDomainName(app))?.appKey
              .version,
          }}
          avatar={getAppIcon(app)}
          title={app.name}
          author={getAuthor(app)}
          short_description={getShortDescription(app)}
          description={getDescription(app)}
          status={
            appList?.find((o) => o.appKey.name === getReverseDomainName(app))?.status ||
            'uninstalled'
          }
          availability={app.stock_status}
          relatedLinks={getCustomLinks(app)}
          requirement={getRequirement(app)}
          versions={getVersions(app)}
          id={getId(app)}
          categories={getCategories(app)}
          average_rating={getAverageRating(app)}
          rating_count={getRatingCount(app)}
          blacklist={getBlacklist(app)}
          installedVersions={getInstalledVersions(appList, getReverseDomainName(app))}
          permalink={getPermalink(app)}
          price={getPrice(app)}
          purchasable={getPurchasable(app)}
          documentationUrl={getDocumentationUrl(app)}
          instances={appList?.find((o) => o.appKey.name === getReverseDomainName(app))?.instances}
        />
      ));
      return productCards;
    }
  };

  const updateProductCards = () => {
    if (products && appList) {
      const updatedProducts = products.map((app) => ({
        ...app,
        props: {
          ...app.props,
          status:
            appList?.find((o) => o.appKey.name === app.props.appKey.name)?.status || 'uninstalled',
          version: appList?.find((o) => o.appKey.name === app.props.appKey.name)?.appKey.version,
          installedVersions: getInstalledVersions(appList, app.props.appKey.name),
          instances: appList?.find((o) => o.appKey.name === app.props.appKey.name)?.instances,
        },
      }));
      setProducts(updatedProducts);
    }
  };

  React.useEffect(() => {
    // loadedProducts received, ready to start filtering
    setFilterParams((previousState) => {
      return { ...previousState, caller: 'loadProducts' };
    });
  }, [loadedProducts]);

  React.useEffect(() => {
    // initial app loading, or filters got updated
    if (loadedProducts?.length > 0) {
      getFilteredProducts(loadedProducts);
      setLoading(false);
    }
  }, [filterParams]);

  React.useEffect(() => {
    // filtered apps received
    createFinalProducts();
    handleChangePage('', 0);
  }, [finalProducts]);

  React.useEffect(() => {
    // when apps get installed, uninstalled ou updated
    if (!loading) {
      updateProductCards();
    }
  }, [appList]);

  const toggleGroup = (groupName) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [groupName]: !prev[groupName],
    }));
  };

  const renderGroupedProducts = () => {
    const paginatedProducts = products?.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

    if (!paginatedProducts) return null;

    // Separate installed and all apps
    const installedApps = paginatedProducts.filter(
      (product) => product.props.installedVersions?.length > 0,
    );
    const allApps = paginatedProducts.filter(
      (product) => !product.props.installedVersions || product.props.installedVersions.length === 0,
    );

    return (
      <>
        {/* Installed Apps Group */}
        {installedApps.length > 0 && (
          <React.Fragment>
            <Grid size={{ xs: 12 }} sx={{ mt: 3, mb: 1, ml: 2 }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  cursor: 'pointer',
                  '&:hover': { opacity: 0.7 },
                }}
                onClick={() => toggleGroup('installed')}
              >
                <Box sx={{ mr: 1, display: 'flex', alignItems: 'center' }}>
                  {expandedGroups.installed ? <ExpandMoreIcon /> : <ChevronRightIcon />}
                </Box>
                <Typography variant="h5" component="h2">
                  Installed
                </Typography>
              </Box>
            </Grid>
            <Collapse in={expandedGroups.installed} timeout="auto" unmountOnExit>
              <Grid container size={{ xs: 12 }}>
                {installedApps}
              </Grid>
            </Collapse>
          </React.Fragment>
        )}

        {/* All Apps Group */}
        <React.Fragment>
          <Grid size={{ xs: 12 }} sx={{ mt: 3, mb: 1, ml: 2 }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                cursor: 'pointer',
                '&:hover': { opacity: 0.7 },
              }}
              onClick={() => toggleGroup('allApps')}
            >
              <Box sx={{ mr: 1, display: 'flex', alignItems: 'center' }}>
                {expandedGroups.allApps ? <ExpandMoreIcon /> : <ChevronRightIcon />}
              </Box>
              <Typography variant="h5" component="h2">
                All Apps
              </Typography>
            </Box>
          </Grid>
          <Collapse in={expandedGroups.allApps} timeout="auto" unmountOnExit>
            <Grid container size={{ xs: 12 }}>
              {allApps}
            </Grid>
          </Collapse>
        </React.Fragment>
      </>
    );
  };

  return (
    <Box aria-label="marketplace-apps-list" display="flex">
      <Grid container direction="row" justify="flex-start" alignItems="flex-start">
        <Grid
          size={{ xs: 12 }}
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            flexDirection: 'column',
            mr: 2,
            mb: 2,
          }}
        >
          <SearchBar
            key="search-bar"
            data-testid="search-bar"
            defaultSearchValue={filterParams.search}
            searchTitle="Search apps by author, name or description"
            setToggleFilter={toggleFilter}
            search={setSearchFilter}
          />
          <Collapse key="filter" in={showFilter} timeout="auto" unmountOnExit>
            <AppFilter
              open={showFilter}
              setAvailableFilter={setAvailableFilter}
              availableFilter={filterParams.available}
              setCategoryFilter={setCategoryFilter}
              categories={categories}
              hiddenCategories={filterParams.hiddenCategories}
              search={filterParams.search}
              isSearchEnabled={isSearchEnabled}
              setIsSearchEnabled={setIsSearchEnabled}
            />
          </Collapse>
        </Grid>
        {loading && (
          <Grid
            size={{ xs: 12 }}
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
              mr: 2,
              mb: 2,
              mt: 2,
            }}
          >
            <CircularProgress color="primary"></CircularProgress>
          </Grid>
        )}
        {loading && (
          <Grid
            size={{ xs: 12 }}
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
              mr: 2,
              mb: 2,
            }}
          >
            <Typography>Let&apos;s see what we can find for you in our marketplace...</Typography>
          </Grid>
        )}
        {appListError && !loading && (
          <Grid
            size={{ xs: 12 }}
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
              mr: 2,
              mb: 2,
              mt: 2,
            }}
          >
            <CloudOffIcon fontSize="large" />
          </Grid>
        )}
        {appListError && !loading && (
          <Grid
            size={{ xs: 12 }}
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
              mr: 2,
              mb: 2,
            }}
          >
            <Typography>
              Oops... Sorry, we failed to load apps from the marketplace. Please try again later.
            </Typography>
          </Grid>
        )}
        {renderGroupedProducts()}
        <Grid
          size={{ xs: 12 }}
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            flexDirection: 'column',
            mr: 2,
            mb: 2,
          }}
        >
          <Paper
            data-testid="app-paginator"
            component="form"
            sx={{
              display: 'flex', // Flexbox layout to align items in a row
              justifyContent: 'space-between', // Space between paginator and logo
              alignItems: 'center', // Vertically align items
              width: '100%', // Ensure it takes the full width of the container
              padding: '8px', // Add some padding around the paginator and logo
            }}
          >
            <PoweredByFLECS />
            <TablePagination
              rowsPerPageOptions={[10, 25, 50, 100]}
              component="div"
              count={products?.length || 0}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              labelRowsPerPage="Apps per page:"
            />
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default MarketplaceList;

MarketplaceList.propTypes = {
  app: PropTypes.string,
  avatar: PropTypes.string,
  title: PropTypes.string,
  author: PropTypes.string,
  version: PropTypes.string,
  description: PropTypes.string,
  status: PropTypes.string,
  availability: PropTypes.string,
  instances: PropTypes.array,
  relatedLinks: PropTypes.array,
};
