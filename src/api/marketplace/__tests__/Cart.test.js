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
import '@testing-library/jest-dom'
import { addToCart } from '../Cart'
import CoCartAPI from '@cocart/cocart-rest-api'

const responseData = {
  data: {
    cart_key: 'my-cart-key'
  }
}

describe('Cart', () => {
  beforeEach(() => {
  })
  afterAll(() => {
    jest.resetAllMocks()
  })

  test('Successful addToCart call', async () => {
    const spy = jest.spyOn(CoCartAPI.prototype, 'post').mockResolvedValueOnce(responseData)
    const cartkey = await addToCart(12)

    expect(spy).toHaveBeenCalled()
    expect(cartkey).toBe(responseData.data.cart_key)

    spy.mockRestore()
  })

  test('Unsuccessful addToCart call', async () => {
    const spy = jest.spyOn(CoCartAPI.prototype, 'post').mockRejectedValueOnce('failed to add item.')

    await addToCart(12)
      .catch(e => {
        expect(e).toEqual('failed to add item.')
      })

    expect(spy).toHaveBeenCalled()

    spy.mockRestore()
  })
})
