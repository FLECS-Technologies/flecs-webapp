/*
 * Copyright (c) 2022 FLECS Technologies GmbH
 *
 * Created on Wed Jan 05 2022
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
import '@testing-library/jest-dom';
import React from 'react';
import useStateWithLocalStorage from '../LocalStorage';

describe('LocalStorage', () => {
  // Cache original functionality
  // const realUseState = React.useState
  const setState = jest.fn();
  // Stub the initial state
  // const stubInitialState = ['stub data']

  // runs after each test has finished
  afterEach(() => {
    React.useState.mockClear();
    React.useEffect.mockClear();
  });

  test('Writes something into local storage and reads back the value', () => {
    jest.spyOn(localStorage, 'getItem');
    const useStateSpy = jest.spyOn(React, 'useState');
    useStateSpy.mockImplementation((init) => [init, setState]);
    const useEffectSpy = jest.spyOn(React, 'useEffect');
    useEffectSpy.mockImplementation((f) => f());
    const localStorageMock = {
      getItem: jest.fn(),
      setItem: jest.fn(),
      removeItem: jest.fn(),
      clear: jest.fn(),
    };

    global.localStorage = localStorageMock;

    const [test, setTest] = useStateWithLocalStorage('test.key', 'true');

    setTest(test);
    expect(useStateSpy.mock.calls.length).toBe(1);
    expect(useEffectSpy.mock.calls.length).toBe(1);
  });
});
