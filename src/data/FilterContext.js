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

import React, { createContext, useState } from 'react'
import PropTypes from 'prop-types'
import useStateWithLocalStorage from '../components/LocalStorage'

const FilterContext = createContext([])

function FilterContextProvider (props) {
  const [categories, setCategories] = useState([])
  const [queryParams, setQueryParams] = useStateWithLocalStorage('marketplace-query', {
    page: undefined,
    per_page: undefined,
    search: undefined,
    order: undefined,
    orderby: undefined,
    status: undefined,
    stock_status: undefined,
    available: false,
    hiddenCategories: [],
    caller: undefined
  })
  const [filteredByAvailability, setFilteredByAvailability] = useState([])
  const [filteredByCategories, setFilteredByCategories] = useState([])
  const [filteredBySearch, setFilteredBySearch] = useState([])
  const [finalProducts, setFinalProducts] = useState([])
  const [showFilter, setToggleFilter] = useStateWithLocalStorage('marketplace-filter', false)

  const getFilteredProducts = (loadedProducts) => {
    if (loadedProducts.length > 0) {
      if (queryParams.caller === 'availability' || queryParams.caller === 'loadProducts') {
        console.log(`${queryParams.caller} called setFilteredByAvailability`)
        const filteredByAvailability = queryParams.available ? loadedProducts.filter(p => p.stock_status === 'instock') : loadedProducts
        setFilteredByAvailability(filteredByAvailability)
        console.log({ filteredByAvailability })
      }

      if (queryParams.caller === 'category' || queryParams.caller === 'loadProducts') {
        console.log(`${queryParams.caller} called setFilteredByCategories`)
        const filteredByCategories = queryParams.hiddenCategories.length > 0 ? loadedProducts.filter(p => !isCategoryHidden(p.categories)) : loadedProducts
        setFilteredByCategories(filteredByCategories)
        console.log({ filteredByCategories })
      }

      if (queryParams.caller === 'search' || queryParams.caller === 'loadProducts') {
        console.log(`${queryParams.caller} called setFilteredBySearch`)
        const filteredBySearch = queryParams.search ? searchProducts(loadedProducts, queryParams.search) : loadedProducts
        setFilteredBySearch(filteredBySearch)
        console.log({ filteredBySearch })
      }
    }
  }

  const getFinalCategories = () => {
    const finalCategories = getIntersection(filteredByAvailability, filteredBySearch)
    const uniqueCategories = getUniqueCategories(finalCategories)
    setCategories(uniqueCategories)
  }

  const getFinalProducts = () => {
    const finalProducts = getIntersection(filteredByAvailability, filteredByCategories, filteredBySearch)
    setFinalProducts(finalProducts)
    console.log({ finalProducts })
  }

  const getIntersection = (...arrays) => {
    if (arrays.length === 3) {
      const commonItems = arrays[0].reduce((result, currentItem) => {
        if (arrays[1].find(p => p.id === currentItem.id) &&
              arrays[2].find(p => p.id === currentItem.id)) {
          result.push(currentItem)
        }
        return result
      }, [])

      return commonItems
    } else if (arrays.length === 2) {
      return arrays.reduce((commonItems, currentArray) => {
        return commonItems.filter(p => currentArray.some(currentItem => currentItem.id === p.id))
      })
    }
  }

  function setAvailableFilter () {
    setQueryParams(previousState => {
      return { ...previousState, available: !queryParams.available, caller: 'availability' }
    })
  }

  function setSearchFilter (event, reason) {
    setQueryParams(previousState => {
      return { ...previousState, search: reason, caller: 'search' }
    })
  }

  const searchProducts = (products, search) => {
    if (!search) return products // prevent showing 0 products when search is null
    const query = search.toLowerCase()
    const filteredProducts = products.filter(p => p.author?.toLowerCase().includes(query) || p.short_description?.toLowerCase().includes(query) || p.title?.toLowerCase().includes(query))
    return filteredProducts
  }

  const setCategoryFilter = (category) => {
    const newHiddenCategories = queryParams.hiddenCategories.includes(category) ? queryParams.hiddenCategories.filter(c => c !== category) : [...queryParams.hiddenCategories, category]
    newHiddenCategories.sort((a, b) => (a - b)) // sorts array numerically
    setQueryParams(previousState => {
      return { ...previousState, hiddenCategories: newHiddenCategories, caller: 'category' }
    })
  }

  function toggleFilter () {
    setToggleFilter(!showFilter)
  }

  const getCleanName = (name) => {
    if (name.includes('&amp;')) { return name.replace('&amp;', '&') }
    return name
  }

  const getUniqueCategories = (products) => {
    const uniqueCategories = []

    products.forEach(product => {
      product.categories?.forEach(category => {
        if (category.id !== 27) { // skipping parent category "App"
          const index = uniqueCategories.findIndex(c => c.id === category.id)
          if (index > -1) { // category already existent
            uniqueCategories[index].count++
          } else { // new category found
            uniqueCategories.push({
              id: category.id,
              name: getCleanName(category.name),
              count: 1
            })
          }
        }
      })
    })

    uniqueCategories.sort((a, b) => a.name < b.name ? -1 : 1) // sorts categories alphabetically
    return uniqueCategories
  }

  const isCategoryHidden = (productCategories) => {
    const productCategory = productCategories?.filter(p => p.id !== 27) // removes the "App" category (id 27)
    const categoryId = productCategory?.map(p => p.id)[0]
    return queryParams.hiddenCategories.includes(categoryId)
  }

  React.useEffect(() => {
    getFinalCategories()
    getFinalProducts()
  }, [filteredByAvailability, filteredByCategories, filteredBySearch])

  return (
    <FilterContext.Provider value={{ categories, queryParams, setQueryParams, getFilteredProducts, setAvailableFilter, setCategoryFilter, setSearchFilter, toggleFilter, showFilter, finalProducts }}>
      {props.children}
    </FilterContext.Provider>
  )
}

function useFilterContext () {
  return React.useContext(FilterContext)
}

export { FilterContext, FilterContextProvider, useFilterContext }

FilterContextProvider.propTypes = {
  children: PropTypes.any
}
