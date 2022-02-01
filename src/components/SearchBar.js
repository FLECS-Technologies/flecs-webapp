/*
 * Copyright (c) 2021 FLECS Technologies GmbH
 *
 * Created on Thu Dec 30 2021
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

import React, { useRef } from 'react'
import PropTypes from 'prop-types'
import { Paper, IconButton, Divider, Autocomplete, TextField } from '@mui/material'
import { FilterList, Clear, Search } from '@mui/icons-material'

const SearchBar = (props) => {
  const { defaultSearchValue, setSearch, searchTitle, searchAutocomplete, setToggleFilter } = props
  const valueRef = useRef('') // creating a refernce for TextField Component

  function search (event, reason) {
    // this happens if the user types anything into the search field
    setSearch(valueRef.current.value)
  }

  function onClose (event, reason) {
    // this happens if the user clicks on one of the autocomplete options
    if (event.keyCode !== 13 && reason && reason === 'selectOption') {
      setSearch(event.currentTarget.textContent)
    } else {
      // prevent re-render
      event.preventDefault()
    }
  }

  function onChange (event, reason) {
    // this happens if the user selects one of the autocomplete options and confirms with ENTER
    if (event.keyCode === 13 && reason) {
      setSearch(reason)
    }
  }

  function clearSearch () {
    valueRef.current.value = null
    setSearch('')
  }

  return (
    <Paper data-testid='search-bar' component="form" sx={{ p: '2px 4px', display: 'flex', alignItems: 'center' }}>
        {setToggleFilter && <IconButton onClick={setToggleFilter} sx={{ p: '10px' }} aria-label="filter">
            <FilterList />
        </IconButton>}
        <Search aria-label='search-icon' sx={{ ml: 1 }} />
        <Autocomplete
            sx={{ ml: 1, flex: 1 }}
            freeSolo
            aria-label="autocomplete"
            disableClearable={true}
            onInputChange={search}
            onChange={onChange}
            onClose={onClose}
            options={searchAutocomplete || []}
            renderInput={(params) => (
                <TextField
                    {...params}
                    aria-label='search-field'
                    data-testid='search-field'
                    autoFocus={true}
                    inputRef={valueRef} // connecting inputRef property of TextField to the valueRef
                    variant='standard'
                    placeholder={searchTitle}
                    onKeyPress={(e) => { e.key === 'Enter' && e.preventDefault() }}
                    InputProps={{
                      ...params.InputProps,
                      disableUnderline: true,
                      value: { defaultSearchValue }
                    }}
                />
            )}
        />
      <Divider sx={{ height: 28, m: 0.5 }} orientation="vertical" />
      <IconButton sx={{ p: '10px' }} aria-label="clear-all" onClick={clearSearch}>
        <Clear />
      </IconButton>
    </Paper>
  )
}

SearchBar.propTypes = {
  defaultSearchValue: PropTypes.string,
  setSearch: PropTypes.func,
  setToggleFilter: PropTypes.func,
  searchTitle: PropTypes.string,
  searchAutocomplete: PropTypes.array
}
export default SearchBar
