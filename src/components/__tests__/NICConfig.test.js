/*
 * Copyright (c) 2022 FLECS Technologies GmbH
 *
 * Created on Tue May 03 2022
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
import { act } from 'react-dom/test-utils'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import NICConfig from '../NICConfig'

const testConfig = {
  instanceId: 12345,
  networkAdapters: [{
    name: 'eth0',
    ipAddress: '192.168.100.1',
    subnetMask: '255.255.255.0',
    active: false
  },
  {
    name: 'eth1',
    ipAddress: '192.168.100.2',
    subnetMask: '255.255.255.0',
    active: true
  }]
}

describe('NICConfig', () => {
  test('renders NICConfig component', async () => {
    await act(async () => {
      render(<NICConfig nicConfig={testConfig} setNicConfig={jest.fn()}></NICConfig>)
    })

    expect(screen.getByText('Network interfaces')).toBeVisible()
    expect(screen.getByText('eth0')).toBeVisible()
    expect(screen.getByText('eth1')).toBeVisible()
  })

  test('click on enable', async () => {
    const user = userEvent.setup()
    await act(async () => {
      render(<NICConfig nicConfig={testConfig} setNicConfig={jest.fn()} saveConfig={jest.fn()} setConfigChanged={jest.fn()}></NICConfig>)
    })

    const switchButton = screen.getAllByRole('checkbox')

    await user.click(switchButton[0])

    expect(switchButton[0]).toHaveProperty('value', 'on')
  })
})
