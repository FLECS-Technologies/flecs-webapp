/*
 * Copyright (c) 2022 FLECS Technologies GmbH
 *
 * Created on Thu Feb 10 2022
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
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import SideloadApp from '../SideloadApp';
import { ReferenceDataContextProvider } from '../../../../data/ReferenceDataContext';
import { vitest } from 'vitest';

const yaml = {
  appKey: {
    name: 'com.codesys.codesyscontrol',
    version: '4.2.0',
  },
  title: 'test app',
  status: 'installed',
  instances: [],
};

const handleActiveStep = vitest.fn();

describe('Test Sideload App', () => {
  afterAll(() => {
    vitest.clearAllMocks();
  });
  test('renders SideloadApp component', () => {
    render(
      <ReferenceDataContextProvider>
        <SideloadApp yaml={yaml} handleActiveStep={handleActiveStep}></SideloadApp>
      </ReferenceDataContextProvider>,
    );
  });

  test('Successfully sideload app', async () => {
    const { getByTestId } = render(
      <ReferenceDataContextProvider>
        <SideloadApp yaml={yaml} handleActiveStep={handleActiveStep}></SideloadApp>
      </ReferenceDataContextProvider>,
    );

    await screen.findByText('Installing ' + yaml.title + '.');
    await screen.findByText(yaml.title + ' successfully installed.');

    const icon = getByTestId('success-icon');
    expect(icon).toBeVisible();
  });

  test('Failed to sideload app', async () => {
    // will fail because no yaml is passed to SideloadApp
    const { getByTestId } = render(
      <ReferenceDataContextProvider>
        <SideloadApp handleActiveStep={handleActiveStep}></SideloadApp>
      </ReferenceDataContextProvider>,
    );

    await screen.findByText('Error during the installation of undefined.');

    const icon = getByTestId('error-icon');
    expect(icon).toBeVisible();

    const retry = screen.getByRole('button', { name: 'Retry' });
    fireEvent.click(retry);

    await screen.findByText('Error during the installation of undefined.');
  });
});
