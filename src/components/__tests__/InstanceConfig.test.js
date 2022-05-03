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
jest.mock('../../api/InstanceConfigService')

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
    expect(screen.getByText('Network interfaces')).toBeVisible()
  })

  test('Click on save-button', async () => {
    await act(async () => {
      render(<InstanceConfig instance={testInstance}></InstanceConfig>)
    })
    expect(screen.getByText('Network interfaces')).toBeVisible()
    const saveButton = screen.getByTestId('save-button')

    await act(async () => { fireEvent.click(saveButton) })
  })

  test('Click on discard-button', async () => {
    await act(async () => {
      render(<InstanceConfig instance={testInstance}></InstanceConfig>)
    })
    expect(screen.getByText('Network interfaces')).toBeVisible()
    const discardButton = screen.getByTestId('discard-button')

    await act(async () => { fireEvent.click(discardButton) })
  })
})
