/*
 * Copyright (c) 2022 FLECS Technologies GmbH
 *
 * Created on Fri May 12 2023
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

import React, { createContext, useState } from 'react';
import PropTypes from 'prop-types';
import useStateWithLocalStorage from '../components/LocalStorage';

const FilterContext = createContext([]);

const FilterContextProvider = (props) => {
  const [categories, setCategories] = useState([]);
  const [filterParams, setFilterParams] = useStateWithLocalStorage('filter-options', {
    hiddenCategories: [],
    search: undefined,
    available: false,
    caller: undefined,
  });
  const [filteredByAvailability, setFilteredByAvailability] = useState([]);
  const [filteredByCategories, setFilteredByCategories] = useState([]);
  const [filteredBySearch, setFilteredBySearch] = useState([]);
  const [finalProducts, setFinalProducts] = useState([]);
  const [showFilter, setToggleFilter] = useStateWithLocalStorage('marketplace-filter', false);
  const [isSearchEnabled, setIsSearchEnabled] = useStateWithLocalStorage('is-search-enabled', true);

  const getFilteredProducts = (loadedProducts) => {
    if (loadedProducts.length > 0) {
      if (filterParams.caller === 'availability' || filterParams.caller === 'loadProducts') {
        const filteredByAvailability = filterParams.available
          ? loadedProducts.filter((p) => p.stock_status === 'instock')
          : loadedProducts;
        setFilteredByAvailability(filteredByAvailability);
      }

      if (filterParams.caller === 'category' || filterParams.caller === 'loadProducts') {
        const filteredByCategories =
          filterParams.hiddenCategories.length > 0
            ? loadedProducts.filter((p) => !isCategoryHidden(p.categories))
            : loadedProducts;
        setFilteredByCategories(filteredByCategories);
      }

      if (
        filterParams.caller === 'search' ||
        filterParams.caller === 'loadProducts' ||
        filterParams.caller === 'isSearchEnabled'
      ) {
        const filteredBySearch =
          filterParams.search && isSearchEnabled
            ? searchProducts(loadedProducts, filterParams.search)
            : loadedProducts;
        setFilteredBySearch(filteredBySearch);
      }
    }
  };

  const getFinalCategories = () => {
    const finalCategories = getIntersection(filteredByAvailability, filteredBySearch);
    const uniqueCategories = getUniqueCategories(finalCategories);
    setCategories(uniqueCategories);
  };

  const getFinalProducts = () => {
    const finalProducts = getIntersection(
      filteredByAvailability,
      filteredByCategories,
      filteredBySearch,
    );
    setFinalProducts(finalProducts);
  };

  const getIntersection = (...arrays) => {
    if (arrays.length === 3) {
      const commonItems = arrays[0].reduce((result, currentItem) => {
        if (
          arrays[1].find((p) => p.id === currentItem.id) &&
          arrays[2].find((p) => p.id === currentItem.id)
        ) {
          result.push(currentItem);
        }
        return result;
      }, []);

      return commonItems;
    } else if (arrays.length === 2) {
      return arrays.reduce((commonItems, currentArray) => {
        return commonItems.filter((p) =>
          currentArray.some((currentItem) => currentItem.id === p.id),
        );
      });
    }
  };

  const setAvailableFilter = () => {
    setFilterParams((previousState) => {
      return { ...previousState, available: !filterParams.available, caller: 'availability' };
    });
  };

  const setSearchFilter = (e) => {
    if (e) {
      setFilterParams((previousState) => {
        return { ...previousState, search: e.target.value, caller: 'search' };
      });
    }
  };

  const searchProducts = (products, search) => {
    if (!search) return products; // prevent showing 0 products when search is null
    const query = search.toLowerCase();
    const filteredProducts = products.filter(
      (p) =>
        p.author?.toLowerCase().includes(query) ||
        p.short_description?.toLowerCase().includes(query) ||
        p.name?.toLowerCase().includes(query),
    );
    return filteredProducts;
  };

  const setCategoryFilter = (category) => {
    const newHiddenCategories = filterParams.hiddenCategories.includes(category)
      ? filterParams.hiddenCategories.filter((c) => c !== category)
      : [...filterParams.hiddenCategories, category];
    newHiddenCategories.sort((a, b) => a - b); // sorts array numerically
    setFilterParams((previousState) => {
      return { ...previousState, hiddenCategories: newHiddenCategories, caller: 'category' };
    });
  };

  const toggleFilter = () => {
    setToggleFilter(!showFilter);
  };

  const getCleanName = (name) => {
    if (name.includes('&amp;')) {
      return name.replace('&amp;', '&');
    }
    return name;
  };

  const getUniqueCategories = (products) => {
    const uniqueCategories = [];

    products.forEach((product) => {
      product.categories?.forEach((category) => {
        if (category.id !== 27) {
          // skipping parent category "App"
          const index = uniqueCategories.findIndex((c) => c.id === category.id);
          if (index > -1) {
            // category already existent
            uniqueCategories[index].count++;
          } else {
            // new category found
            uniqueCategories.push({
              id: category.id,
              name: getCleanName(category.name),
              count: 1,
            });
          }
        }
      });
    });

    uniqueCategories.sort((a, b) => (a.name < b.name ? -1 : 1)); // sorts categories alphabetically
    return uniqueCategories;
  };

  const isCategoryHidden = (productCategories) => {
    const productCategory = productCategories?.filter((p) => p.id !== 27); // removes the "App" category (id 27)
    const categoryId = productCategory?.map((p) => p.id)[0];
    return filterParams.hiddenCategories.includes(categoryId);
  };

  React.useEffect(() => {
    // filters were updated
    getFinalCategories();
    getFinalProducts();
  }, [filteredByAvailability, filteredByCategories, filteredBySearch]);

  React.useEffect(() => {
    // isSearchEnabled changed
    setFilterParams((previousState) => {
      return { ...previousState, caller: 'isSearchEnabled' };
    });
  }, [isSearchEnabled]);

  return (
    <FilterContext.Provider
      value={{
        categories,
        filterParams,
        setFilterParams,
        getFilteredProducts,
        setAvailableFilter,
        setCategoryFilter,
        setSearchFilter,
        isSearchEnabled,
        setIsSearchEnabled,
        toggleFilter,
        showFilter,
        finalProducts,
      }}
    >
      {props.children}
    </FilterContext.Provider>
  );
};

const useFilterContext = () => {
  return React.useContext(FilterContext);
};

export { FilterContext, FilterContextProvider, useFilterContext };

FilterContextProvider.propTypes = {
  children: PropTypes.any,
};
