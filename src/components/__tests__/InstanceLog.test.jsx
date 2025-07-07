/*
 * Copyright (c) 2022 FLECS Technologies GmbH
 *
 * Created on Fri Apr 08 2022
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
import '@testing-library/jest-dom';
import { render, screen, fireEvent, act } from '@testing-library/react';
import InstanceLog from '../InstanceLog';
import { vitest } from 'vitest';

vitest.mock('../../api/device/InstanceLogService');

const testInstance = {
  instanceName: 'TestInstance',
  instanceId: 'ABCDE',
  version: '1.0.0',
  status: 'running',
  desired: 'stopped',
};
describe('InstanceLog', () => {
  test('renders InstanceLog component', async () => {
    render(<InstanceLog instance={testInstance}></InstanceLog>);

    expect(await screen.getByTestId('log-editor')).toBeVisible();
  });

  test('Click refresh', async () => {
    render(<InstanceLog instance={testInstance}></InstanceLog>);

    const refreshButton = await screen.getByTestId('refresh-button');

    act(async () => {
      fireEvent.click(refreshButton);
    });
    expect(screen.getByTestId('log-editor')).toBeVisible();
  });
});
