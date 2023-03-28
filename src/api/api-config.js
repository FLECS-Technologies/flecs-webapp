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

import { Component } from 'react'

const DEVICE_ROUTE = '../api/v2'
const DEVICE_ROUTE_TEST = '/api/v2'
const APP_ROUTE = '/apps'
const INSTANCES_ROUTE = '/instances'
const MARKETPLACE_ROUTE = '/marketplace'
const SYSTEM_ROUTE = '/system'
const DATA_LAYER_ROUTE = '/data-layer'
const DOWNLOAD_ROUTE = SYSTEM_ROUTE + '/download'
const EXPORTS_ROUTE = '/exports'

const GET_INSTALLED_APP_LIST_URL = ''
const GET_BROWSE_DATA_LAYER = '/browse'
const GET_PING_URL = SYSTEM_ROUTE + '/ping'
const GET_SYSTEM_INFO_URL = SYSTEM_ROUTE + '/info'
const GET_VERSION_URL = SYSTEM_ROUTE + '/version'
const GET_DOWNLOAD_URL = (path) => DOWNLOAD_ROUTE + `/${path}`
const GET_EXPORT_URL = (exportId) => EXPORTS_ROUTE + `/${exportId}`
const GET_JOBS_URL = '/jobs'
const GET_INSTANCE_DETAILS_URL = (instanceId) => INSTANCES_ROUTE + `/${instanceId}`
const GET_INSTANCE_LOG_URL = (instanceId) => INSTANCES_ROUTE + `/${instanceId}` + '/logs'
const GET_INSTANCE_CONFIG_URL = (instanceId) => INSTANCES_ROUTE + `/${instanceId}` + '/config'

const POST_INSTALL_APP_URL = '/install'
const POST_UPDATE_APP_URL = DEVICE_ROUTE + APP_ROUTE + '/update'
const POST_START_INSTANCE_URL = (instanceId) => INSTANCES_ROUTE + `/${instanceId}` + '/start'
const POST_STOP_INSTANCE_URL = (instanceId) => INSTANCES_ROUTE + `/${instanceId}` + '/stop'
const POST_CREATE_INSTANCE_URL = INSTANCES_ROUTE + '/create'
const POST_INSTANCE_DETAILS_URL = (instanceId) => INSTANCES_ROUTE + `/${instanceId}`
const POST_INSTANCE_LOG_URL = (instanceId) => INSTANCES_ROUTE + `/${instanceId}` + '/logs'
const POST_INSTANCE_CONFIG_URL = (instanceId) => INSTANCES_ROUTE + `/${instanceId}` + '/config'
const POST_MP_LOGIN_URL = '/login'
const POST_MP_LOGOUT_URL = '/logout'
const POST_EXPORT_URL = EXPORTS_ROUTE + '/create'
const POST_SIDELOAD_APP = '/sideload'
const POST_APP_IMPORT_URL = '/imports'

const PATCH_INSTANCE_UPDATE_URL = (instanceId) => INSTANCES_ROUTE + `/${instanceId}`

const DELETE_UNINSTALL_APP_URL = ''
const DELETE_EXPORT_URL = (exportId) => EXPORTS_ROUTE + `/${exportId}`
const DELETE_INSTANCE_URL = (instanceId) => INSTANCES_ROUTE + `/${instanceId}`

const MP_BASE_URL = 'https://marketplace.flecs.tech'
const MP_BETA_BASE_URL = 'https://mp-dev.flecs.tech'
const MP_CART_ROUTE = '/cart?cocart-load-cart='
const MP_BASE_DEV_URL = 'https://marketplace.flecs.tech:3000'

const MP_PROXY_DEV = 'http://localhost:8001'
const MP_PROXY_TEST = 'https://marketplace.flecs.tech:8443'
const MP_PROXY_PRODUCTION = 'https://marketplace.flecs.tech'

const MP_DEV = 'https://mp-dev.flecs.tech'
const MP_TEST = 'https://mp-dev.flecs.tech'
const MP_PRODUCTION = 'https://flecs.tech'

const POST_AUTHENTICATE_URL = '/api/access/authenticate'
const POST_VALIDATE_URL = '/api/access/jwt/validate'
const POST_GET_CURRENT_USER_LICENSES_URL = '/api/license/get-current-user-licenses'
const POST_SET_LICENSE_META_URL = '/api/license/add-license-key-meta'
const GET_PRODUCTS_URL = '/api/v1/products'
const GET_LATEST_VERSION_URL = '/api/v1/core/version/latest'
const POST_PRODUCT_RATING_URL = GET_PRODUCTS_URL + '/reviews'

class DeviceAPIConfiguration extends Component {
  static get TARGET () {
    let target = ''
    if (process.env.REACT_APP_ENVIRONMENT === 'development') {
      target = process.env.REACT_APP_DEV_CORE_URL
    }
    return target
  }

  static get DEVICE_ROUTE () {
    if ((process.env.REACT_APP_ENVIRONMENT === 'test') || (process.env.REACT_APP_ENVIRONMENT === 'development')) {
      return DEVICE_ROUTE_TEST
    }
    return DEVICE_ROUTE
  }

  static get APP_ROUTE () {
    return APP_ROUTE
  }

  static get INSTANCES_ROUTE () {
    return INSTANCES_ROUTE
  }

  static get MARKETPLACE_ROUTE () {
    return MARKETPLACE_ROUTE
  }

  static get SYSTEM_ROUTE () {
    return SYSTEM_ROUTE
  }

  static get DATA_LAYER_ROUTE () {
    return DATA_LAYER_ROUTE
  }

