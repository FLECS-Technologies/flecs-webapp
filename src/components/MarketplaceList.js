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

import React, { useCallback, useContext, useState } from 'react'
import PropTypes from 'prop-types'
import Card from './Card'
import Grid from '@mui/material/Grid'
import Box from '@mui/material/Box'
import SearchBar from './SearchBar'
import CloudOffIcon from '@mui/icons-material/CloudOff'
import { getAppIcon, getAuthor, getAverageRating, getBlacklist, getCustomLinks, getId, getCategories, getProducts, getRatingCount, getRequirement, getReverseDomainName, getShortDescription, getVersions } from '../api/marketplace/ProductService'
import { CircularProgress, Collapse, Typography } from '@mui/material'
import { AppFilter } from './AppFilter'
import useStateWithLocalStorage from './LocalStorage'
import { ReferenceDataContext } from '../data/ReferenceDataContext'
import { getInstalledVersions } from '../data/AppList'

export default function MarketplaceList (props) {
  const executedRef = React.useRef(false)
  const [products, setProducts] = useState()
  const { appList } = useContext(ReferenceDataContext)
  const [loading, setLoading] = useState(true)
  const [loadingError, setLoadingError] = useState(false)
  const [queryParams, setQueryParams] = useStateWithLocalStorage('marketplace-query', {
    page: undefined,
    per_page: undefined,
    search: undefined,
    order: undefined,
    orderby: undefined,
    status: undefined,
    stock_status: undefined
  })
  const [categories, setCategories] = useState([])
  const [hiddenCategories, setHiddenCategories] = useStateWithLocalStorage('hidden-categories', [])
  const [hiddenHasUpdated, setHiddenHasUpdated] = useState(false)
  const [showFilter, setToggleFilter] = useStateWithLocalStorage('marketplace-filter', false)

  function setAvailableFilter () {
    setQueryParams(previousState => {
      return { ...previousState, stock_status: (queryParams.stock_status === 'instock' ? undefined : 'instock') }
    })
    setLoading(true)
    executedRef.current = false
  }

  function handleSetHiddenCategories (category) {
    const newHiddenCategories = hiddenCategories.includes(category) ? hiddenCategories.filter(c => c !== category) : [...hiddenCategories, category]
    newHiddenCategories.sort((a, b) => (a - b)) // sorts array numerically
    setHiddenHasUpdated(true)
    setHiddenCategories(newHiddenCategories)
  }

  function setSearchFilter (event, reason) {
    setQueryParams(previousState => {
      return { ...previousState, search: reason }
    })
    setLoading(true)
    executedRef.current = false
  }

  function toggleFilter () {
    setToggleFilter(!showFilter)
  }

  const getCleanName = (name) => {
    if (name.includes('&amp;')) { return name.replace('&amp;', '&') }
    return name
  }

  const getUniqueCategories = (loadedProducts) => {
    const categoriesArray = []
    const productCategories = loadedProducts.map(p => p.categories)
    for (let i = 0; i < productCategories.length; i++) {
      const index = categoriesArray.findIndex(c => c.id === productCategories[i][1].id) // skipping [i][0] as this is the parent category "App"
      if (index > -1) { // category already existent
        categoriesArray[index].count++
      } else { // new category found
        categoriesArray.push({
          id: productCategories[i][1].id,
          name: getCleanName(productCategories[i][1].name),
          count: 1
        })
      }
    }
    categoriesArray.sort((a, b) => a.name < b.name ? -1 : 1) // sorts categories alphabetically
    setCategories(categoriesArray)
  }

  const isHidden = (productCategories) => {
    const productCategory = productCategories?.filter(p => p.id !== 27) // removes the "App" category (id 27)
    const categoryId = productCategory?.map(p => p.id)[0]
    return hiddenCategories.includes(categoryId)
  }

  const loadProducts = useCallback(async () => {
    try {
      getProducts(queryParams)
        .then(
          (loadedProducts) => {
            try {
              loadedProducts.sort((a, b) => (a.name.toLowerCase() > b.name.toLowerCase()) ? 1 : ((b.name.toLowerCase() > a.name.toLowerCase()) ? -1 : 0))

              getUniqueCategories(loadedProducts)
              const productCards = createProductCards(loadedProducts)
              setProducts(productCards)
              setLoadingError(false)
            } catch (error) { console.log(error) }
          },
          error => {
            const resMessage =
          (error.response &&
            error.response.data &&
            error.response.data.reason) ||
          error.message ||
          error.toString()
            console.log(resMessage)
            setLoadingError(true)
          }
        )
        .finally(function () { setLoading(false) })
    } catch (error) {
      console.log(error.response)
    }
  }, [queryParams, appList, hiddenCategories])

  function createProductCards (newProducts) {
    let productCards = []
    if (newProducts) {
      productCards = newProducts.map((app) => (
        <Card
          key={getReverseDomainName(app) ? getReverseDomainName(app) : app?.id}
          appKey={{
            name: getReverseDomainName(app),
            version: appList?.find(o => o.appKey.name === getReverseDomainName(app))?.appKey.version
          }}
          avatar={getAppIcon(app)}
          title={app.name}
          author={getAuthor(app)}
          description={getShortDescription(app)}
          status={appList?.find(o => o.appKey.name === getReverseDomainName(app))?.status || 'uninstalled'}
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
          hidden={isHidden(getCategories(app))}
        />
      ))
      return productCards
    }
  }

  function updateProductCards () {
    if (products && appList && !hiddenHasUpdated) {
      const updatedProducts = products.map((app) => ({
        ...app,
        props: {
          ...app.props,
          status: appList?.find(o => o.appKey.name === app.props.appKey.name)?.status || 'uninstalled',
          version: appList?.find(o => o.appKey.name === app.props.appKey.name)?.appKey.version,
          installedVersions: getInstalledVersions(appList, app.props.appKey.name)
        }
      }))
      setProducts(updatedProducts)
    } else if (products && appList && hiddenHasUpdated) {
      const updatedProducts = products.map((app) => ({
        ...app,
        props: {
          ...app.props,
          hidden: isHidden(getCategories(app.props))
        }
      }))
      setHiddenHasUpdated(false)
      setProducts(updatedProducts)
    }
  }

  React.useEffect(() => {
    if (!loading) {
      // update the product cards if the view is currently not loading
      updateProductCards()
    } else {
      // else create the product cards and make sure we only run it once
      if (executedRef.current) { return }
      loadProducts(appList)
      executedRef.current = true
    }
  }, [appList, queryParams, hiddenCategories])

  return (
  <Box aria-label="marketplace-apps-list" display="flex">
      <Grid
        container
        direction="row"
        justify="flex-start"
        alignItems="flex-start"
      >
        <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'space-between', flexDirection: 'column', mr: 2, mb: 2 }}>

              <SearchBar key='search-bar' data-testid='search-bar' defaultSearchValue={queryParams.search} searchTitle='Search apps' setToggleFilter={toggleFilter} search={setSearchFilter}/>
              <Collapse key='filter' in={showFilter} timeout="auto" unmountOnExit>
                <AppFilter open={showFilter} setAvailableFilter={setAvailableFilter} availableFilter={(queryParams.stock_status === 'instock')} handleSetHiddenCategories={handleSetHiddenCategories} categories={categories} hiddenCategories={hiddenCategories} />
              </Collapse>

        </Grid>
        {loading && (
          <Grid item xs={12} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', mr: 2, mb: 2, mt: 2 }}>
            <CircularProgress color='primary'></CircularProgress>
          </Grid>
        )}
        {loading && (
          <Grid item xs={12} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', mr: 2, mb: 2 }}>
            <Typography>Let&apos;s see what we can find for you in our marketplace...</Typography>
          </Grid>
        )}
        {(loadingError && !loading) &&
        (<Grid item xs={12} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', mr: 2, mb: 2, mt: 2 }}>
          <CloudOffIcon fontSize='large'/>
        </Grid>)}
        {(loadingError && !loading) &&
        (<Grid item xs={12} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', mr: 2, mb: 2 }}>
            <Typography>Oops... Sorry, we failed to load apps from the marketplace. Please try again later.</Typography>
          </Grid>)
        }
        { products?.filter(p => !p.props.hidden) }
      </Grid>
    </Box>
  )
}

MarketplaceList.propTypes = {
  appData: PropTypes.any,
  app: PropTypes.string,
  avatar: PropTypes.string,
  title: PropTypes.string,
  author: PropTypes.string,
  version: PropTypes.string,
  description: PropTypes.string,
  status: PropTypes.string,
  availability: PropTypes.string,
  instances: PropTypes.array,
  relatedLinks: PropTypes.array
}
