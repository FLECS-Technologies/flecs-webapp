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
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import MarketplaceList from '../MarketplaceList';
import { FilterContext } from '@contexts/data/FilterContext';
import { ReferenceDataContext } from '@contexts/data/ReferenceDataContext';

// Mock AppList context provider and hook
vi.mock('../../data/AppList', () => ({
  AppList: ({ children }) => <>{children}</>,
  getInstalledVersions: () => [],
}));

// Mock child components
vi.mock('../Card', () => ({
  default: ({ title }) => <div data-testid="app-card">{title}</div>,
}));
vi.mock('../SearchBar', () => ({
  default: (props) => (
    <div data-testid="search-bar">
      <input
        data-testid="search-input"
        defaultValue={props.defaultSearchValue}
        onChange={(e) => props.search(e.target.value)}
      />
      <button onClick={() => props.setToggleFilter(true)}>Filter</button>
    </div>
  ),
}));
vi.mock('../AppFilter', () => ({
  AppFilter: () => <div data-testid="filter-panel" />,
}));
vi.mock('../navigation/PoweredBy', () => ({
  default: () => <div data-testid="powered-by" />,
}));

const mockProduct = {
  id: 123,
  name: 'Mock App',
  slug: 'mock-app',
  permalink: '/apps/mock-app',
  purchasable: true,
  price: { raw: '0', formatted: 'Free' },
  stock_status: 'available',
  average_rating: 4.5,
  rating_count: 12,
  description: 'A test app used for unit testing.',
  meta_data: [
    { key: 'app-icon', value: 'https://example.com/icon.png' },
    { key: 'author', value: 'Test Author' },
    { key: 'short-description', value: 'Short test app description.' },
    { key: 'blacklist', value: [] },
    { key: 'documentation-url', value: 'https://example.com/docs' },
    {
      key: 'custom-links',
      value: JSON.stringify([{ label: 'GitHub', url: 'https://github.com/flecs-tech/mock-app' }]),
    },
  ],
  attributes: [
    {
      name: 'categories',
      options: ['Utilities', 'Networking'],
    },
    {
      name: 'versions',
      options: ['1.0.0', '1.1.0'],
    },
    {
      name: 'archs',
      options: ['amd64', 'arm64'],
    },
  ],
};

const createFilterContext = (overrides = {}) => ({
  categories: [],
  filterParams: {
    search: '',
    available: false,
    hiddenCategories: [],
  },
  setFilterParams: vi.fn(),
  getFilteredProducts: vi.fn(),
  setAvailableFilter: vi.fn(),
  setCategoryFilter: vi.fn(),
  setSearchFilter: vi.fn(),
  toggleFilter: vi.fn(),
  showFilter: true,
  isSearchEnabled: true,
  setIsSearchEnabled: vi.fn(),
  finalProducts: [mockProduct],
  ...overrides,
});

const createReferenceContext = (overrides = {}) => ({
  appList: [],
  loadedProducts: [mockProduct],
  appListError: false,
  ...overrides,
});

const renderMarketplaceList = ({
  filterContextOverrides = {},
  referenceContextOverrides = {},
} = {}) => {
  const filterContext = createFilterContext(filterContextOverrides);
  const referenceContext = createReferenceContext(referenceContextOverrides);

  render(
    <FilterContext.Provider value={filterContext}>
      <ReferenceDataContext.Provider value={referenceContext}>
        <MarketplaceList />
      </ReferenceDataContext.Provider>
    </FilterContext.Provider>,
  );

  return { filterContext, referenceContext };
};

describe('MarketplaceList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders loading spinner initially', async () => {
    renderMarketplaceList({
      referenceContextOverrides: { loadedProducts: [] },
    });

    expect(await screen.findByRole('progressbar')).toBeInTheDocument();
  });

  test('renders marketplace list with products', async () => {
    renderMarketplaceList();

    const searchBar = await screen.findByTestId('search-bar');
    const cards = await screen.findAllByTestId('app-card');

    expect(searchBar).toBeInTheDocument();
    expect(cards).toHaveLength(1);
    expect(cards[0]).toHaveTextContent('Mock App');
  });

  test('renders error message if appListError is true', async () => {
    renderMarketplaceList({
      referenceContextOverrides: { appListError: true },
    });

    expect(await screen.findByText(/Sorry, we failed to load apps/i)).toBeInTheDocument();
  });

  test('updates filter on search input change', async () => {
    const { filterContext } = renderMarketplaceList();

    const input = screen.getByTestId('search-input');
    fireEvent.change(input, { target: { value: 'mesh' } });

    await waitFor(() => {
      expect(filterContext.setSearchFilter).toHaveBeenCalledWith('mesh');
    });
  });

  test('shows pagination controls', async () => {
    renderMarketplaceList();

    const paginator = await screen.findByTestId('app-paginator');
    expect(paginator).toBeInTheDocument();
    expect(screen.getByTestId('powered-by')).toBeInTheDocument();
  });
});
