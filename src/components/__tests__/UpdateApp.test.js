/*
 * Copyright (c) 2022 FLECS Technologies GmbH
 *
 * Created on Thu Oct 13 2022
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
import { act } from 'react-dom/test-utils'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import UpdateApp from '../UpdateApp'
import { ReferenceDataContextProvider } from '../../data/ReferenceDataContext'
import { JobsContextProvider } from '../../data/JobsContext'
import axios from 'axios'

jest.mock('../../api/marketplace/LicenseService')
jest.mock('../../api/device/UpdateAppService')
jest.mock('../../api/device/AppAPI')
jest.mock('axios')

const app = {
  title: 'test app',
  status: 'installed',
  appKey: {
    name: 'pass',
    version: '4.2.0'
  },
  instances: []
}

const handleActiveStep = jest.fn()

describe('Test Update App', () => {
  beforeAll(() => {
    axios.post = jest.fn()
  })

  afterAll(() => {
    jest.resetAllMocks()
  })
  test('renders Update component', async () => {
    await act(async () => {
      render(
        <JobsContextProvider>
          <ReferenceDataContextProvider>
            <UpdateApp app={app}></UpdateApp>
          </ReferenceDataContextProvider>
        </JobsContextProvider>
      )
    })
  })

  test('Successfully update app', async () => {
    // mock update service
    // axios.post.mockResolvedValueOnce()
    await act(async () => {
      render(
        <JobsContextProvider>
          <ReferenceDataContextProvider>
            <UpdateApp update={true} app={app} from={app.appKey.version} to="4.3.0" tickets={[{ license_key: 'abc' }]} handleActiveStep={handleActiveStep} />
          </ReferenceDataContextProvider>
        </JobsContextProvider>
      )
    })

    // 1. check success icon
    await screen.findByText('Congratulations! ' + app.title + ' was successfully updated from version ' + app.appKey.version + ' to version ' + '4.3.0!')
    const icon = screen.getByTestId('success-icon')
    expect(icon).toBeVisible()
  })

  test('Failed to update app', async () => {
    const user = userEvent.setup()
    // axios.put.mockRejectedValueOnce(new Error('Failed to update'))

    app.appKey.name = 'fail'
    await act(async () => {
      render(
        <JobsContextProvider>
          <ReferenceDataContextProvider>
          <UpdateApp update={true} app={app} from={app.appKey.version} to="4.3.0" tickets={[{ license_key: 'abc' }]} handleActiveStep={handleActiveStep} />
          </ReferenceDataContextProvider>
        </JobsContextProvider>)
    })
    // 1. check error icon
    const icon = screen.getByTestId('error-icon')
    expect(icon).toBeVisible()

    // 2. click on retry
    const retryButton = screen.getByRole('button', { name: 'Retry' })

    await user.click(retryButton)
  })
})
