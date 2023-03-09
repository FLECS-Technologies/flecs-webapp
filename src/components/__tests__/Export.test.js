/*
 * Copyright (c) 2022 FLECS Technologies GmbH
 *
 * Created on Fri Dec 09 2022
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
import userEvent from '@testing-library/user-event'
import { act } from 'react-dom/test-utils'
import { render, screen } from '@testing-library/react'
import Export from '../Export'
import { JobsContextProvider } from '../../data/JobsContext'

jest.mock('../../api/device/ExportAppsService')

describe('Export', () => {
  window.URL.createObjectURL = jest.fn()
  window.URL.revokeObjectURL = jest.fn()

  afterEach(() => {
    window.URL.createObjectURL.mockReset()
    window.URL.revokeObjectURL.mockReset()
  })
  test('renders Export component', async () => {
    await act(async () => {
      render(<Export></Export>)
    })
    expect(screen.getByText('Export')).toBeVisible()
  })

  test('click on export button', async () => {
    const user = userEvent.setup()
    await act(async () => {
      render(<JobsContextProvider><Export></Export></JobsContextProvider>)
    })
    expect(screen.getByText('Export')).toBeVisible()
    const exportButton = screen.getByText('Export')
    await user.click(exportButton)
  })
})
