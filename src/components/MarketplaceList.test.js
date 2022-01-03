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
import { render, fireEvent, within } from '@testing-library/react'
import '@testing-library/jest-dom'
import MPList from './MarketplaceList'

describe('Marketplace List', () => {
  const marketPlaceAppsList = [
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

  test('renders marketplace list component', () => {
    const { getByTestId, queryAllByTestId } = render(<MPList appData={marketPlaceAppsList} />)

    const searchBar = getByTestId('search-bar')
    const apps = queryAllByTestId('app-card')

    expect(searchBar).toBeVisible()
    expect(apps).toHaveLength(3)
  })

  test('filter apps by free text', () => {
    const { getByTestId, queryAllByTestId } = render(<MPList appData={marketPlaceAppsList} />)

    const searchBar = getByTestId('search-bar')
    const input = within(searchBar).getByRole('textbox')

    fireEvent.change(input, { target: { value: 'mqtt' } })

    const apps = queryAllByTestId('app-card')

    expect(apps).toHaveLength(1)
  })
})
