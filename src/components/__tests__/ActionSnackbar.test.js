/*
 * Copyright (c) 2021 FLECS Technologies GmbH
 *
 * Created on Tue Nov 30 2021
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
import ActionSnackbar from '../ActionSnackbar'
import { act } from 'react-dom/test-utils'

describe('ActionSnackbar', () => {
  const originalClipboard = { ...global.navigator.clipboard }

  beforeEach(() => {
    const mockClipboard = {
      writeText: jest.fn()
    }
    global.navigator.clipboard = mockClipboard
  })

  afterEach(() => {
    jest.resetAllMocks()
    global.navigator.clipboard = originalClipboard

    jest.useRealTimers()
  })

  test('renders ActionSnackbar component', () => {
    render(<ActionSnackbar />)
    // screen.debug()
  })

  test('Snackbar success', async () => {
    function setOpen () {

    }
    const { getByTestId } = render(<ActionSnackbar
        text='Successfull operation'
        errorText=''
        open={true}
        setOpen={setOpen}
        alertSeverity='success' />)
    const snackbar = getByTestId('snackbar')
    const alert = getByTestId('alert')
    const closeButton = getByTestId('close-button')
    const copyButton = getByTestId('copy-button')

    fireEvent.click(document.body)
    fireEvent.click(closeButton)

    expect(snackbar).toBeInTheDocument()
    expect(alert).toHaveTextContent('Successfull operation')
    expect(closeButton).toBeInTheDocument()
    expect(copyButton).not.toBeVisible()

    // screen.debug()
  })

  test('Snackbar error', async () => {
    const { getByTestId } = render(<ActionSnackbar
        text='Operation failed'
        errorText='This operation really failed.'
        open={true}
        setOpen={null}
        alertSeverity='error' />)
    const snackbar = getByTestId('snackbar')
    const alert = getByTestId('alert')
    const closeButton = getByTestId('close-button')
    const copyButton = getByTestId('copy-button')

    fireEvent.click(copyButton)

    expect(navigator.clipboard.writeText).toBeCalledTimes(1)
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('This operation really failed.')

    expect(snackbar).toBeInTheDocument()
    expect(alert).toHaveTextContent('Operation failed')
    expect(closeButton).toBeInTheDocument()
    expect(copyButton).toBeVisible()

    // screen.debug()
  })

  test('Snackbar error without errorText', async () => {
    const { getByTestId } = render(<ActionSnackbar
        text='Operation failed'
        errorText={null}
        open={true}
        setOpen={null}
        alertSeverity='error' />)
    const snackbar = getByTestId('snackbar')
    const alert = getByTestId('alert')
    const closeButton = getByTestId('close-button')
    const copyButton = getByTestId('copy-button')

    fireEvent.click(copyButton)

    expect(navigator.clipboard.writeText).toBeCalledTimes(1)
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('No further error information available. Please check your browser\'s console for further information')

    expect(snackbar).toBeInTheDocument()
    expect(alert).toHaveTextContent('Operation failed')
    expect(closeButton).toBeInTheDocument()
    expect(copyButton).toBeVisible()

    // screen.debug()
  })

  test('Snackbar close', async () => {
    const setOpen = jest.fn()
    // const user = userEvent.setup()

    await act(async () => {
      render(<ActionSnackbar
        text='Successfull operation'
        errorText=''
        open={true}
        setOpen={setOpen}
        alertSeverity='success' />)
    })

    /*
      Challenge: find out how to test the "if (reason === 'clickaway')" path of handleSnackbarClose
    wrapper.find(Snackbar).simulate('close', { event: 'event', reason: 'clickaway' })
    expect(setOpen).not.toHaveBeenCalled()
    */

    expect(screen.getByText('Successfull operation')).toBeVisible()
    // const closeButton = screen.getByTestId('close-button')

    // await user.click(closeButton)

    // expect(setOpen).toHaveBeenCalled()
  })

  test('Snackbar auto-hide', async () => {
    const setOpen = jest.fn()

    await act(async () => {
      render(<ActionSnackbar
        text='Successfull operation'
        errorText=''
        open={true}
        setOpen={setOpen}
        alertSeverity='success' />)
    })

    expect(screen.getByTestId('snackbar')).toBeVisible()
  })
})
