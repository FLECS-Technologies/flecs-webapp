/*
 * Copyright (c) 2022 FLECS Technologies GmbH
 *
 * Created on Tue Mar 01 2022
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
import { act } from 'react-dom/test-utils'
import { MarketplaceAPIConfiguration } from '../api-config'
import AuthService from '../AuthService'

jest.mock('axios')

const testUser = {
  data: {
    user: {
      data: {
        ID: 4,
        user_login: 'tester',
        user_nicename: 'Tester',
        display_name: 'Tester',
        user_url: '',
        user_email: 'tester@test.test',
        user_registered: '2022-01-13'
      }
    },
    redirect: null,
    jwt: {
      token: 'abcdef-ghijkl',
      token_expires: 123
    }
  }
}

const testValidation = {
  data:
    {
      iat: 123,
      iss: 'https://mp-dev.flecs.tech',
      exp: 123,
      jti: 'abcdef-ghijkl',
      userId: 0,
      revocable: true,
      refreshable: null,
      isValid: true

    }
}

describe('AuthService', () => {
  afterAll(() => {
    jest.resetAllMocks()
  })

  // test cases for login()
  test('calls successfull AuthService.login', async () => {
    axios.post.mockResolvedValueOnce(testUser)
    const user = await waitFor(() => AuthService.login('tester', 'PW123'))

    expect(user.user.data.user_nicename).toBe('Tester')
    expect(axios.post).toHaveBeenCalledWith(MarketplaceAPIConfiguration.MP_BASE_URL + MarketplaceAPIConfiguration.POST_AUTHENTICATE_URL, { issueJWT: true, password: 'PW123', username: 'tester' })
  })

  test('calls unsuccessfull AuthService.login', async () => {
    axios.post.mockRejectedValueOnce(new Error('Failed to login'))
    await act(async () => { expect(AuthService.login('tester', 'PW123')).rejects.toThrowError() })

    expect(axios.post).toHaveBeenCalledWith(MarketplaceAPIConfiguration.MP_BASE_URL + MarketplaceAPIConfiguration.POST_AUTHENTICATE_URL, { issueJWT: true, password: 'PW123', username: 'tester' })
  })

  // test cases for validate()
  test('calls successfull AuthService.validate', async () => {
    axios.post.mockResolvedValueOnce(testValidation)
    const validation = await waitFor(() => AuthService.validate(testUser.data.jwt.token))

    expect(validation.isValid).toBeTruthy()
    expect(axios.post).toHaveBeenCalledWith(MarketplaceAPIConfiguration.MP_BASE_URL + MarketplaceAPIConfiguration.POST_VALIDATE_URL, { jwt: testUser.data.jwt.token })
  })

  test('calls unsuccessfull AuthService.validate', async () => {
    axios.post.mockRejectedValueOnce(new Error('Failed to validate'))
    await act(async () => { expect(AuthService.validate(testUser.data.jwt.token)).rejects.toThrowError() })

    expect(axios.post).toHaveBeenCalledWith(MarketplaceAPIConfiguration.MP_BASE_URL + MarketplaceAPIConfiguration.POST_VALIDATE_URL, { jwt: testUser.data.jwt.token })
  })
})
