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
import { render, act, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import LicenseInfo from '../LicenseInfo';
import { mockDeviceLicenseInfoGet200Response } from '../../../../api/device/license/__mocks__/info';
import { vitest } from 'vitest';

vitest.mock('../../../../api/device/license/info');

describe('LicenseInfo Component', () => {
  afterAll(() => {
    vitest.clearAllMocks();
  });

  it('Show license info', async () => {
    render(<LicenseInfo />);
    await waitFor(() => {
      const licenseText = screen.getByText(mockDeviceLicenseInfoGet200Response.license || '');
      expect(licenseText).toBeInTheDocument();

      const typeText = screen.getByText(mockDeviceLicenseInfoGet200Response.type);
      expect(typeText).toBeInTheDocument();

      const sessionIdText = screen.getByText(
        mockDeviceLicenseInfoGet200Response.sessionId?.id || '',
      );
      expect(sessionIdText).toBeInTheDocument();

      const timestamp = screen.getByText(
        String(mockDeviceLicenseInfoGet200Response.sessionId?.timestamp),
      );
      expect(timestamp).toBeInTheDocument();
    });
  });
});
