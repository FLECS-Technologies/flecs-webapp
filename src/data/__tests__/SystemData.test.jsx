/*
 * Copyright (c) 2022 FLECS Technologies GmbH
 *
 * Created on Mon Apr 11 2022
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
import { render } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import '@testing-library/jest-dom';
import { SystemData } from '../SystemData';
import { useSystemContext } from '../SystemProvider';
import { vitest } from 'vitest';

vitest.mock('../../api/device/SystemPingService');
vitest.mock('../../api/device/SystemInfoService');
vitest.mock('../SystemProvider', () => ({ useSystemContext: vitest.fn() }));

const mockSystem = {
  ping: true,
  setPing: jest.fn(),
  loading: false,
  setLoading: jest.fn(),
  systemInfo: undefined,
  setSystemInfo: jest.fn(),
};

vitest.mock('react', async () => {
  const ActualReact = await vitest.importActual('react');
  return {
    ...ActualReact,
    useContext: () => mockSystem, // Return mockSystem directly
  };
});

describe('SystemData', () => {
  afterAll(() => {
    vitest.clearAllMocks();
  });
  test('renders SystemData component', () => {
    useSystemContext.mockReturnValue(mockSystem);
    act(() => {
      render(<SystemData></SystemData>);
    });
  });
});
