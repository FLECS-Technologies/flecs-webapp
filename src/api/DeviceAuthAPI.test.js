/*
 * Copyright (c) 2022 FLECS Technologies GmbH
 *
 * Created on Mon Feb 14 2022
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
import axios from 'axios'
import { act } from 'react-dom/test-utils'
import { DeviceAPIConfiguration } from './api-config'
import { postMPLogin, postMPLogout } from './DeviceAuthAPI'

jest.mock('axios')

const testUser = {
  user: {
    data: {
      user_login: 'test-customer',
      user_nicename: 'test-customer',
      display_name: 'test-customer',
      user_url: '',
      user_email: 'test-customer@test.test',
      user_registered: '2022-01-13 08:43:14'
    }
  },
  redirect: null,
  jwt: {
    token: 'mytoken',
    token_expires: 123
  }
}

describe('DeviceAuthAPI', () => {
  beforeEach(() => {
  })

  afterAll(() => {
    jest.resetAllMocks()
  })

  test('calls successfull mp-login', async () => {
    axios.post.mockResolvedValueOnce()
    await act(async () => {
      postMPLogin(testUser)
    })

    expect(axios.post).toHaveBeenCalledWith(DeviceAPIConfiguration.DEVICE_ROUTE + DeviceAPIConfiguration.POST_MP_LOGIN_URL, { user: testUser.user.data.user_login, token: testUser.jwt.token })
  })

  test('calls successfull mp-logout', async () => {
    axios.post.mockResolvedValueOnce()
    await act(async () => {
      postMPLogout(testUser)
    })

    expect(axios.post).toHaveBeenCalledWith(DeviceAPIConfiguration.DEVICE_ROUTE + DeviceAPIConfiguration.POST_MP_LOGOUT_URL, { user: testUser.user.data.user_login })
  })

  test('calls failed mp-login', async () => {
    axios.post.mockReturnValue(Promise.reject(new Error('Failed to login user at the device')))
    await act(async () => { expect(postMPLogin(testUser)).rejects.toThrowError() })
  })

  test('calls successfull mp-logout', async () => {
    axios.post.mockReturnValue(Promise.reject(new Error('Failed to log out user from the device')))
    await act(async () => { expect(postMPLogout(testUser)).rejects.toThrowError() })
  })
})
