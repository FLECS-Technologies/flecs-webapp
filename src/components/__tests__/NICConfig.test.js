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
import { render, screen, fireEvent } from '@testing-library/react'
import NICConfig from '../NICConfig'

const testConfig = {
  nics: [{
    nic: 'eth0',
    enabled: false
  },
  {
    nic: 'eth1',
    enabled: true
  }]
}

describe('NICConfig', () => {
  test('renders NICConfig component', () => {
    act(async () => {
      render(<NICConfig nicConfig={testConfig} setNicConfig={jest.fn()}></NICConfig>)
    })
    expect(screen.getByText('Network interfaces')).toBeVisible()
    expect(screen.getByText('eth0')).toBeVisible()
    expect(screen.getByText('eth1')).toBeVisible()
  })

  test('click on enable', async () => {
    act(async () => {
      render(<NICConfig nicConfig={testConfig} setNicConfig={jest.fn()}></NICConfig>)
    })

    const switchButton = screen.getByLabelText('eth0')
    await act(async () => { fireEvent.click(switchButton) })
  })
})
