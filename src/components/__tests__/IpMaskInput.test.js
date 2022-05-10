/*
 * Copyright (c) 2022 FLECS Technologies GmbH
 *
 * Created on Tue May 10 2022
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
import { render, screen, fireEvent, within } from '@testing-library/react'
import IpMaskInput from '../IpMaskInput'

const networkAdapter = {
  name: 'eth0',
  ipAddress: '192.168.100.1',
  subnetMask: '255.255.255.0',
  gateway: '0.0.0.0',
  active: false
}

describe('IpMaskInput', () => {
  test('renders IpMaskInput component', () => {
    act(async () => {
      render(<IpMaskInput ip={networkAdapter.ipAddress} changeIP={jest.fn()} name={networkAdapter.name}></IpMaskInput>)
    })

    expect(screen.getByDisplayValue(networkAdapter.ipAddress)).toBeVisible()
  })

  test('Set IP', async () => {
    act(async () => {
      render(<IpMaskInput ip={networkAdapter.ipAddress} changeIP={jest.fn()} name={networkAdapter.name}></IpMaskInput>)
    })

    expect(screen.getByDisplayValue(networkAdapter.ipAddress)).toBeVisible()

    const ipmask = screen.getByLabelText('IpInputMask')

    const input = within(ipmask).getByRole('textbox')

    await act(async () => { fireEvent.change(input, { target: { value: '192.168.12.12' } }) })
  })
})
