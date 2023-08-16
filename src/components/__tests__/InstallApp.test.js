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
import { JobsContextProvider } from '../../data/JobsContext'
import axios from 'axios'

jest.mock('../../api/marketplace/LicenseService')
jest.mock('../../api/device/AppAPI')
jest.mock('axios')

const app = {
  appKey: {
    name: 'com.codesys.codesyscontrol',
    version: '4.2.0'
  },
  title: 'test app',
  status: 'installed',
  instances: []
}

const handleActiveStep = jest.fn()

describe('Test Install App', () => {
  test('renders InstallApp component', () => {
    render(
      <JobsContextProvider>
        <ReferenceDataContextProvider>
          <InstallApp app={app}></InstallApp>
        </ReferenceDataContextProvider>
      </JobsContextProvider>
    )
  })

  test('Successfully install app', async () => {
    axios.post.mockResolvedValue({ status: 200 })
    const { getByTestId } = render(
      <JobsContextProvider>
        <ReferenceDataContextProvider>
          <InstallApp app={app} install={true} tickets={[{ license_key: 'abc' }]} handleActiveStep={handleActiveStep}></InstallApp>
        </ReferenceDataContextProvider>
      </JobsContextProvider>
    )

    await screen.findByText('Installing ' + app.title + '.')
    await screen.findByText(app.title + ' successfully installed.')

    const icon = getByTestId('success-icon')
    expect(icon).toBeVisible()
  })

  test('Failed to install app', async () => {
    axios.post.mockResolvedValue({ status: 200 })
    const { getByTestId } = render(
      <JobsContextProvider>
        <ReferenceDataContextProvider>
          <InstallApp app={app} install={true} tickets={[{ license_key: undefined }]} handleActiveStep={handleActiveStep}></InstallApp>
        </ReferenceDataContextProvider>
      </JobsContextProvider>
    )

    await screen.findByText('Error during the installation of ' + app.title + '.')

    const icon = getByTestId('error-icon')
    expect(icon).toBeVisible()

    const retry = screen.getByRole('button', { name: 'Retry' })
    fireEvent.click(retry)

    await screen.findByText('Error during the installation of ' + app.title + '.')
  })
})
