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
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import UpdateApp from '../UpdateApp'
import { ReferenceDataContext } from '../../../../data/ReferenceDataContext'
import { JobsContextProvider } from '../../../../data/JobsContext'
import { mockInstalledApps } from '../../../../data/__mocks__/AppList'
import { mockApp } from '../../../../models/__mocks__/app'
import { vitest } from 'vitest'

vitest.mock('../../../../api/device/apps/install')
vitest.mock('../../../../api/device/instances/instance')
vitest.mock('../../../../api/device/AppAPI')
vitest.mock('../../../../api/device/ExportAppsService')
vitest.mock('../../../../api/device/DeviceAuthAPI')
vitest.mock('../../../../api/device/JobsAPI')
vitest.mock('../../../../utils/sleep')

const app = mockInstalledApps[0]

const handleActiveStep = vitest.fn()

describe('Test Update App', () => {
  beforeAll(() => {})

  afterAll(() => {
    vitest.clearAllMocks()
  })

  test('Successfully update app', async () => {
    render(
      <JobsContextProvider>
        <ReferenceDataContext.Provider
          value={{ appList: mockInstalledApps, setUpdateAppList: () => {} }}
        >
          <UpdateApp
            app={app}
            from={app.appKey.version}
            to='4.3.0'
            handleActiveStep={handleActiveStep}
          />
        </ReferenceDataContext.Provider>
      </JobsContextProvider>
    )

    await waitFor(() => {
      // 1. check success text
      const text = screen.getByText(
        'Congratulations! ' +
          app.title +
          ' was successfully updated from version ' +
          app.appKey.version +
          ' to version ' +
          '4.3.0!'
      )
      expect(text).toBeInTheDocument()

      // 2. check success icon
      const icon = screen.getByTestId('success-icon')
      expect(icon).toBeVisible()
    })
  })

  test('Failed to update app', async () => {
    const user = userEvent.setup()

    render(
      <JobsContextProvider>
        <ReferenceDataContext.Provider
          value={{ appList: mockInstalledApps, setUpdateAppList: () => {} }}
        >
          <UpdateApp
            app={mockApp}
            from={mockApp.appKey.version}
            to='4.3.0'
            handleActiveStep={handleActiveStep}
          />
        </ReferenceDataContext.Provider>
      </JobsContextProvider>
    )

    await waitFor(() => {
      // 1. check error icon
      const icon = screen.getByTestId('error-icon')
      expect(icon).toBeVisible()

      // 2. click on retry
      const retryButton = screen.getByRole('button', { name: 'Retry' })

      user.click(retryButton)
    })
  })
})
