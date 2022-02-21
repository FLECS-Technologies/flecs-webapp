/*
 * Copyright (c) 2022 FLECS Technologies GmbH
 *
 * Created on Mon Jan 03 2022
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
import { render, within, fireEvent } from '@testing-library/react'
// import { shallow } from 'enzyme'
import '@testing-library/jest-dom'
import SearchBar from '../SearchBar'

describe('SearchBar', () => {
  const searchFunc = jest.fn()
  const searchOptions = ['Homer', 'Marge', 'Bart', 'Lisa', 'Maggie']

  afterEach(() => {
    jest.resetAllMocks()
  })

  test('renders SearchBar', () => {
    const { getByLabelText } = render(<SearchBar searchTitle='Test Search' searchAutocomplete={searchOptions} setSearch={searchFunc} />)

    const autocomplete = getByLabelText('autocomplete')
    const searchField = getByLabelText('search-field')
    const clearSearch = getByLabelText('clear-all')
    const searchIcon = getByLabelText('search-icon')
    const input = within(autocomplete).getByRole('textbox')

    expect(() => getByLabelText('filter')).toThrow()
    expect(searchIcon).toBeVisible()
    expect(searchField).toBeVisible()
    expect(searchField).toBeEnabled()
    expect(input).toHaveFocus()
    expect(clearSearch).toBeVisible()
    expect(clearSearch).toBeEnabled()
    // expect(search).toBe('')

    // screen.debug()
  })

  test('Search with autocomplete', () => {
    const { getByLabelText } = render(<SearchBar searchTitle='Test Search' searchAutocomplete={searchOptions} setSearch={searchFunc} />)

    const autocomplete = getByLabelText('autocomplete')

    const input = within(autocomplete).getByRole('textbox')

    fireEvent.change(input, { target: { value: 'Homer' } })
    fireEvent.keyDown(autocomplete, { key: 'ArrowDown' })
    fireEvent.keyDown(autocomplete, { key: 'Enter' })

    const inputt = within(autocomplete).getByRole('textbox')

    expect(inputt.value).toEqual('Homer')
    expect(searchFunc).toBeCalledTimes(2)
    expect(searchFunc).toHaveBeenCalledWith('Homer')
  })

  test('Search without autocomplete', () => {
    const { getByLabelText } = render(<SearchBar searchTitle='Test Search' searchAutocomplete={searchOptions} setSearch={searchFunc} />)

    const autocomplete = getByLabelText('autocomplete')

    const input = within(autocomplete).getByRole('textbox')

    fireEvent.change(input, { target: { value: 'Flanders' } })
    fireEvent.keyPress(autocomplete, { key: 'Enter' })

    const inputt = within(autocomplete).getByRole('textbox')

    expect(inputt.value).toEqual('Flanders')
    expect(searchFunc).toBeCalledTimes(1)
    expect(searchFunc).toHaveBeenCalledWith('Flanders')
  })

  test('Clear Search', () => {
    const { getByLabelText } = render(<SearchBar searchTitle='Test Search' searchAutocomplete={searchOptions} setSearch={searchFunc} />)

    const autocomplete = getByLabelText('autocomplete')

    const input = within(autocomplete).getByRole('textbox')
    const clearSearch = getByLabelText('clear-all')

    fireEvent.change(input, { target: { value: 'Flanders' } })
    fireEvent.click(clearSearch)

    const inputt = within(autocomplete).getByRole('textbox')

    expect(inputt.value).toEqual('')

    expect(searchFunc).toHaveBeenCalledWith('')
  })
})
