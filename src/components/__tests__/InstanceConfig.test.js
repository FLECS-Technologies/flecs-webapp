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
import InstanceConfig from '../InstanceConfig'
jest.mock('../../api/device/InstanceConfigService')

const testInstance = {
  instanceName: 'TestInstance',
  instanceId: 'ABCDE',
  version: '1.0.0',
  status: 'running',
  desired: 'stopped'
}

describe('InstanceConfig', () => {
  test('renders InstanceConfig component', async () => {
    await act(async () => {
      render(<InstanceConfig instance={testInstance}></InstanceConfig>)
    })
    expect(screen.getByText('Network')).toBeVisible()
    expect(screen.getByText('Devices')).toBeVisible()
    expect(screen.getByText('Here you can activate the access to the network interfaces of your controller for the app.')).toBeVisible()
  })

  test('Click on save-button', async () => {
    await act(async () => {
      render(<InstanceConfig instance={testInstance}></InstanceConfig>)
    })
    expect(screen.getByText('Network interfaces')).toBeVisible()

    const saveButton = screen.getByText('Save')

    await act(async () => { fireEvent.click(saveButton) })

    expect(screen.getByText('Save')).toBeDisabled()
    expect(screen.getByText('Discard changes')).toBeDisabled()
  })

  test('Click on discard-button', async () => {
    await act(async () => {
      render(<InstanceConfig instance={testInstance}></InstanceConfig>)
    })
    expect(screen.getByText('Network interfaces')).toBeVisible()

    const discardButton = screen.getByText('Discard changes')

    await act(async () => { fireEvent.click(discardButton) })

    expect(screen.getByText('Save')).toBeDisabled()
    expect(screen.getByText('Discard changes')).toBeDisabled()
  })

  test('Click on devices', async () => {
    await act(async () => {
      render(<InstanceConfig instance={testInstance}></InstanceConfig>)
    })
    expect(screen.getByText('Network interfaces')).toBeVisible()

    const devicesTab = screen.getByText('Devices')

    await act(async () => { fireEvent.click(devicesTab) })

    expect(screen.getByText('Here you can activate the access to devices of your controller for the app.')).toBeVisible()
  })

  test('Fail to load config', async () => {
    await act(async () => {
      render(<InstanceConfig instance={undefined}></InstanceConfig>)
    })
    expect(screen.getByText('Oops... Mock: Failed to get config')).toBeVisible()
  })
})