  // post requests
  static get POST_INSTALL_APP_URL () {
    return POST_INSTALL_APP_URL
  }

  static get POST_START_INSTANCE_URL () {
    return POST_START_INSTANCE_URL
  }

  static get POST_STOP_INSTANCE_URL () {
    return POST_STOP_INSTANCE_URL
  }

  static get POST_CREATE_INSTANCE_URL () {
    return POST_CREATE_INSTANCE_URL
  }

  static get POST_SIDELOAD_APP () {
    return POST_SIDELOAD_APP
  }

  static get POST_MP_LOGIN_URL () {
    return POST_MP_LOGIN_URL
  }

  static get POST_MP_LOGOUT_URL () {
    return POST_MP_LOGOUT_URL
  }

  static get POST_INSTANCE_DETAILS_URL () {
    return POST_INSTANCE_DETAILS_URL
  }

  static get POST_INSTANCE_LOG_URL () {
    return POST_INSTANCE_LOG_URL
  }

  static get POST_INSTANCE_CONFIG_URL () {
    return POST_INSTANCE_CONFIG_URL
  }

  static get POST_UPDATE_APP_URL () {
    return POST_UPDATE_APP_URL
  }

  static get POST_EXPORT_URL () {
    return POST_EXPORT_URL
  }

  static get POST_APP_IMPORT_URL () {
    return POST_APP_IMPORT_URL
  }

  // get requests
  static get GET_INSTALLED_APP_LIST_URL () {
    return GET_INSTALLED_APP_LIST_URL
  }

  static get GET_BROWSE_DATA_LAYER () {
    return GET_BROWSE_DATA_LAYER
  }

  static get GET_PING_URL () {
    return GET_PING_URL
  }

  static get GET_SYSTEM_INFO_URL () {
    return GET_SYSTEM_INFO_URL
  }

  static get GET_VERSION_URL () {
    return GET_VERSION_URL
  }

  static get GET_DOWNLOAD_URL () {
    return GET_DOWNLOAD_URL
  }

  static get EXPORTS_ROUTE () {
    return EXPORTS_ROUTE
  }

  static get GET_EXPORT_URL () {
    return GET_EXPORT_URL
  }

  static get GET_INSTANCE_DETAILS_URL () {
    return GET_INSTANCE_DETAILS_URL
  }

  static get GET_INSTANCE_LOG_URL () {
    return GET_INSTANCE_LOG_URL
  }

  static get GET_INSTANCE_CONFIG_URL () {
    return GET_INSTANCE_CONFIG_URL
  }

  static get GET_JOBS_URL () {
    return GET_JOBS_URL
  }

  // patch requests
  static get PATCH_INSTANCE_UPDATE_URL () {
    return PATCH_INSTANCE_UPDATE_URL
  }

  // delete requests
  static get DELETE_UNINSTALL_APP_URL () {
    return DELETE_UNINSTALL_APP_URL
  }

  static get DELETE_EXPORT_URL () {
    return DELETE_EXPORT_URL
  }

  static get DELETE_INSTANCE_URL () {
    return DELETE_INSTANCE_URL
  }
}

class MarketplaceAPIConfiguration {
  static get MP_PROXY_URL () {
    let mpUrl = ''
    switch (process.env.REACT_APP_ENVIRONMENT) {
      case 'production':
        mpUrl = MP_PROXY_PRODUCTION
        break
      case 'development':
        mpUrl = MP_PROXY_DEV
        break
      case 'test':
        mpUrl = MP_PROXY_TEST
        break
      default:
        mpUrl = MP_PROXY_PRODUCTION
    }
    return mpUrl
  }

  static get MP_URL () {
    let mpUrl = ''
    switch (process.env.REACT_APP_ENVIRONMENT) {
      case 'production':
        mpUrl = MP_PRODUCTION
        break
      case 'development':
        mpUrl = MP_DEV
        break
      case 'test':
        mpUrl = MP_TEST
        break
      default:
        mpUrl = MP_PRODUCTION
    }
    return mpUrl
  }

  static get BASE_URL () {
    return MP_BASE_URL
  }

  static get BETA_BASE_URL () {
    return MP_BETA_BASE_URL
  }

  static get MP_CART_ROUTE () {
    return MP_CART_ROUTE
  }

  static get MP_INSTALL_TICKET_ID () {
    let ticketID = 0
    switch (process.env.REACT_APP_ENVIRONMENT) {
      case 'production':
        ticketID = 737
        break
      case 'development':
        ticketID = 737
        break
      case 'test':
        ticketID = 737
        break
      default:
        ticketID = 737
    }
    return ticketID
  }

  static get BASE_DEV_URL () {
    return MP_BASE_DEV_URL
  }

  // get requests
  static get GET_PRODUCTS_URL () {
    return GET_PRODUCTS_URL
  }

  static get GET_LATEST_VERSION_URL () {
    return GET_LATEST_VERSION_URL
  }

  // post requests
  static get POST_AUTHENTICATE_URL () {
    return POST_AUTHENTICATE_URL
  }

  static get POST_VALIDATE_URL () {
    return POST_VALIDATE_URL
  }

  static get POST_GET_CURRENT_USER_LICENSES_URL () {
    return POST_GET_CURRENT_USER_LICENSES_URL
  }

  static get POST_SET_LICENSE_META_URL () {
    return POST_SET_LICENSE_META_URL
  }

  static get POST_PRODUCT_RATING_URL () {
    return POST_PRODUCT_RATING_URL
  }
}

export { DeviceAPIConfiguration, MarketplaceAPIConfiguration }
