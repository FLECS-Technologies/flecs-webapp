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

const DEVICE_ROUTE = '/api'
const APP_ROUTE = '/app'
const INSTANCE_ROUTE = '/instance'
const MARKETPLACE_ROUTE = '/marketplace'
const SYSTEM_ROUTE = '/system'
const GET_INSTALLED_APP_LIST_URL = '/list'
const GET_BROWSE_SERVICE_MESH = '/browse'

const POST_INSTALL_APP_URL = '/install'
const POST_UNINSTALL_APP_URL = '/uninstall'
const POST_START_INSTANCE_URL = '/start'
const POST_STOP_INSTANCE_URL = '/stop'
const POST_CREATE_APP_INSTANCE_URL = '/create'
const POST_DELETE_APP_INSTANCE_URL = '/delete'
const POST_MP_LOGIN_URL = '/login'
const POST_MP_LOGOUT_URL = '/logout'

const PUT_SIDELOAD_APP = '/sideload'

const MP_BASE_URL = 'https://marketplace.flecs.tech'
const MP_BETA_BASE_URL = 'http://mp-dev.flecs.tech'
const MP_CART_ROUTE = '/warenkorb?keep-cart=true&cocart-load-cart='
const MP_INSTALL_TICKET_ID = 122
const MP_BASE_DEV_URL = 'https://marketplace.flecs.tech:3000'

const POST_AUTHENTICATE_URL = '/wp-json/aam/v2/authenticate'
const POST_VALIDATE_URL = '/wp-json/aam/v2/jwt/validate'
const POST_GET_CURRENT_USER_LICENSES_URL = '/wp-json/wclm/v3/get-current-user-licenses'
const GET_PRODUCTS_URL = '/api/products'

class DeviceAPIConfiguration extends Component {
  static get DEVICE_ROUTE () {
    return DEVICE_ROUTE
  }

  static get APP_ROUTE () {
    return APP_ROUTE
  }

  static get INSTANCE_ROUTE () {
    return INSTANCE_ROUTE
  }

  static get MARKETPLACE_ROUTE () {
    return MARKETPLACE_ROUTE
  }

  static get SYSTEM_ROUTE () {
    return SYSTEM_ROUTE
  }

  // post requests
  static get POST_INSTALL_APP_URL () {
    return POST_INSTALL_APP_URL
  }

  static get POST_UNINSTALL_APP_URL () {
    return POST_UNINSTALL_APP_URL
  }

  static get POST_START_INSTANCE_URL () {
    return POST_START_INSTANCE_URL
  }

  static get POST_STOP_INSTANCE_URL () {
    return POST_STOP_INSTANCE_URL
  }

  static get POST_CREATE_APP_INSTANCE_URL () {
    return POST_CREATE_APP_INSTANCE_URL
  }

  static get POST_DELETE_APP_INSTANCE_URL () {
    return POST_DELETE_APP_INSTANCE_URL
  }

  static get POST_MP_LOGIN_URL () {
    return POST_MP_LOGIN_URL
  }

  static get POST_MP_LOGOUT_URL () {
    return POST_MP_LOGOUT_URL
  }

  // get requests
  static get GET_INSTALLED_APP_LIST_URL () {
    return GET_INSTALLED_APP_LIST_URL
  }

  static get GET_BROWSE_SERVICE_MESH () {
    return GET_BROWSE_SERVICE_MESH
  }

  // put requests
  static get PUT_SIDELOAD_APP () {
    return PUT_SIDELOAD_APP
  }
}

class MarketplaceAPIConfiguration {
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
    return MP_INSTALL_TICKET_ID
  }

  static get BASE_DEV_URL () {
    return MP_BASE_DEV_URL
  }

  // get requests
  static get GET_PRODUCTS_URL () {
    return GET_PRODUCTS_URL
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
}

export { DeviceAPIConfiguration, MarketplaceAPIConfiguration }
