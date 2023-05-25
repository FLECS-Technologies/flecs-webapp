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
import nock from 'nock'
import '@testing-library/jest-dom'
import { act } from 'react-dom/test-utils'
import MPList from '../MarketplaceList'
import { render, fireEvent, within, waitFor, screen } from '@testing-library/react'
import { DeviceAPIConfiguration } from '../../api/api-config'
import { FilterContextProvider } from '../../data/FilterContext'
import { ReferenceDataContextProvider } from '../../data/ReferenceDataContext'
import { AppList } from '../../data/AppList'

jest.mock('../../api/marketplace/ProductService')

const installedApps = [
  {
    appKey: {
      name: 'com.codesys.control',
      version: '4.2.0'
    },
    avatar: 'https://store.codesys.com/media/catalog/product/cache/adefa4dac3229abc7b8dba2f1e919681/c/o/codesys-200px_1.png',
    title: 'CODESYS Control',
    author: 'CODESYS GmbH',
    description: 'IEC61131-3 Runtime.',
    availability: 'available',
    status: 'uninstalled',
    multiInstance: true,
    instances: []
  },
  {
    appKey: {
      name: 'com.codesys.edge',
      version: '4.1.0'
    },
    avatar: 'https://store.codesys.com/media/catalog/product/cache/adefa4dac3229abc7b8dba2f1e919681/c/o/codesys-200px_1.png',
    title: 'CODESYS Edge Gateway',
    author: 'CODESYS GmbH',
    description: 'Gateway to connect to CODESYS RTS.',
    availability: 'available',
    status: 'uninstalled',
    multiInstance: false,
    instances: []
  },
  {
    appKey: {
      name: 'org.mosquitto.broker',
      version: '2.0.14-openssl'
    },
    avatar: 'https://d1q6f0aelx0por.cloudfront.net/product-logos/library-eclipse-mosquitto-logo.png',
    title: 'Mosquitto MQTT',
    author: 'Eclipse Foundation',
    description: 'MQTT broker.',
    availability: 'available',
    status: 'uninstalled',
    multiInstance: false,
    instances: []
  }
]

