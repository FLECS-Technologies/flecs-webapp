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

import React, { useState } from 'react'
import PropTypes from 'prop-types'
import Card from './Card'
import Grid from '@mui/material/Grid'
import Box from '@mui/material/Box'
import SearchBar from './SearchBar'
import { getProducts } from '../api/ProductService'
import { CircularProgress, Typography } from '@mui/material'

export default function MarketplaceList (props) {
  let productCards = []
  let products = []
  const [appList, setAppList] = useState()
  const [searchValue, setSearch] = useState('')
  const [searchAuthor, searchTitle] = searchValue.split(' / ')
  const [loading, setLoading] = useState(true)

  async function loadProducts () {
    await getProducts().then(
      (products) => {
        setAppList(products)
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
  }

  React.useEffect(() => {
    loadProducts()
  }, [])
  if (appList && props.appData) {
    products = appList.map((app) => (
      <Card
        key={app?.meta_data.find(o => o.key === 'app-custom-meta')?.value.find(o => o.title === 'reverse-domain-name')?.value}
        app={app?.meta_data.find(o => o.key === 'app-custom-meta')?.value.find(o => o.title === 'reverse-domain-name')?.value}
        avatar={app?.meta_data.find(o => o.key === 'app-icon')?.value}
        title={app.name}
        author={app?.meta_data.find(o => o.key === 'port-author-name')?.value}
        version={app?.meta_data.find(o => o.key === 'port-version')?.value}
        description={app.short_description.replace(/<[^>]+>/g, '')}
        status={props.appData.find(o => o.app === app)?.status || 'uninstalled'}
        availability={app.status}
        relatedLinks={app.relatedLinks}
      />
    ))
  }

  if (props.appData) {
    // this filters the sideloaded apps
    productCards = props.appData.filter(app => (app.availability != null))
    // this filters the users search
    if (searchAuthor.length > 0 && !searchTitle) {
      productCards = productCards.filter(app => (app.title.toLowerCase().includes(searchAuthor.toLowerCase()) || app.author.toLowerCase().includes(searchAuthor.toLowerCase())))
    } else if (searchAuthor.length > 0 && (searchTitle && searchTitle.length > 0)) {
      productCards = productCards.filter(app => (app.title.toLowerCase().includes(searchTitle.toLowerCase()) && app.author.toLowerCase().includes(searchAuthor.toLowerCase())))
    }
    productCards = productCards.map((app) => (
      <Card
        key={app.app}
        app={app.app}
        avatar={app.avatar}
        title={app.title}
        author={app.author}
        version={app.version}
        description={app.description}
        status={app.status}
        availability={app.availability}
        relatedLinks={app.relatedLinks}
      />
    ))
  }

  return (
  <Box aria-label="marketplace-apps-list" display="flex">
      <Grid
        container
        direction="row"
        justify="flex-start"
        alignItems="flex-start"
      >
        <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'space-between', flexDirection: 'column', mr: 2, mb: 2 }}>
          <SearchBar testId='search-bar' defaultSearchValue={searchValue} setSearch={setSearch} searchTitle='Search apps' searchAutocomplete={props.appData ? props.appData.map((app) => (app.author + ' / ' + app.title)).sort() : null}/>
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
        {productCards}
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
