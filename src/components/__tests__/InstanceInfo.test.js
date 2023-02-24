/*
 * Copyright (c) 2022 FLECS Technologies GmbH
 *
 * Created on Wed Mar 02 2022
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
import React from 'react'
import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import InstanceInfo from '../InstanceInfo'

jest.mock('../../api/device/InstanceDetailsService')

const testInstance = {
  instanceName: 'TestInstance',
  instanceId: 'ABCDE',
  appKey: {
    version: '1.0.0'
  },
  status: 'running',
  desired: 'stopped'
}
describe('InstanceInfo', () => {
  test('renders InstanceInfo component', () => {
    render(<InstanceInfo instance={testInstance}></InstanceInfo>)

    expect(screen.getByText('TestInstance')).toBeVisible()
    expect(screen.getByText('ABCDE')).toBeVisible()
    expect(screen.getByText('1.0.0')).toBeVisible()
    expect(screen.getByText('running')).toBeVisible()
    expect(screen.getByText('stopped')).toBeVisible()
  })
})