describe('Marketplace List', () => {
  let container

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
    nock('http://localhost')
      .get(DeviceAPIConfiguration.DEVICE_ROUTE + DeviceAPIConfiguration.APP_ROUTE + DeviceAPIConfiguration.GET_INSTALLED_APP_LIST_URL)
      .reply(200, installedApps)

    nock('http://localhost')
      .get(DeviceAPIConfiguration.DEVICE_ROUTE + DeviceAPIConfiguration.INSTANCES_ROUTE)
      .reply(200, [])

    await act(async () => {
      render(<FilterContextProvider><ReferenceDataContextProvider><AppList><MPList /></AppList></ReferenceDataContextProvider></FilterContextProvider>, container)
    })

    const searchBar = await waitFor(() => screen.getByTestId('search-bar'))
    expect(searchBar).toBeInTheDocument()

    const apps = screen.queryAllByTestId('app-card')

    expect(searchBar).toBeVisible()
    expect(apps).toHaveLength(1)
  })

  test('filter apps by free text', async () => {
    nock('http://localhost')
      .get(DeviceAPIConfiguration.DEVICE_ROUTE + DeviceAPIConfiguration.APP_ROUTE + DeviceAPIConfiguration.GET_INSTALLED_APP_LIST_URL)
      .reply(200, installedApps)

    nock('http://localhost')
      .get(DeviceAPIConfiguration.DEVICE_ROUTE + DeviceAPIConfiguration.INSTANCES_ROUTE)
      .reply(200, [])

    await act(async () => {
      render(<FilterContextProvider><ReferenceDataContextProvider><AppList><MPList /></AppList></ReferenceDataContextProvider></FilterContextProvider>)
    })

    const searchBar = await waitFor(() => screen.getByTestId('search-bar'))
    const input = within(searchBar).getByRole('combobox')

    await act(async () => {
      fireEvent.change(input, { target: { value: 'control' } })
    })

    const apps = screen.queryAllByTestId('app-card')

    expect(apps).toHaveLength(1)
  })

  test('filter apps by available filter', async () => {
    nock('http://localhost')
      .get(DeviceAPIConfiguration.DEVICE_ROUTE + DeviceAPIConfiguration.APP_ROUTE + DeviceAPIConfiguration.GET_INSTALLED_APP_LIST_URL)
      .reply(200, installedApps)

    nock('http://localhost')
      .get(DeviceAPIConfiguration.DEVICE_ROUTE + DeviceAPIConfiguration.INSTANCES_ROUTE)
      .reply(200, [])

    await act(async () => {
      render(<FilterContextProvider><ReferenceDataContextProvider><AppList><MPList /></AppList></ReferenceDataContextProvider></FilterContextProvider>)
    })

    const searchBar = await waitFor(() => screen.getByTestId('search-bar'))
    const filterButton = within(searchBar).getByLabelText('filter')

    expect(filterButton).toBeEnabled()

    await act(async () => {
      fireEvent.click(filterButton)
    })

    const filterByAvailable = await waitFor(() => screen.getByTestId('available-filter'))
    expect(filterByAvailable).toBeEnabled()

    await act(async () => {
      fireEvent.click(filterByAvailable) // shows only available apps
    })

    await act(async () => {
      fireEvent.click(filterByAvailable) // shows all apps again, available and unavailable
    })
  })

  test('filter apps by category filter', async () => {
    nock('http://localhost')
      .get(DeviceAPIConfiguration.DEVICE_ROUTE + DeviceAPIConfiguration.APP_ROUTE + DeviceAPIConfiguration.GET_INSTALLED_APP_LIST_URL)
      .reply(200, installedApps)

    nock('http://localhost')
      .get(DeviceAPIConfiguration.DEVICE_ROUTE + DeviceAPIConfiguration.INSTANCES_ROUTE)
      .reply(200, [])

    await act(async () => {
      render(<FilterContextProvider><ReferenceDataContextProvider><AppList><MPList /></AppList></ReferenceDataContextProvider></FilterContextProvider>)
    })

    const searchBar = await waitFor(() => screen.getByTestId('search-bar'))
    const filterButton = within(searchBar).getByLabelText('filter')

    expect(filterButton).toBeEnabled()

    await act(async () => {
      fireEvent.click(filterButton)
    })

    const filterByCategory = await waitFor(() => screen.getByTestId('category-filter'))
    expect(filterByCategory).toBeEnabled()

    await act(async () => {
      fireEvent.click(filterByCategory)
    })
  })

  test('filter apps by search filter', async () => {
    nock('http://localhost')
      .get(DeviceAPIConfiguration.DEVICE_ROUTE + DeviceAPIConfiguration.APP_ROUTE + DeviceAPIConfiguration.GET_INSTALLED_APP_LIST_URL)
      .reply(200, installedApps)

    nock('http://localhost')
      .get(DeviceAPIConfiguration.DEVICE_ROUTE + DeviceAPIConfiguration.INSTANCES_ROUTE)
      .reply(200, [])

    await act(async () => {
      render(<FilterContextProvider><ReferenceDataContextProvider><AppList><MPList /></AppList></ReferenceDataContextProvider></FilterContextProvider>)
    })

    const searchBar = await waitFor(() => screen.getByTestId('search-bar'))
    const filterButton = within(searchBar).getByLabelText('filter')

    expect(filterButton).toBeEnabled()

    await act(async () => {
      fireEvent.click(filterButton)
    })

    const filterBySearchButton = await waitFor(() => screen.getByTestId('search-filter'))
    expect(filterBySearchButton).toBeEnabled()

    await act(async () => {
      fireEvent.click(filterBySearchButton)
    })

    const disabledFilterBySearchButton = await waitFor(() => screen.getByTestId('search-filter'))
    const buttonStyle = window.getComputedStyle(disabledFilterBySearchButton)
    const color = buttonStyle.backgroundColor
    expect(color).toEqual('transparent')
    expect(filterBySearchButton).toBeEnabled()
  })

  test('fetching products failed', async () => {
    nock('http://localhost')
      .get(DeviceAPIConfiguration.DEVICE_ROUTE + DeviceAPIConfiguration.APP_ROUTE + DeviceAPIConfiguration.GET_INSTALLED_APP_LIST_URL)
      .reply(200, installedApps)

    nock('http://localhost')
      .get(DeviceAPIConfiguration.DEVICE_ROUTE + DeviceAPIConfiguration.INSTANCES_ROUTE)
      .reply(200, [])

    await act(async () => {
      render(<FilterContextProvider><ReferenceDataContextProvider><AppList><MPList /></AppList></ReferenceDataContextProvider></FilterContextProvider>)
    })

    const searchBar = await waitFor(() => screen.getByTestId('search-bar'))

    expect(searchBar).toBeInTheDocument()

    const apps = screen.queryAllByTestId('app-card')

    expect(apps).toHaveLength(0)
  })
})
