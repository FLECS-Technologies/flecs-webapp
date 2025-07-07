/*
 * Copyright (c) 2022 FLECS Technologies GmbH
 *
 * Created on Mon Feb 21 2022
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
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ServiceMesh from '../ServiceMesh';
import { BrowserRouter as Router } from 'react-router-dom';

jest.mock('../../api/device/DeviceAPI');

describe('ServiceMesh', () => {
  beforeAll(() => {});
  afterAll(() => {
    jest.clearAllMocks();
  });
  test('renders Service Mesh page', async () => {
    render(
      <Router>
        <ServiceMesh />
      </Router>,
    );

    expect(screen.getByTestId('service-mesh')).toBeVisible();
    expect(screen.getByTestId('service-mesh-title')).toBeVisible();
  });
});
