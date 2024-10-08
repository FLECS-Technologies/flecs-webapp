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

import React, { act } from 'react'
import nock from 'nock'
import '@testing-library/jest-dom'
import MPList from '../MarketplaceList'
import {
  render,
  fireEvent,
  within,
  waitFor,
  screen
} from '@testing-library/react'
import { DeviceAPIConfiguration } from '../../api/api-config'
import { FilterContextProvider } from '../../data/FilterContext'
import { ReferenceDataContextProvider } from '../../data/ReferenceDataContext'
import { AppList } from '../../data/AppList'
import { JobsContextProvider } from '../../data/JobsContext'

jest.mock('../../api/marketplace/ProductService')
jest.mock('../../api/device/JobsAPI')
// Mock the FLECSLogo component to avoid rendering its implementation in tests
jest.mock('../navigation/PoweredBy')

const installedApps = [
  {
    appKey: {
      name: 'com.codesys.control',
      version: '4.2.0'
    },
    avatar:
      'https://store.codesys.com/media/catalog/product/cache/adefa4dac3229abc7b8dba2f1e919681/c/o/codesys-200px_1.png',
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
    avatar:
      'https://store.codesys.com/media/catalog/product/cache/adefa4dac3229abc7b8dba2f1e919681/c/o/codesys-200px_1.png',
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
    avatar:
      'https://d1q6f0aelx0por.cloudfront.net/product-logos/library-eclipse-mosquitto-logo.png',
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
    window.localStorage.clear() // clear the hidden categories etc
    container = document.createElement('div')
    document.body.appendChild(container)

    nock('http://localhost')
      .get(
        DeviceAPIConfiguration.DEVICE_BASE_ROUTE +
          DeviceAPIConfiguration.APP_ROUTE +
          DeviceAPIConfiguration.GET_INSTALLED_APP_LIST_URL
      )
      .reply(200, installedApps)

    nock('http://localhost')
      .get(
        DeviceAPIConfiguration.DEVICE_BASE_ROUTE +
          DeviceAPIConfiguration.INSTANCES_ROUTE
      )
      .reply(200, [])
  })

  afterEach(() => {
    document.body.removeChild(container)
    container = null
  })

  test('renders marketplace list component', async () => {
    await act(async () => {
      render(
        <JobsContextProvider>
          <FilterContextProvider>
            <ReferenceDataContextProvider>
              <AppList>
                <MPList />
              </AppList>
            </ReferenceDataContextProvider>
          </FilterContextProvider>
        </JobsContextProvider>,
        container
      )
    })

    const searchBar = await waitFor(() => screen.getByTestId('search-bar'))
    expect(searchBar).toBeInTheDocument()

    const apps = screen.queryAllByTestId('app-card')

    expect(searchBar).toBeVisible()
    expect(apps).toHaveLength(1)
  })

  test('filter apps by free text', async () => {
    await act(async () => {
      render(
        <JobsContextProvider>
          <FilterContextProvider>
            <ReferenceDataContextProvider>
              <AppList>
                <MPList />
              </AppList>
            </ReferenceDataContextProvider>
          </FilterContextProvider>
        </JobsContextProvider>
      )
    })

    const searchBar = await waitFor(() => screen.getByTestId('search-bar'))
    const input = within(searchBar).getByRole('combobox')

    await act(async () => {
      fireEvent.change(input, { target: { value: 'mesh' } })
    })

    const apps = screen.queryAllByTestId('app-card')

    expect(apps).toHaveLength(1)
  })

  test('filter apps by available filter', async () => {
    await act(async () => {
      render(
        <JobsContextProvider>
          <FilterContextProvider>
            <ReferenceDataContextProvider>
              <AppList>
                <MPList />
              </AppList>
            </ReferenceDataContextProvider>
          </FilterContextProvider>
        </JobsContextProvider>
      )
    })

    const searchBar = await waitFor(() => screen.getByTestId('search-bar'))
    const filterButton = within(searchBar).getByLabelText('filter')

    expect(filterButton).toBeEnabled()

    await act(async () => {
      fireEvent.click(filterButton)
    })

    const filterByAvailable = await waitFor(() =>
      screen.getByTestId('available-filter')
    )
    expect(filterByAvailable).toBeEnabled()

    await act(async () => {
      fireEvent.click(filterByAvailable) // shows only available apps
    })

    await act(async () => {
      fireEvent.click(filterByAvailable) // shows all apps again, available and unavailable
    })

    const apps = await waitFor(() => screen.queryAllByTestId('app-card'))
    expect(apps).toHaveLength(1)
  })

  test('filter apps by category filter', async () => {
    await act(async () => {
      render(
        <JobsContextProvider>
          <FilterContextProvider>
            <ReferenceDataContextProvider>
              <AppList>
                <MPList />
              </AppList>
            </ReferenceDataContextProvider>
          </FilterContextProvider>
        </JobsContextProvider>
      )
    })

    const searchBar = await waitFor(() => screen.getByTestId('search-bar'))
    const filterButton = within(searchBar).getByLabelText('filter')

    expect(filterButton).toBeEnabled()

    await act(async () => {
      fireEvent.click(filterButton)
    })

    const filterByCategory = await waitFor(() =>
      screen.getByTestId('category-filter')
    )
    expect(filterByCategory).toBeEnabled()

    let apps = await waitFor(() => screen.queryAllByTestId('app-card'))
    expect(apps).toHaveLength(1)

    await act(async () => {
      // disables the app category
      fireEvent.click(filterByCategory)
    })

    apps = await waitFor(() => screen.queryAllByTestId('app-card'))
    expect(apps).toHaveLength(0)
  })

  test('filter apps by search filter', async () => {
    await act(async () => {
      render(
        <JobsContextProvider>
          <FilterContextProvider>
            <ReferenceDataContextProvider>
              <AppList>
                <MPList />
              </AppList>
            </ReferenceDataContextProvider>
          </FilterContextProvider>
        </JobsContextProvider>
      )
    })

    // searches for a valid app
    const searchBar = await waitFor(() => screen.getByTestId('search-bar'))
    const input = within(searchBar).getByRole('combobox')
    await act(async () => {
      fireEvent.change(input, { target: { value: 'mesh' } })
    })

    // opens the filter section
    const filterButton = within(searchBar).getByLabelText('filter')
    expect(filterButton).toBeEnabled()
    await act(async () => {
      fireEvent.click(filterButton)
    })

    // searches for the filter-by-search button
    const filterBySearchButton = await waitFor(() =>
      screen.getByTestId('search-filter')
    )
    expect(filterBySearchButton).toBeEnabled()

    // expects to find the app it searched for
    let apps = await waitFor(() => screen.queryAllByTestId('app-card'))
    expect(apps).toHaveLength(1)

    // disables the search filter
    await act(async () => {
      fireEvent.click(filterBySearchButton)
    })

    // expects the filter-by-search button to have the disabled background colour
    const disabledFilterBySearchButton = await waitFor(() =>
      screen.getByTestId('search-filter')
    )
    const buttonStyle = window.getComputedStyle(disabledFilterBySearchButton)
    const color = buttonStyle.backgroundColor
    expect(color).toEqual('transparent')
    expect(filterBySearchButton).toBeEnabled()

    // reactivates the search filter
    await act(async () => {
      fireEvent.click(filterBySearchButton)
    })

    // searches for an invalid app
    await act(async () => {
      fireEvent.change(input, { target: { value: 'fake app' } })
    })

    // expects NOT to find the app it searched for
    apps = await waitFor(() => screen.queryAllByTestId('app-card'))
    expect(apps).toHaveLength(0)
  })

  test('fetching products failed', async () => {
    await act(async () => {
      render(
        <JobsContextProvider>
          <FilterContextProvider>
            <ReferenceDataContextProvider>
              <MPList />
            </ReferenceDataContextProvider>
          </FilterContextProvider>
        </JobsContextProvider>
      )
    }) // missing <AppList></AppList> so that products won't be loaded

    const apps = screen.queryAllByTestId('app-card')
    expect(apps).toHaveLength(0)
  })

  test('pagination', async () => {
    await act(async () => {
      render(
        <JobsContextProvider>
          <FilterContextProvider>
            <ReferenceDataContextProvider>
              <AppList>
                <MPList />
              </AppList>
            </ReferenceDataContextProvider>
          </FilterContextProvider>
        </JobsContextProvider>
      )
    })

    const nextPageButton = await waitFor(() =>
      screen.getByLabelText('Go to next page')
    )
    const previousPageButton = await waitFor(() =>
      screen.getByLabelText('Go to previous page')
    )

    const currentPage = document.getElementsByClassName(
      'MuiTablePagination-displayedRows'
    )[0]
    expect(currentPage).toBeInTheDocument()
    expect(currentPage.textContent).toBe('1–1 of 1')

    expect(nextPageButton).toBeVisible()
    expect(nextPageButton).not.toBeEnabled()
    expect(previousPageButton).toBeVisible()
    expect(previousPageButton).not.toBeEnabled()
  })
})
