/*
 * Copyright (c) 2022 FLECS Technologies GmbH
 *
 * Created on Fri Aug 12 2022
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
import { waitFor } from '@testing-library/react'
import { act } from 'react-dom/test-utils'
import axios from 'axios'
import { createAppRating } from '../AppRatingService'

jest.mock('axios')

const mockRating = {
  data: {
    rating: 5
  }
}

describe('AppRatingService', () => {
  beforeAll(() => {
    axios.get = jest.fn()
  })

  afterAll(() => {
    jest.clearAllMocks()
  })

  test('calls successful createAppRating', async () => {
    axios.post.mockResolvedValueOnce(mockRating)
    await waitFor(() => createAppRating(37))

    // expect(rating).toBe(mockRating.data.rating)
  })

  test('calls unsuccessful createAppRating', async () => {
    axios.post.mockRejectedValueOnce(new Error('Failed to create app rating'))
    await act(async () => {
      expect(createAppRating(37)).rejects.toThrowError()
    })
  })
})
