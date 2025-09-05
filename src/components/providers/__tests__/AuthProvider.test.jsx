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
import { render, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AuthProvider } from '../AuthProvider';
import { createMockApi } from '../../../__mocks__/core-client-ts';

// Mock the API provider
const mockUsePublicApi = vi.fn();

vi.mock('../ApiProvider', () => ({
  usePublicApi: () => mockUsePublicApi(),
}));

// Mock react-oidc-context using direct function calls (avoid hoisting issues)
vi.mock('react-oidc-context', async () => {
  const { createMockAuthContext } = await import('../../../__mocks__/AuthProvider');
  const authMocks = createMockAuthContext();

  return {
    AuthProvider: authMocks.AuthProvider,
    useAuth: authMocks.useAuth,
  };
});

describe('AuthProvider', () => {
  let mockApi;

  beforeEach(() => {
    vi.clearAllMocks();
    mockApi = createMockApi();
    mockUsePublicApi.mockReturnValue(mockApi);
  });

  it('renders AuthProvider component', async () => {
    render(<AuthProvider />);

    await waitFor(() => {
      expect(mockApi.authentication.authProvidersDefaultProtocolGet).toHaveBeenCalled();
    });
  });
});
