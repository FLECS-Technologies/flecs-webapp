/*
 * Copyright (c) 2022 FLECS Technologies GmbH
 *
 * Created on Thu Jan 20 2022
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
// import React from 'react'
import CoCartAPI from '@cocart/cocart-rest-api'
import { MarketplaceAPIConfiguration } from './api-config'
import AuthService from './AuthService'

function createCart () {}

async function getCurrentCart () {
  /* getCurrentCart is currently not used. */
  /*
  const currentUser = AuthService.getCurrentUser()

  const CoCart = new CoCartAPI({
    url: MarketplaceAPIConfiguration.BETA_BASE_URL,

    consumerKey: currentUser?.user?.data?.user_login,
    consumerSecret: currentUser?.jwt?.token
  })

  CoCart.get('cart')
    .then((response) => {
      // Successful request
    })
    .catch(() => {
      // Invalid request, for 4xx and 5xx statuses
    })
    .finally(() => {
      // Always executed.
    })
    */
}

async function addToCart (appId) {
  const currentUser = AuthService.getCurrentUser()

  const CoCart = new CoCartAPI({
    url: MarketplaceAPIConfiguration.BETA_BASE_URL,

    consumerKey: currentUser?.user?.data?.user_login,
    consumerSecret: currentUser?.jwt?.token
  })
  return CoCart.post('cart/add-item', {
    id: appId.toString(),
    quantity: '1'
  })
    .then((response) => {
      // Successful request
      return response.data?.cart_key
    })
    .catch((error) => {
      // Invalid request, for 4xx and 5xx statuses
      return Promise.reject(error)
    })
    .finally(() => {
      // Always executed.
    })
}

export { createCart, getCurrentCart, addToCart }
