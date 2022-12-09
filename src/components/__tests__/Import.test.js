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
import Import from '../Import'

jest.mock('../../api/device/ImportAppsService')

describe('Import', () => {
  test('renders Import component', async () => {
    await act(async () => {
      render(<Import></Import>)
    })
    expect(screen.getByText('Import')).toBeVisible()
  })

  test('click on import button', async () => {
    const user = userEvent.setup()
    await act(async () => {
      render(<Import></Import>)
    })
    expect(screen.getByText('Import')).toBeVisible()
    const importButton = screen.getByText('Import')
    await user.click(importButton)
  })
})
