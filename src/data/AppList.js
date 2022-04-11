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

import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { ReferenceDataContext } from './ReferenceDataContext'
// import { marketPlaceAppsList } from './MarketplaceAppsList'
import DeviceAPI from '../api/DeviceAPI'
import { getAppIcon, getAuthor, getCustomLinks, getEditorAddress, getMultiInstance, getProducts, getReverseDomainName } from '../api/ProductService'
// import { useSystemContext } from './SystemProvider'

class AppList extends Component {
  constructor (props) {
    super(props)
    this.state = {
      updateNow: false,
      queryParams: {
        page: undefined,
        per_page: undefined,
        search: undefined,
        order: undefined,
        orderby: undefined,
        status: 'publish',
        stock_status: 'instock'
      }
    }
  }

  componentDidMount () {
    this.loadAppList()
  }

  componentDidUpdate () {
    const { updateAppList, setUpdateAppList } = this.context
    if (updateAppList) {
      setUpdateAppList(false)
      this.loadAppList()
    }
  }

  handleUpdateAppList () {
    this.loadAppList()
  }

  loadAppList () {
    (async () => {
      const { setAppList, setAppListLoading, setAppListError } = this.context

      let marketplaceAppList = []
      let mergedList = []

      await getProducts(this.state.queryParams).then(
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
          const mpApp = this.findApp(app.app, marketplaceAppList)
          if (mpApp) {
            app.avatar = getAppIcon(mpApp)
            app.title = mpApp?.name
            app.author = getAuthor(mpApp)
            app.relatedLinks = getCustomLinks(mpApp)
            app.editor = getEditorAddress(mpApp)
            app.multiInstance = getMultiInstance(mpApp)
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
    })()
      .catch(error => { console.log(error) })
  }

  findApp (app, list) {
    let result
    list.forEach((product) => {
      if (app === getReverseDomainName(product)) {
        result = product
      }
    })

    return result
  }

  render () {
    return (<>{this.props.children}</>)
  }
}
AppList.contextType = ReferenceDataContext
AppList.propTypes = {
  children: PropTypes.any
}

export { AppList }
