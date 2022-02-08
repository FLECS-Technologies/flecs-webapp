/*
 * Copyright (c) 2022 FLECS Technologies GmbH
 *
 * Created on Wed Jan 19 2022
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
import { MarketplaceAPIConfiguration } from './api-config'
import axios from 'axios'

function getProducts (params) {
  let url
  const { /* page , per_page, search, order, orderby, */ status } = params || {}
  const reqParams = new URLSearchParams()
  reqParams.append('category', '18')
  if (status) {
    reqParams.append('status', status)
  }

  if (process.env.NODE_ENV === 'development') {
    url = process.env.REACT_APP_DEV_LOCAL_MP_URL
  } else {
    url = MarketplaceAPIConfiguration.BASE_DEV_URL
  }
  return axios
    .get(url + MarketplaceAPIConfiguration.GET_PRODUCTS_URL, { params: reqParams })
    .then(response => {
      if (response.data && response.data.success && response.data.products) {
        return response.data.products
      }
    })
    .catch(error => {
      return Promise.reject(error)
    })
}

function getReverseDomainName (app) {
  let reverseDomainName
  if (app) {
    reverseDomainName = app.attributes?.find(o => o.name === 'reverse-domain-name')?.options[0]
  }
  return reverseDomainName
}

function getEditorAddress (app) {
  return app?.attributes?.find(o => o.name === 'editor')?.options[0]
}

function getAppIcon (app) {
  return app?.meta_data.find(o => o.key === 'app-icon')?.value
}

function getAuthor (app) {
  return app?.meta_data.find(o => o.key === 'port-author-name')?.value
}

function getVersion (app) {
  return app?.meta_data.find(o => o.key === 'port-version')?.value
}

function getShortDescription (app) {
  return app?.short_description?.replace(/<[^>]+>/g, '')
}

function getCustomLinks (app) {
  const customLinks = app?.meta_data.find(o => o.key === 'app-custom-link')?.value
  if (!customLinks || customLinks === '') {
    return undefined
  } else if (!Array.isArray(customLinks)) {
    const retval = []
    retval.push(customLinks['1'])
    return retval
  } else { return customLinks }
}

export { getProducts, getReverseDomainName, getEditorAddress, getAppIcon, getAuthor, getVersion, getShortDescription, getCustomLinks }
