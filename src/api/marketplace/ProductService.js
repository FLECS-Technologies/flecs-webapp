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
import { MarketplaceAPIConfiguration } from '../api-config'
import axios from 'axios'

async function getProducts() {
  return axios
    .get(
      MarketplaceAPIConfiguration.MP_PROXY_URL +
        MarketplaceAPIConfiguration.GET_PRODUCTS_URL
    )
    .then((response) => {
      if (
        response.data &&
        response.data.statusCode === 200 &&
        response.data.data.products
      ) {
        return response.data.data.products
      }
    })
    .catch((error) => {
      return Promise.reject(error)
    })
}

function getReverseDomainName(app) {
  let reverseDomainName
  if (app) {
    reverseDomainName = app.attributes?.find(
      (o) => o.name === 'reverse-domain-name'
    )?.options[0]
  }
  return reverseDomainName
}

function getEditorAddress(app) {
  return app?.attributes?.find((o) => o.name === 'editor')?.options[0]
}

function getAppIcon(app) {
  return app?.meta_data.find((o) => o.key === 'app-icon')?.value
}

function getAuthor(app) {
  return app?.meta_data.find((o) => o.key === 'port-author-name')?.value
}

function getVersion(app) {
  return app?.meta_data.find((o) => o.key === 'port-version')?.value
}

function getVersions(app) {
  const collator = new Intl.Collator('en', {
    numeric: true,
    sensitivity: 'base'
  })
  const versions = app?.attributes?.find((o) => o.name === 'versions')?.options
  if (versions) {
    versions.sort((a, b) => collator.compare(a, b))
    versions.reverse()
  }
  return versions
}

function getBlacklist(app) {
  const blacklist = app?.attributes?.find(
    (o) => o.name === 'blacklist'
  )?.options

  return blacklist
}

function isBlacklisted(systemInfo, blacklist) {
  let isListed = false
  if (blacklist && systemInfo?.platform) {
    isListed = blacklist.includes(systemInfo?.platform)
  }

  return isListed
}

function getShortDescription(app) {
  return app?.short_description?.replace(/<[^>]+>/g, '')
}

function getCustomLinks(app) {
  const customLinks = app?.meta_data.find(
    (o) => o.key === 'app-custom-link'
  )?.value
  if (!customLinks || customLinks === '') {
    return undefined
  } else if (!Array.isArray(customLinks)) {
    const retval = []
    retval.push(customLinks['1'])
    return retval
  } else {
    return customLinks
  }
}

function getMultiInstance(app) {
  const multiInstance = app.attributes?.find((o) => o.name === 'multiInstance')
    ?.options[0]
  return !!multiInstance
}

function getRequirement(app) {
  return app?.attributes.find((o) => o.name === 'archs')?.options
}

function getId(app) {
  return app?.id
}

function getCategories(app) {
  return app?.categories
}

function getAverageRating(app) {
  return app?.average_rating
}

function getRatingCount(app) {
  return app?.rating_count
}

function getPrice(app) {
  return app?.price
}

function getPermalink(app) {
  return app?.permalink
}

function getPurchasable(app) {
  return app?.purchasable
}

function getDocumentationUrl(app) {
  const documenationUrl = app?.meta_data.find(
    (o) => o.key === '_documentation_url'
  )?.value
  if (!documenationUrl || documenationUrl === '') {
    return undefined
  } else {
    return documenationUrl
  }
}

export {
  getProducts,
  getAverageRating,
  getBlacklist,
  isBlacklisted,
  getDocumentationUrl,
  getRatingCount,
  getReverseDomainName,
  getEditorAddress,
  getAppIcon,
  getId,
  getCategories,
  getAuthor,
  getVersion,
  getVersions,
  getShortDescription,
  getCustomLinks,
  getMultiInstance,
  getRequirement,
  getPurchasable,
  getPermalink,
  getPrice
}
