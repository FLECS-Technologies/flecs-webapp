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
import userEvent from '@testing-library/user-event';
import { render, within } from '@testing-library/react';
import SearchBar from '../SearchBar';

describe('SearchBar', () => {
  const searchFunc = jest.fn();

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders SearchBar', () => {
    const { getByLabelText } = render(<SearchBar searchTitle="Test Search" search={searchFunc} />);

    const autocomplete = getByLabelText('autocomplete');
    const searchField = getByLabelText('search-field');
    const searchIcon = getByLabelText('search-icon');
    const input = within(autocomplete).getByRole('combobox');

    expect(() => getByLabelText('filter')).toThrow();
    expect(searchIcon).toBeVisible();
    expect(searchField).toBeVisible();
    expect(searchField).toBeEnabled();
    expect(input).toHaveFocus();
  });

  test('Search', async () => {
    const user = userEvent.setup();
    const { getByLabelText } = render(<SearchBar searchTitle="Test Search" search={searchFunc} />);

    const autocomplete = getByLabelText('autocomplete');

    await user.keyboard('Flanders');

    const input = within(autocomplete).getByRole('combobox');

    expect(input.value).toEqual('Flanders');
    expect(searchFunc).toBeCalledTimes(8); // Flanders has 8 letters
  });
});
