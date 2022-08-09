/*
 * Copyright (c) 2022 FLECS Technologies GmbH
 *
 * Created on Tue May 31 2022
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
import InstanceDevicesConfig from '../InstanceDevicesConfig'

const testConfig = {
  instanceId: 'ABCDEF',
  networkAdapters: [{
    name: 'eth0',
    ipAddress: '192.168.100.1',
    subnetMask: '255.255.255.0',
    active: false,
    connected: true
  },
  {
    name: 'eth1',
    ipAddress: '192.168.100.2',
    subnetMask: '255.255.255.0',
    active: true,
    connected: true
  }],
  devices: {
    usb: [
      {
        device: '3.0 root hub',
        pid: 3,
        port: 'usb4',
        vendor: 'Linux Foundation',
        vid: 7531,
        active: false,
        connected: true
      },
      {
        device: 'license dongle',
        pid: 5,
        port: 'usb1',
        vendor: 'wibu',
        vid: 7512,
        active: true,
        connected: true
      }
    ]
  }
}

describe('InstanceDevicesConfig', () => {
  test('renders InstanceDevicesConfig component', async () => {
    await act(async () => {
      render(<InstanceDevicesConfig instanceConfig={testConfig} setDevicesConfig={jest.fn()} setConfigChanged={jest.fn()} saveConfig={jest.fn()}></InstanceDevicesConfig>)
    })

    expect(screen.getByText('Devices')).toBeVisible()
    expect(screen.getByText('wibu license dongle')).toBeVisible()
    expect(screen.getByText('Linux Foundation 3.0 root hub' )).toBeVisible()
  })

  test('click on activate', async () => {
    const user = userEvent.setup()
    await act(async () => {
      render(<InstanceDevicesConfig instanceConfig={testConfig} setDevicesConfig={jest.fn()} setConfigChanged={jest.fn()}></InstanceDevicesConfig>)
    })

    const activateButton = screen.getAllByRole('checkbox')

    await user.click(activateButton[0])

    expect(activateButton[0]).toHaveProperty('value', 'on')
  })
})
