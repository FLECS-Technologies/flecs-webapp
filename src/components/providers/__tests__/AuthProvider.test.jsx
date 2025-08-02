/*
 * Copyright (c) 2022 FLECS Technologies GmbH
 *
 * Created on Sun Jan 16 2022
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

import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AuthProvider } from '../AuthProvider';

const mockUser = {
  user: {
    data: {
      ID: 4,
      user_login: 'homer-simpson',
      user_nicename: 'Homer Simpson',
      display_name: 'Homer Simpson',
      user_url: '',
      user_email: 'homer-simpson@springfield.io',
      user_registered: '2022-01-13 08:43:14',
    },
    redirect: null,
    jwt: {
      token: 'supersafetoken',
      token_expires: 1642255418,
    },
  },
  setUser: jest.fn(),
};

jest.mock('react', () => {
  const ActualReact = jest.requireActual('react');
  return {
    ...ActualReact,
    useContext: () => ({ mockUser }), // what you want to return when useContext get fired goes here
  };
});

describe('AuthProvider', () => {
  afterAll(() => {
    jest.clearAllMocks();
  });
  test('renders AuthProvider component', () => {
    render(<AuthProvider />);
  });
});
