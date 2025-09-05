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

import { Component } from 'react';

const DEVICE_BASE_ROUTE = '../api/v2';
const DEVICE_BASE_ROUTE_TEST = '/api/v2';
const CONSOLE_ROUTE = '/console';

const PUT_CONSOLE_AUTH_URL = '/authentication';
const DELETE_CONSOLE_AUTH_URL = '/authentication';

const MP_BASE_URL = 'https://console.flecs.tech';
const MP_BETA_BASE_URL = 'https://console-dev.flecs.tech';
const MP_CART_ROUTE = '/cart?cocart-load-cart=';

const MP_PROXY_DEV = 'https://console-dev.flecs.tech';
const MP_PROXY_TEST = 'https://console-dev.flecs.tech';
const MP_PROXY_PRODUCTION = 'https://console.flecs.tech';

const MP_DEV = 'https://staging.flecs.tech';
const MP_TEST = 'https://staging.flecs.tech';
const MP_PRODUCTION = 'https://flecs.tech';

const POST_AUTHENTICATE_URL = '/api/v2/auth/login';
const POST_VALIDATE_URL = '/api/v2/auth/validate';
const POST_GET_CURRENT_USER_LICENSES_URL = '/api/license/get-current-user-licenses';
const POST_SET_LICENSE_META_URL = '/api/license/add-license-key-meta';
const GET_PRODUCTS_URL = '/api/v2/products/apps';
const GET_LATEST_VERSION_URL = '/api/v1/core/version/latest';
const POST_PRODUCT_RATING_URL = GET_PRODUCTS_URL + '/reviews';

class DeviceAPIConfiguration extends Component {
  static get TARGET() {
    let target = '';
    if (import.meta.env.VITE_APP_ENVIRONMENT === 'development') {
      target = import.meta.env.VITE_APP_DEV_CORE_URL;
    }
    return target;
  }

  static get DEVICE_BASE_ROUTE() {
    if (
      import.meta.env.VITE_APP_ENVIRONMENT === 'test' ||
      import.meta.env.VITE_APP_ENVIRONMENT === 'development'
    ) {
      return DEVICE_BASE_ROUTE_TEST;
    }
    return DEVICE_BASE_ROUTE;
  }

  static get CONSOLE_ROUTE() {
    return CONSOLE_ROUTE;
  }

  // post requests

  static get PUT_CONSOLE_AUTH_URL() {
    return PUT_CONSOLE_AUTH_URL;
  }

  // delete requests
  static get DELETE_CONSOLE_AUTH_URL() {
    return DELETE_CONSOLE_AUTH_URL;
  }
}

class MarketplaceAPIConfiguration {
  static get MP_PROXY_URL() {
    let mpUrl = '';
    switch (import.meta.env.VITE_APP_ENVIRONMENT) {
      case 'production':
        mpUrl = MP_PROXY_PRODUCTION;
        break;
      case 'development':
        mpUrl = MP_PROXY_DEV;
        break;
      case 'test':
        mpUrl = MP_PROXY_TEST;
        break;
      default:
        mpUrl = MP_PROXY_PRODUCTION;
    }
    return mpUrl;
  }

  static get MP_URL() {
    let mpUrl = '';
    switch (import.meta.env.VITE_APP_ENVIRONMENT) {
      case 'production':
        mpUrl = MP_PRODUCTION;
        break;
      case 'development':
        mpUrl = MP_DEV;
        break;
      case 'test':
        mpUrl = MP_TEST;
        break;
      default:
        mpUrl = MP_PRODUCTION;
    }
    return mpUrl;
  }

  static get BASE_URL() {
    return MP_BASE_URL;
  }

  static get BETA_BASE_URL() {
    return MP_BETA_BASE_URL;
  }

  static get MP_CART_ROUTE() {
    return MP_CART_ROUTE;
  }

  static get MP_INSTALL_TICKET_ID() {
    let ticketID = 0;
    switch (import.meta.env.VITE_APP_ENVIRONMENT) {
      case 'production':
        ticketID = 737;
        break;
      case 'development':
        ticketID = 737;
        break;
      case 'test':
        ticketID = 737;
        break;
      default:
        ticketID = 737;
    }
    return ticketID;
  }

  // get requests
  static get GET_PRODUCTS_URL() {
    return GET_PRODUCTS_URL;
  }

  static get GET_LATEST_VERSION_URL() {
    return GET_LATEST_VERSION_URL;
  }

  // post requests
  static get POST_AUTHENTICATE_URL() {
    return POST_AUTHENTICATE_URL;
  }

  static get POST_VALIDATE_URL() {
    return POST_VALIDATE_URL;
  }

  static get POST_GET_CURRENT_USER_LICENSES_URL() {
    return POST_GET_CURRENT_USER_LICENSES_URL;
  }

  static get POST_SET_LICENSE_META_URL() {
    return POST_SET_LICENSE_META_URL;
  }

  static get POST_PRODUCT_RATING_URL() {
    return POST_PRODUCT_RATING_URL;
  }
}

export { DeviceAPIConfiguration, MarketplaceAPIConfiguration };
