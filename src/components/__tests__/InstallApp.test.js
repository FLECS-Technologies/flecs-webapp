/*
 * Copyright (c) 2022 FLECS Technologies GmbH
 *
 * Created on Thu Feb 10 2022
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
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import InstallApp from '../InstallApp'
import { ReferenceDataContextProvider } from '../../data/ReferenceDataContext'
import AppAPI from '../../api/device/AppAPI'

jest.mock('../../api/marketplace/LicenseService')

const app = {
  app: 'com.codesys.codesyscontrol',
  title: 'test app',
  status: 'installed',
  version: '4.2.0',
  instances: []
}

describe('Test Install App', () => {
  test('renders InstallApp component', () => {
    render(
      <ReferenceDataContextProvider>
        <InstallApp app={app}></InstallApp>
      </ReferenceDataContextProvider>
    )
  })

  test('Successfully install app', async () => {
    const spyInstall = jest.spyOn(AppAPI.prototype, 'installFromMarketplace').mockResolvedValueOnce('ride on.')
    jest.spyOn(AppAPI.prototype, 'lastAPICallSuccessfull', 'get').mockReturnValueOnce(true)
    const { getByTestId } = render(
      <ReferenceDataContextProvider>
        <InstallApp app={app} install={true} tickets={[{ license_key: 'abc' }]}></InstallApp>
      </ReferenceDataContextProvider>
    )

    expect(spyInstall).toHaveBeenCalled()

    await screen.findByText('Installing...')
    await screen.findByText('Congratulations! ' + app.title + ' was successfully installed!')

    const icon = getByTestId('success-icon')
    expect(icon).toBeVisible()
  })

  test('Failed to install app', async () => {
    const spyInstall = jest.spyOn(AppAPI.prototype, 'installFromMarketplace').mockResolvedValueOnce('ride on.')
    jest.spyOn(AppAPI.prototype, 'lastAPICallSuccessfull', 'get').mockReturnValueOnce(false)
    const { getByTestId } = render(
      <ReferenceDataContextProvider>
        <InstallApp app={app} install={true} tickets={[{ license_key: 'abc' }]}></InstallApp>
      </ReferenceDataContextProvider>
    )

    expect(spyInstall).toHaveBeenCalled()

    await screen.findByText('Oops... Error during the installation of ' + app.title + '.')

    const icon = getByTestId('error-icon')
    expect(icon).toBeVisible()

    const retry = screen.getByRole('button', { name: 'Retry' })
    fireEvent.click(retry)

    await screen.findByText('Oops... Error during the installation of ' + app.title + '.')
  })
})
