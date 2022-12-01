/*
 * Copyright (c) 2022 FLECS Technologies GmbH
 *
 * Created on Fri Aug 12 2022
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

import { MarketplaceAPIConfiguration } from '../api-config'
import axios from 'axios'

function createAppRating (product_id, reviewer, reviewer_email, rating, jwt) {
  const data = {
    product_id,
    review: 'This is an in-app rating without review.',
    reviewer,
    reviewer_email,
    rating
  }
  return axios
    .post(MarketplaceAPIConfiguration.MP_PROXY_URL + MarketplaceAPIConfiguration.POST_PRODUCT_RATING_URL, { data, jwt })
    .then(response => {
      if (response.data && response.data.success) {
        return response.data
      }
    })
    .catch(error => {
      return Promise.reject(error)
    })
}

export { createAppRating }
