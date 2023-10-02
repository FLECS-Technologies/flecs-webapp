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

async function getProducts () {
  return new Promise((resolve, reject) => {
    resolve([{
      id: 35,
      name: 'FLECS Service Mesh',
      status: 'publish',
      short_description: '<p>Communication and data exchange between all FLECS apps.</p>\n',
      sku: '',
      price: '',
      attributes: [
        {
          id: 0,
          name: 'archs',
          position: 3,
          visible: true,
          variation: true,
          options: [
            'amd64'
          ]
        }
      ],
      categories: [
        {
          id: 27,
          name: 'App',
          slug: 'app'
        },
        {
          id: 28,
          name: 'Communication',
          slug: 'communication'
        }
      ],
      meta_data: [
        {
          id: 664,
          key: 'port-author-name',
          value: 'FLECS Technologies GmbH'
        },
        {
          id: 665,
          key: 'port-release',
          value: ''
        },
        {
          id: 666,
          key: 'port-version',
          value: '2.0.2-dormouse'
        },
        {
          id: 670,
          key: 'app-icon',
          value: 'https://staging.flecs-technologies.com/wp-content/uploads/2021/07/FLECS-cyan.png'
        },
        {
          id: 672,
          key: 'port-requirement',
          value: ''
        },
        {
          id: 1669,
          key: 'app-custom-meta',
          value: [
            {
              title: 'reverse-domain-name',
              icon: '',
              value: 'tech.flecs.service-mesh'
            }
          ]
        }
      ]
    }])
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
  return ''
}

function getAuthor (app) {
  return ''
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
