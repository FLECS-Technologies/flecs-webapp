/*
 * Copyright (c) 2022 FLECS Technologies GmbH
 *
 * Created on Mon Jun 10 2024
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
import '@testing-library/dom';
import { waitFor } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import axios from 'axios';
import { LicenseInfoAPI } from '../info';
import { mockLicenseInfoAPIResponse } from '../__mocks__/info';

jest.mock('axios');

describe('LicenseInfoAPI', () => {
  beforeAll(() => {
    axios.get = jest.fn();
  });

  afterAll(() => {
    jest.clearAllMocks();
  });
  test('calls successful LicenseInfoAPI', async () => {
    axios.get.mockResolvedValueOnce(mockLicenseInfoAPIResponse);
    const response = await waitFor(() => LicenseInfoAPI());

    expect(response.isValid).toBe(mockLicenseInfoAPIResponse.data.isValid);
  });

  test('calls unsuccessful LicenseInfoAPI', async () => {
    axios.get.mockRejectedValueOnce(new Error('Fetching license info failed.'));
    await act(async () => {
      expect(LicenseInfoAPI()).rejects.toThrow();
    });
  });
});
