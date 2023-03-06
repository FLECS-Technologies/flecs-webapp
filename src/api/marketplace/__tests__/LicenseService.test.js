/*
 * Copyright (c) 2022 FLECS Technologies GmbH
 *
 * Created on Thu Feb 17 2022
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

import '@testing-library/dom'
import { act } from 'react-dom/test-utils'
import { waitFor } from '@testing-library/react'
import axios from 'axios'
import { getCurrentUserLicenses, setLicensedApp } from '../LicenseService'

jest.mock('axios')

const mockLicenses = {
  data:
    {
      response: {
        licenses: [
          {
            license_id: '497',
            product_id: '31',
            variation_id: '0',
            license_key: '204E-6914-EA60-185E',
            image_license_key: null,
            license_status: 'sold',
            owner_first_name: 'Test',
            owner_last_name: 'Test',
            owner_email_address: 'contact@example.com',
            activation_date: null,
            creation_date: '2021-01-23',
            expiration_date: '2021-02-23',
            valid: '30',
            order_id: '270',
            sold_date: '2021-04-23',
            product_name: 'Product name',
            variation_name: 'Variation name',
            delivery_limit: '0',
            remaining_delivery_times: '0',
            activation_limit: '1',
            remaining_activations: '1'
          },
          {
            license_id: '496',
            product_id: '31',
            variation_id: '0',
            license_key: '812A-434E-8805-F24F',
            image_license_key: null,
            license_status: 'sold',
            owner_first_name: 'Test',
            owner_last_name: 'Test',
            owner_email_address: 'contact@example.com',
            activation_date: null,
            creation_date: '2021-04-23',
            expiration_date: null,
            valid: '30',
            order_id: '270',
            sold_date: '2021-04-23',
            product_name: 'Product name',
            variation_name: 'Variation name',
            delivery_limit: '0',
            remaining_delivery_times: '0',
            activation_limit: '1',
            remaining_activations: '1'
          },
          {
            license_id: '495',
            product_id: '31',
            variation_id: '0',
            license_key: '2B9D-1F8A-A36B-582D',
            image_license_key: null,
            license_status: 'sold',
            owner_first_name: 'Test',
            owner_last_name: 'Test',
            owner_email_address: 'contact@example.com',
            activation_date: null,
            creation_date: '2021-04-23',
            expiration_date: '2021-05-23',
            valid: '30',
            order_id: '270',
            sold_date: '2021-04-23',
            product_name: 'Product name',
            variation_name: 'Variation name',
            delivery_limit: '0',
            remaining_delivery_times: '0',
            activation_limit: '1',
            remaining_activations: '0'
          }
        ]
      }
    }
}

const mockMetaResponse = {
  data: {
    response: {
      result: 'success',
      code: '970',
      message: 'License key meta added',
      api_timestamp: 'current timestamp'
    },
    signature: 'Signature or OpenSSL error'
  }
}

describe('LicenseService', () => {
  beforeAll(() => {
    axios.post = jest.fn()
  })

  afterAll(() => {
    jest.resetAllMocks()
  })
  test('calls successful getCurrentUserLicenses', async () => {
    axios.post.mockResolvedValueOnce(mockLicenses)
    const licenses = await waitFor(() => getCurrentUserLicenses())

    expect(licenses).toHaveLength(1)
  })

  test('calls unsuccessful getCurrentUserLicenses', async () => {
    axios.post.mockResolvedValueOnce(mockLicenses)
    const licenses = await waitFor(() => getCurrentUserLicenses())

    expect(licenses).toHaveLength(1)
  })

  test('calls successful setLicensedApp', async () => {
    axios.post.mockResolvedValueOnce(mockMetaResponse)
    const response = await waitFor(() => setLicensedApp('license', 'app'))

    expect(response.result).toBe(mockMetaResponse.data.response.result)
  })

  test('calls unsuccessful setLicensedApp', async () => {
    axios.post.mockRejectedValueOnce(new Error('Failed to set meta'))
    await act(async () => {
      expect(setLicensedApp('license', 'app')).rejects.toThrowError()
    })
  })
})
