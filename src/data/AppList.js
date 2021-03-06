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
import DeviceAPI from '../api/DeviceAPI'
import { getAppIcon, getAuthor, getCustomLinks, getProducts, getReverseDomainName } from '../api/ProductService'

function AppList (props) {
  const { setAppList, setAppListLoading, setAppListError, updateAppList, appListLoading, setUpdateAppList } = useReferenceDataContext()
  const [queryParams] = React.useState({
    page: undefined,
    per_page: undefined,
    search: undefined,
    order: undefined,
    orderby: undefined,
    status: 'publish',
    stock_status: 'instock'
  })

  React.useEffect(() => {
    if (!appListLoading) {
      loadAppList()
      setUpdateAppList(false)
    }
  }, [updateAppList])

  const loadAppList = async (props) => {
    let marketplaceAppList = []
    let mergedList = []

    setAppListLoading(true)
    await getProducts(queryParams).then(
      (products) => {
        marketplaceAppList = marketplaceAppList.concat(products)
      },
      error => {
        console.log(error)
        setAppListError(true)
      }
    )

    // call api from the device to get all installed apps
    const deviceAPI = new DeviceAPI()
    await deviceAPI.getInstalledApps()
    if (deviceAPI.lastAPICallSuccessfull) {
      mergedList = deviceAPI.appList

      mergedList.forEach((app) => {
        const mpApp = findApp(app.app, marketplaceAppList)
        if (mpApp) {
          app.avatar = getAppIcon(mpApp)
          app.title = mpApp?.name
          app.author = getAuthor(mpApp)
          app.relatedLinks = getCustomLinks(mpApp)
        }
      })

      setAppList(appList => [...mergedList])
      setAppListLoading(false)
      setAppListError(false)
    } else {
      setAppList(appList => [...marketplaceAppList])
      setAppListLoading(false)
      setAppListError(true)
      console.error('Something went wrong at deviceAPI.getInstalledApps(). This is the error message:' + deviceAPI.lastAPIError)
    }
  }

  return (<>{props.children}</>)
}
AppList.propTypes = {
  children: PropTypes.any
}

function findApp (app, list) {
  let result
  list.forEach((product) => {
    if (app === getReverseDomainName(product)) {
      result = product
    }
  })

  return result
}

export { AppList }
