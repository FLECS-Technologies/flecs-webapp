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

import React from 'react';
import { render } from '@testing-library/react';
import { describe, it, vi } from 'vitest';
import { SystemContextProvider } from '../SystemProvider';

// Mock the DeviceActivationProvider to avoid state update warnings
vi.mock('../../components/providers/DeviceActivationProvider', () => ({
  default: ({ children }) => children,
}));

const mockSystem = {
  ping: true,
  setPing: vi.fn(),
  loading: false,
  setLoading: vi.fn(),
};

vi.mock('react', async () => {
  const ActualReact = await vi.importActual('react');
  return {
    ...ActualReact,
    useContext: () => ({ mockSystem }),
  };
});

describe('SystemContextProvider', () => {
  it('renders SystemContextProvider component', () => {
    render(<SystemContextProvider />);
  });
});
