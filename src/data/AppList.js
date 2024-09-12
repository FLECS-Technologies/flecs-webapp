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

import React from 'react'
import PropTypes from 'prop-types'
import { useReferenceDataContext } from './ReferenceDataContext'
import DeviceAPI from '../api/device/DeviceAPI'
import {
  getAppIcon,
  getAuthor,
  getCustomLinks,
  getPermalink,
  getPrice,
  getProducts,
  getPurchasable,
  getReverseDomainName
} from '../api/marketplace/ProductService'

function AppList(props) {
  const {
    setAppList,
    setAppListLoading,
    setAppListError,
    updateAppList,
    appListLoading,
    setUpdateAppList,
    loadedProducts,
    setLoadedProducts
  } = useReferenceDataContext()

  React.useEffect(() => {
    if (!appListLoading) {
      if (!loadedProducts) {
        loadProducts()
      } else {
        loadAppList()
        setUpdateAppList(false)
      }
    }
  }, [updateAppList, loadedProducts])

  const loadProducts = async () => {
    setAppListLoading(true)
    try {
      let products = await getProducts()
      products = removeDuplicates(products)
      products.sort((a, b) =>
        a.name.toLowerCase() > b.name.toLowerCase()
          ? 1
          : b.name.toLowerCase() > a.name.toLowerCase()
          ? -1
          : 0
      )
      setLoadedProducts(products)
    } catch (error) {
      console.log(error)
      setLoadedProducts([])
      setAppListError(true)
    } finally {
      setAppListLoading(false)
    }
  }

  const loadAppList = async (props) => {
    const collator = new Intl.Collator('en', {
      numeric: true,
      sensitivity: 'base'
    })
    setAppListLoading(true)

    // call api from the device to get all installed apps
    const deviceAPI = new DeviceAPI()
    await deviceAPI.getInstances()
    await deviceAPI.getInstalledApps()
    if (deviceAPI.lastAPICallSuccessful) {
      const mergedList = deviceAPI.appList

      mergedList.forEach((app) => {
        const mpApp = findApp(app.appKey, loadedProducts)
        if (mpApp) {
          app.avatar = getAppIcon(mpApp)
          app.title = mpApp?.name
          app.author = getAuthor(mpApp)
          app.relatedLinks = getCustomLinks(mpApp)
          app.price = getPrice(mpApp)
          app.permalink = getPermalink(mpApp)
          app.purchasable = getPurchasable(mpApp)
        }
        if (typeof app === 'object' && app !== null) {
          app.installedVersions = getInstalledVersions(
            mergedList,
            app.appKey.name
          )
          app.installedVersions.sort((a, b) => collator.compare(a, b))
          app.installedVersions.reverse()
          app.instances = getAppInstances(app, deviceAPI.instances)
        }
      })

      setAppList((appList) => [...mergedList])
      setAppListLoading(false)
      setAppListError(false)
    } else {
      setAppList((appList) => [...loadedProducts])
      setAppListLoading(false)
      setAppListError(true)
      console.error(
        'Something went wrong at deviceAPI.getInstalledApps(). This is the error message:' +
          deviceAPI.lastAPIError
      )
    }
  }

  return <>{props.children}</>
}
AppList.propTypes = {
  children: PropTypes.any
}

function findApp(app, list) {
  let result
  list.forEach((product) => {
    if (app.name === getReverseDomainName(product)) {
      result = product
    }
  })

  return result
}

function getInstalledVersions(apps, app) {
  let result
  if (apps && app) {
    const installedApps = apps.filter((obj) => obj.appKey.name === app)
    if (installedApps) {
      result = installedApps.map((obj) => obj.appKey.version)
    }
  }
  return result
}

function getAppInstances(app, instances) {
  if (app && instances) {
    return instances.filter(
      (i) =>
        i.appKey.name === app.appKey.name &&
        i.appKey.version === app.appKey.version
    )
  }
}

function removeDuplicates(products) {
  // Create a Set to keep track of unique reverse domain names
  const seenDomainNames = new Set()

  // Filter the products array to remove duplicates
  const uniqueProducts = products.filter((product) => {
    const reverseDomainName = getReverseDomainName(product)

    // If the domain is already seen, we skip it (i.e., it's a duplicate)
    if (seenDomainNames.has(reverseDomainName)) {
      return false
    }

    // Otherwise, add the domain to the set and keep the product
    seenDomainNames.add(reverseDomainName)
    return true
  })

  return uniqueProducts
}

export { AppList, getInstalledVersions, getAppInstances }
