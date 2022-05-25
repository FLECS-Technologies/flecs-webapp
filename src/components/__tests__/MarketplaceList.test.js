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

import React from 'react'
import '@testing-library/jest-dom'
import MPList from '../MarketplaceList'
import { getProducts } from '../../api/ProductService'
import { render, fireEvent, within, waitFor } from '@testing-library/react'

jest.mock('../../api/ProductService', () => ({
  ...jest.requireActual('../../api/ProductService'),
  getProducts: jest.fn()
}))
// jest.mock('../api/ProductService', () => ({ getProducts: jest.fn() }))
// jest.useFakeTimers()

describe('Marketplace List', () => {
  let container
  const products = [{
    id: 35,
    name: 'CODESYS Control SL',
    status: 'publish',
    short_description: '<p>IEC61131-3 Runtime.</p>\n',
    sku: '',
    price: '1',
    categories: [
      {
        id: 15,
        name: 'Unkategorisiert',
        slug: 'unkategorisiert'
      }
    ],
    meta_data: [
      {
        id: 664,
        key: 'port-author-name',
        value: 'CODESYS GmbH'
      },
      {
        id: 665,
        key: 'port-release',
        value: ''
      },
      {
        id: 666,
        key: 'port-version',
        value: '4.2.0.0'
      },
      {
        id: 670,
        key: 'app-icon',
        value: 'http://mp-dev.flecs.tech/wp-content/uploads/2022/01/codesys-logo.png'
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
            value: 'com.codesys.control'
          }
        ]
      }
    ]
  }]
  const installedApps = [
    {
      app: 'com.codesys.control',
      avatar:
        'https://store.codesys.com/media/catalog/product/cache/adefa4dac3229abc7b8dba2f1e919681/c/o/codesys-200px_1.png',
      title: 'CODESYS Control',
      author: 'CODESYS GmbH',
      version: '4.2.0',
      description: 'IEC61131-3 Runtime.',
      availability: 'available',
      status: 'uninstalled',
      multiInstance: true,
      instances: []
    },
    {
      app: 'com.codesys.edge',
      avatar:
        'https://store.codesys.com/media/catalog/product/cache/adefa4dac3229abc7b8dba2f1e919681/c/o/codesys-200px_1.png',
      title: 'CODESYS Edge Gateway',
      author: 'CODESYS GmbH',
      version: '4.1.0',
      description: 'Gateway to connect to CODESYS RTS.',
      availability: 'available',
      status: 'uninstalled',
      multiInstance: false,
      instances: []
    },
    {
      app: 'org.mosquitto.broker',
      avatar:
        'https://d1q6f0aelx0por.cloudfront.net/product-logos/library-eclipse-mosquitto-logo.png',
      title: 'Mosquitto MQTT',
      author: 'Eclipse Foundation',
      version: '2.0.14-openssl',
      description: 'MQTT broker.',
      availability: 'available',
      status: 'uninstalled',
      multiInstance: false,
      instances: []
    }]

  afterAll(() => {
    jest.resetAllMocks()
  })

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  afterEach(() => {
    document.body.removeChild(container)
    container = null
  })

  test('renders marketplace list component', async () => {
    getProducts.mockReturnValueOnce(Promise.resolve(products))

    const { getByTestId, queryAllByTestId } = render(<MPList appData={installedApps} />, container)

    const searchBar = await waitFor(() => getByTestId('search-bar'))
    expect(searchBar).toBeInTheDocument()

    const apps = queryAllByTestId('app-card')

    expect(searchBar).toBeVisible()
    expect(apps).toHaveLength(1)
  })

  test('filter apps by free text', async () => {
    getProducts.mockReturnValueOnce(Promise.resolve(products))

    const { getByTestId, queryAllByTestId } = render(<MPList appData={installedApps} />)

    const searchBar = await waitFor(() => getByTestId('search-bar'))
    const input = within(searchBar).getByRole('combobox')

    fireEvent.change(input, { target: { value: 'control' } })

    const apps = queryAllByTestId('app-card')

    expect(apps).toHaveLength(1)
  })

  test('filter apps by installable filter', async () => {
    getProducts.mockReturnValueOnce(Promise.resolve(products))

    const { getByTestId } = render(<MPList appData={installedApps} />)

    const searchBar = await waitFor(() => getByTestId('search-bar'))
    const filterButton = within(searchBar).getByLabelText('filter')

    expect(filterButton).toBeEnabled()

    fireEvent.click(filterButton)

    const filterByInstallable = await waitFor(() => getByTestId('installable-filter'))
    expect(filterByInstallable).toBeEnabled()

    fireEvent.click(filterByInstallable)
  })

  test('fetching products failed', async () => {
    getProducts.mockReturnValueOnce(Promise.reject(new Error('failed to load products')))

    const { getByTestId, queryAllByTestId } = render(<MPList appData={installedApps} />)

    const searchBar = await waitFor(() => getByTestId('search-bar'))

    expect(searchBar).toBeInTheDocument()

    const apps = queryAllByTestId('app-card')

    expect(apps).toHaveLength(0)
  })
})
