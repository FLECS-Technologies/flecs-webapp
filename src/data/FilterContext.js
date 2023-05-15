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
  const [hiddenCategories, setHiddenCategories] = useStateWithLocalStorage('hidden-categories', [])
  const [hiddenCategoriesHasUpdated, setHiddenCategoriesHasUpdated] = useState(false)

  function handleSetHiddenCategories (category) {
    const newHiddenCategories = hiddenCategories.includes(category) ? hiddenCategories.filter(c => c !== category) : [...hiddenCategories, category]
    newHiddenCategories.sort((a, b) => (a - b)) // sorts array numerically
    setHiddenCategoriesHasUpdated(true)
    setHiddenCategories(newHiddenCategories)
  }

  const getCleanName = (name) => {
    if (name.includes('&amp;')) { return name.replace('&amp;', '&') }
    return name
  }

  const getUniqueCategories = (loadedProducts) => {
    const categoriesArray = []
    const productCategories = loadedProducts.map(p => p.categories)
    for (let i = 0; i < productCategories.length; i++) {
      const index = categoriesArray.findIndex(c => c.id === productCategories[i][1].id) // skipping [i][0] as this is the parent category "App"
      if (index > -1) { // category already existent
        categoriesArray[index].count++
      } else { // new category found
        categoriesArray.push({
          id: productCategories[i][1].id,
          name: getCleanName(productCategories[i][1].name),
          count: 1
        })
      }
    }
    categoriesArray.sort((a, b) => a.name < b.name ? -1 : 1) // sorts categories alphabetically
    setCategories(categoriesArray)
  }

  const isCategoryHidden = (productCategories) => {
    const productCategory = productCategories?.filter(p => p.id !== 27) // removes the "App" category (id 27)
    const categoryId = productCategory?.map(p => p.id)[0]
    return hiddenCategories.includes(categoryId)
  }

  return (
    <FilterContext.Provider value={{ categories, hiddenCategories, hiddenCategoriesHasUpdated, setHiddenCategoriesHasUpdated, handleSetHiddenCategories, getUniqueCategories, isCategoryHidden }}>
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