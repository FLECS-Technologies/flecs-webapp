/*
 * Copyright (c) 2022 FLECS Technologies GmbH
 *
 * Created on Mon Feb 07 2022
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
import { addToCart } from './Cart'
import CoCartAPI from '@cocart/cocart-rest-api'

jest.mock('@cocart/cocart-rest-api', () => ({
  ...jest.requireActual('@cocart/cocart-rest-api'),
  post: jest.fn()
}))

describe('Cart', () => {
  afterAll(() => {
    jest.resetAllMocks()
  })

  test('Successfull addToCart call', async () => {
    CoCartAPI.post.mockResolvedValue(Promise.resolve('my-cart-key'))
    const cartkey = await addToCart(12)

    expect(cartkey).toBe('my-cart-key')
  })

  test('Unsuccessfull addToCart call', async () => {
    // CoCartAPI.post.mockResolvedValueOnce(Promise.reject(new Error('Failed to add item to cart')))
  })
})
