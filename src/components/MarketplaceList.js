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

import React, { useCallback, useState } from 'react'
import PropTypes from 'prop-types'
import Card from './Card'
import Grid from '@mui/material/Grid'
import Box from '@mui/material/Box'
import SearchBar from './SearchBar'
import { getAppIcon, getAuthor, getCustomLinks, getProducts, getReverseDomainName, getShortDescription, getVersion } from '../api/ProductService'
import { CircularProgress, Collapse, Typography } from '@mui/material'
import { AppFilter } from './AppFilter'
import useStateWithLocalStorage from './LocalStorage'

export default function MarketplaceList (props) {
  const [products, setProducts] = useState()
  // const [appList, setAppList] = useState()
  const [searchValue, setSearch] = useState('')
  const [searchAuthor, searchTitle] = searchValue.split(' / ')
  const [loading, setLoading] = useState(true)
  const [queryParams, setQueryParams] = useStateWithLocalStorage('marketplace-query', {
    page: undefined,
    per_page: undefined,
    search: undefined,
    order: undefined,
    orderby: undefined,
    status: undefined
  })
  const [showFilter, setToggleFilter] = useStateWithLocalStorage('marketplace-filter', false)

  function setInstalledFilter () {
    setQueryParams(previousState => {
      return { ...previousState, status: (queryParams.status === 'publish' ? 'any' : 'publish') }
    })
    setLoading(true)
  }

  function toggleFilter () {
    setToggleFilter(!showFilter)
  }
  const loadProducts = useCallback(async () => {
    try {
      await getProducts(queryParams)
        .then(
          (loadedProducts) => {
            loadedProducts.sort((a, b) => (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0))

            const productCards = createProductCards(loadedProducts)
            setProducts(productCards)
          },
          error => {
            const resMessage =
          (error.response &&
            error.response.data &&
            error.response.data.reason) ||
          error.message ||
          error.toString()
            console.log(resMessage)
          }
        )
        .finally(function () { setLoading(false) })
    } catch (error) {
      console.log(error.response)
    }
  }, [queryParams])

  function createProductCards (newProducts) {
    let productCards = []
    if (newProducts && props.appData) {
      productCards = newProducts.map((app) => (
        <Card
          key={getReverseDomainName(app) ? getReverseDomainName(app) : app?.id}
          app={getReverseDomainName(app)}
          avatar={getAppIcon(app)}
          title={app.name}
          author={getAuthor(app)}
          version={getVersion(app)}
          description={getShortDescription(app)}
          status={props.appData.find(o => o.app === getReverseDomainName(app))?.status || 'uninstalled'}
          availability={app.status}
          relatedLinks={getCustomLinks(app)}
        />
      ))

      // this filters the users search
      if (searchAuthor.length > 0 && !searchTitle) {
        productCards = productCards.filter(app => (app.props.title.toLowerCase().includes(searchAuthor.toLowerCase()) || app.props.author.toLowerCase().includes(searchAuthor.toLowerCase())))
      } else if (searchAuthor.length > 0 && (searchTitle && searchTitle.length > 0)) {
        productCards = productCards.filter(app => (app.props.title.toLowerCase().includes(searchTitle.toLowerCase()) && app.props.author.toLowerCase().includes(searchAuthor.toLowerCase())))
      }

      return productCards
    }
  }

  React.useEffect(() => {
    loadProducts()
  }, [loadProducts])

  return (
  <Box aria-label="marketplace-apps-list" display="flex">
      <Grid
        container
        direction="row"
        justify="flex-start"
        alignItems="flex-start"
      >
        <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'space-between', flexDirection: 'column', mr: 2, mb: 2 }}>

              <SearchBar key='search-bar' data-testid='search-bar' defaultSearchValue={searchValue} setSearch={setSearch} searchTitle='Search apps' searchAutocomplete={products ? products.map((app) => (app.props.author + ' / ' + app.props.title)).sort() : null} setToggleFilter={toggleFilter}/>
              <Collapse key='filter' in={showFilter} timeout="auto" unmountOnExit>
                <AppFilter open={showFilter} setInstalled={setInstalledFilter} installed={(queryParams.status === 'publish')}/>
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
        {products}
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
