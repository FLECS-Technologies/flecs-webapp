/*
 * Copyright (c) 2021 FLECS Technologies GmbH
 *
 * Created on Thu Dec 23 2021
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
import { render, fireEvent, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import AppLinksMenu from '../AppLinksMenu'
import { BrowserRouter as Router } from 'react-router-dom'
import { act } from 'react-dom/test-utils'

describe('AppLinksMenu', () => {
  const relatedLinks = [
    {
      title: 'Buy',
      url: 'https://store.codesys.com/de/codesys-control-for-linux-sl-bundle.html'
    },
    {
      title: 'Documentation',
      url: 'https://help.codesys.com/webapp/_lnx_f_help;product=codesys_control_for_linux_sl;version=4.2.0.0'

    },
    {
      title: 'Download IDE',
      url: 'https://store.codesys.com/de/codesys.html'
    }
  ]
  test('renders AppLinksMenu', () => {
    const { getByTestId, getByText } = render(<Router><AppLinksMenu vertIcon={true} appLinks = {relatedLinks} /></Router>)

    const menuButton = getByTestId('more-vert-icon')
    expect(menuButton).toBeVisible()

    fireEvent.click(menuButton)

    const menuItem = getByText(relatedLinks[0].title)

    expect(menuItem).toBeVisible()

    // screen.debug()
  })

  test('test close AppLinksMenu', async () => {
    const user = userEvent.setup()
    await act(async () => {
      render(<AppLinksMenu />)
    })

    const menuButton = screen.getByTestId('more-horiz-icon')

    await user.click(menuButton)
  })
})
