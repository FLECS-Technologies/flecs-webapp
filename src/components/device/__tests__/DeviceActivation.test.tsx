/*
 * Copyright (c) 2022 FLECS Technologies GmbH
 *
 * Created on Wed Jan 31 2024
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
import { render, act, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import DeviceActivation from '../DeviceActivation'
import { DeviceActivationContext } from '../../providers/DeviceActivationContext'

jest.mock('../../../api/device/license/status')

describe('DeviceActivation Component', () => {
  afterAll(() => {
    jest.resetAllMocks()
  })

  it('Device is activated', () => {
    act(() => {
      render(
        <DeviceActivationContext.Provider
          value={{
            activated: true,
            activating: false,
            activate: async () => {},
            validating: false,
            validate: async () => {}
          }}
        >
          <DeviceActivation />
        </DeviceActivationContext.Provider>
      )
    })

    const infoText = screen.getByText('Device is activated!')
    expect(infoText).toBeInTheDocument()
    const activateButton = screen.getByText('Activate Device')
    expect(activateButton).toBeVisible()
    expect(activateButton).not.toBeEnabled()
  })

  it('Device is not activated', () => {
    act(() => {
      render(
        <DeviceActivationContext.Provider
          value={{
            activated: false,
            activating: false,
            activate: async () => {},
            validating: false,
            validate: async () => {}
          }}
        >
          <DeviceActivation />
        </DeviceActivationContext.Provider>
      )
    })

    const infoText = screen.getByText('Device is not activated!')
    expect(infoText).toBeInTheDocument()
    const activateButton = screen.getByText('Activate Device')
    expect(activateButton).toBeVisible()
    expect(activateButton).toBeEnabled()
  })

  it('Activating device...', () => {
    act(() => {
      render(
        <DeviceActivationContext.Provider
          value={{
            activated: false,
            activating: true,
            activate: async () => {},
            validating: false,
            validate: async () => {}
          }}
        >
          <DeviceActivation />
        </DeviceActivationContext.Provider>
      )
    })

    const infoText = screen.getByText('Activating the device...')
    expect(infoText).toBeInTheDocument()
    const activateButton = screen.getByText('Activate Device')
    expect(activateButton).toBeVisible()
    expect(activateButton).not.toBeEnabled()
  })

  it('Checking the device activation status...', () => {
    act(() => {
      render(
        <DeviceActivationContext.Provider
          value={{
            activated: false,
            activating: false,
            activate: async () => {},
            validating: true,
            validate: async () => {}
          }}
        >
          <DeviceActivation />
        </DeviceActivationContext.Provider>
      )
    })

    const infoText = screen.getByText(
      'Checking the device activation status...'
    )
    expect(infoText).toBeInTheDocument()
    const activateButton = screen.getByText('Activate Device')
    expect(activateButton).toBeVisible()
    expect(activateButton).not.toBeEnabled()
  })

  it('Line-Variant: Device is activated', () => {
    act(() => {
      render(
        <DeviceActivationContext.Provider
          value={{
            activated: true,
            activating: false,
            activate: async () => {},
            validating: false,
            validate: async () => {}
          }}
        >
          <DeviceActivation variant='line' />
        </DeviceActivationContext.Provider>
      )
    })

    const infoText = screen.getByText('Device is activated!')
    expect(infoText).toBeInTheDocument()
    const activateButton = screen.getByText('Activate Device')
    expect(activateButton).toBeVisible()
    expect(activateButton).not.toBeEnabled()
  })
})
