/*
 * Copyright (c) 2022 FLECS Technologies GmbH
 *
 * Created on Tue Feb 01 2022
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
import { render, fireEvent } from '@testing-library/react';
import { AppFilter } from '../AppFilter';

describe('AppFilter', () => {
  beforeEach(() => {});

  afterAll(() => {
    jest.clearAllMocks();
  });

  test('renders AppFilter component', () => {
    const { getByTestId } = render(<AppFilter />);

    expect(getByTestId('available-filter')).toBeVisible();
  });

  test('toggle AppFilter->Available Button', () => {
    const setAvailableFilter = jest.fn();
    const { getByTestId } = render(
      <AppFilter available={true} setAvailableFilter={setAvailableFilter} />,
    );

    const toggleAvailable = getByTestId('available-filter');
    fireEvent.click(toggleAvailable);
    expect(setAvailableFilter).toHaveBeenLastCalledWith();
  });

  test('toggle AppFilter->Search Button', () => {
    const setIsSearchEnabled = jest.fn();
    const { getByTestId } = render(
      <AppFilter search={'test'} isSearchEnabled={true} setIsSearchEnabled={setIsSearchEnabled} />,
    );

    const toggleAvailable = getByTestId('search-filter');
    fireEvent.click(toggleAvailable);
    expect(setIsSearchEnabled).toHaveBeenCalledTimes(1);
  });

  test('toggle AppFilter->Category Button', () => {
    const setCategoryFilter = jest.fn();
    const { getByTestId } = render(
      <AppFilter categories={['1']} hiddenCategories={[]} setCategoryFilter={setCategoryFilter} />,
    );

    const toggleAvailable = getByTestId('category-filter');
    fireEvent.click(toggleAvailable);
    expect(setCategoryFilter).toHaveBeenCalledTimes(1);
  });
});
