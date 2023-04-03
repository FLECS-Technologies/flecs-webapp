/*
 * Copyright (c) 2021 FLECS Technologies GmbH
 *
 * Created on Thu Mar 30 2023
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
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import { act } from 'react-dom/test-utils'
import InfoIcon from '../InfoIcon'

describe('InfoIcon', () => {
  test('render InfoIcon component', () => {
    render(<InfoIcon message='test message'/>)
  })

  test('hover info icon', async () => {
    await act(async () => {
      render(<InfoIcon message='test message'/>)
    })

    const infoIcon = screen.getByTestId('ReportOutlinedIcon')
    expect(infoIcon).toBeInTheDocument()

    await userEvent.hover(infoIcon)
    const infoElement = await screen.findByText('test message')
    const infoMessage = infoElement.innerHTML
    expect(infoMessage).toBe('test message')
  })
})
