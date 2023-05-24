/*
 * Copyright (c) 2022 FLECS Technologies GmbH
 *
 * Created on Wed Jun 01 2022
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
function getProducts (params) {
  return new Promise((resolve, reject) => {
    params
      ? resolve(
        [{
          id: 37,
          name: 'Node-RED',
          slug: 'node-red',
          permalink: 'https://mp-dev.flecs.tech/produkt/node-red',
          date_created: '2022-01-27T09:01:27',
          date_created_gmt: '2022-01-27T09:01:27',
          date_modified: '2022-02-02T19:37:55',
          date_modified_gmt: '2022-02-02T19:37:55',
          type: 'simple',
          status: 'publish',
          featured: false,
          catalog_visibility: 'visible',
          description: '',
          short_description: '<p>Low code programming</p>\n',
          sku: '',
          price: '1',
          regular_price: '1',
          sale_price: '',
          date_on_sale_from: null,
          date_on_sale_from_gmt: null,
          date_on_sale_to: null,
          date_on_sale_to_gmt: null,
          on_sale: false,
          purchasable: true,
          total_sales: 0,
          virtual: true,
          downloadable: false,
          downloads: [
          ],
          download_limit: 0,
          download_expiry: 0,
          external_url: '',
          button_text: '',
          tax_status: 'taxable',
          tax_class: '',
          manage_stock: false,
          stock_quantity: null,
          backorders: 'no',
          backorders_allowed: false,
          backordered: false,
          low_stock_amount: null,
          sold_individually: false,
          weight: '',
          reviews_allowed: true,
          average_rating: '0.00',
          rating_count: 0,
          upsell_ids: [
          ],
          cross_sell_ids: [
          ],
          parent_id: 0,
          purchase_note: '',
          categories: [
            {
              id: 15,
              name: 'Unkategorisiert',
              slug: 'unkategorisiert'
            }
          ],
          tags: [
          ],
          images: [
          ],
          attributes: [
            {
              id: 0,
              name: 'reverse-domain-name',
              position: 0,
              visible: false,
              variation: false,
              options: [
                'org.openjsf.node-red'
              ]
            },
            {
              id: 0,
              name: 'editor',
              position: 1,
              visible: false,
              variation: false,
              options: [
                ':1880'
              ]
            }
          ],
          default_attributes: [
          ],
          variations: [
          ],
          grouped_products: [
          ],
          menu_order: 0,
          price_html: '<span class="woocommerce-Price-amount amount"><bdi>1,00&nbsp;<span class="woocommerce-Price-currencySymbol">&euro;</span></bdi></span>',
          related_ids: [
            36,
            38,
            40,
            35,
            39
          ],
          meta_data: [
            {
              id: 712,
              key: 'port-author-name',
              value: 'OpenJS Foundation'
            },
            {
              id: 713,
              key: 'port-release',
              value: ''
            },
            {
              id: 714,
              key: 'port-version',
              value: '2.1.4'
            },
            {
              id: 715,
              key: 'product-contpadding',
              value: 'on'
            },
            {
              id: 716,
              key: 'disable-woo',
              value: 'off'
            },
            {
              id: 717,
              key: 'fetch_data_itunes',
              value: 'on'
            },
            {
              id: 718,
              key: 'app-icon',
              value: 'http://mp-dev.flecs.tech/wp-content/uploads/2022/01/node-red-logo.png'
            },
            {
              id: 719,
              key: 'app-custom-link',
              value: [
                {
                  title: 'Create First Flow',
                  icon: '',
                  download_text: ' ',
                  url: 'https://nodered.org/docs/tutorials/first-flow'
                },
                {
                  title: 'User Guide',
                  icon: '',
                  download_text: ' ',
                  url: 'https://nodered.org/docs/user-guide/'
                }
              ]
            },
            {
              id: 720,
              key: 'port-requirement',
              value: 'amd64'
            },
            {
              id: 721,
              key: 'custom-screenshot',
              value: ''
            },
            {
              id: 1670,
              key: 'app-custom-meta',
              value: ''
            }
          ]
        }]
      )
      : reject(new Error('Mock: Failed to get products'))
  })
}

function getReverseDomainName (app) {
  return new Promise((resolve, reject) => {
    app
      ? resolve('org.openjsf.node-red')
      : reject(new Error('Mock: Failed to get reverse domain name'))
  })
}

function getEditorAddress (app) {
  return ''
}

function getAppIcon (app) {
  return 'blabla'
}

function getAuthor (app) {
  return 'blabla'
}

function getVersion (app) {
  return ''
}

function getVersions (app) {
  return []
}

function getBlacklist (app) {
  return []
}

function isBlacklisted (systemInfo, blacklist) {
  return false
}

function getShortDescription (app) {
  return ''
}

function getCustomLinks (app) {
  return []
}

function getMultiInstance (app) {
  return false
}

function getRequirement (app) {
  return []
}

function getId (app) {
  return 1
}

function getCategories (app) {
  return []
}

function getCategoryID () {
  return 27
}

function getAverageRating (app) {
  return '5'
}

function getRatingCount (app) {
  return 1
}

export { getProducts, getAverageRating, getBlacklist, isBlacklisted, getRatingCount, getReverseDomainName, getEditorAddress, getAppIcon, getId, getCategories, getCategoryID, getAuthor, getVersion, getVersions, getShortDescription, getCustomLinks, getMultiInstance, getRequirement }
