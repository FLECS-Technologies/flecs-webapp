/*
 * Copyright (c) 2022 FLECS Technologies GmbH
 *
 * Created on Tue Feb 01 2022
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
import { waitFor } from '@testing-library/dom'
import axios from 'axios'
import { getProducts } from './ProductService'

jest.mock('axios')

const mockProducts = {
  data: {
    success: true,
    products: [{
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
  }
}

describe('ProductService', () => {
  beforeEach(() => {
    mockProducts.data.success = true
  })

  afterAll(() => {
    jest.resetAllMocks()
  })
  test('calls successfull getProducts', async () => {
    axios.get.mockResolvedValueOnce(mockProducts)
    const products = await waitFor(() => getProducts())

    expect(products).toHaveLength(1)
  })

  test('calls unsuccessfull getProducts', async () => {
    mockProducts.data.success = false
    axios.get.mockResolvedValueOnce(mockProducts)
    const products = await waitFor(() => getProducts())

    expect(products).toBeUndefined()
  })

  test('calls successfull getProducts with status param', async () => {
    const queryParam = {}
    queryParam.status = 'publish'

    axios.get.mockResolvedValueOnce(mockProducts)
    const products = await waitFor(() => getProducts(queryParam))

    expect(products).toHaveLength(1)
  })
})
