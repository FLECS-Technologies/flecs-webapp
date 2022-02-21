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
import { render /*, screen , fireEvent, waitFor */ } from '@testing-library/react'
import '@testing-library/jest-dom'
import LoadButton from '../LoadButton'

describe('LoadButton', () => {
  test('renders LoadButton component', () => {
    render(<LoadButton />)
    // screen.debug()
  })

  test('LoadButton loading', async () => {
    const { getByTestId } = render(<LoadButton
        loading = {true}
        text='Do something'
        />)
    const button = getByTestId('button')
    const circularprogress = getByTestId('circularprogress')

    expect(button).toBeInTheDocument()
    expect(button).toHaveTextContent('Do something')
    expect(circularprogress).toBeInTheDocument()

    // screen.debug()
  })

  test('LoadButton not loading', async () => {
    const { getByTestId } = render(<LoadButton
        loading = {false}
        text='Do something'
        />)
    const button = getByTestId('button')

    expect(button).toBeInTheDocument()
    expect(button).toHaveTextContent('Do something')
    expect(() => getByTestId('circularprogress')).toThrow()

    // screen.debug()
  })
})
