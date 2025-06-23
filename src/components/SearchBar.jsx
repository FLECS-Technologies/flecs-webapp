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

import React from 'react'
import PropTypes from 'prop-types'
import { Paper, Button, Autocomplete, TextField } from '@mui/material'
import { FilterList, Search } from '@mui/icons-material'

const SearchBar = (props) => {
  const { defaultSearchValue, searchTitle, setToggleFilter, search } = props

  return (
    <Paper data-testid='search-bar' component="form" sx={{ p: '2px 4px', display: 'flex', alignItems: 'center' }}>
        {setToggleFilter && <Button color="inherit" onClick={setToggleFilter} sx={{ p: '10px', pt: '7px' }} aria-label="filter" startIcon={<FilterList />}>Filter
        </Button>}
        <Search aria-label='search-icon' sx={{ ml: 1, width: 20 }} />
        <Autocomplete
            sx={{ ml: 1, flex: 1 }}
            freeSolo
            clearOnEscape
            aria-label="autocomplete"
            onInputChange={search}
            options={[]}
            value={defaultSearchValue || null}
            renderInput={(params) => (
                <TextField
                    {...params}
                    sx={{ p: '0px' }}
                    aria-label='search-field'
                    data-testid='search-field'
                    autoFocus={true}
                    variant='standard'
                    placeholder={searchTitle}
                    onKeyPress={(e) => { e.key === 'Enter' && e.preventDefault() }}
                    InputProps={{
                      ...params.InputProps,
                      disableUnderline: true
                    }}
                />
            )}
        />
    </Paper>
  )
}

SearchBar.propTypes = {
  defaultSearchValue: PropTypes.string,
  setToggleFilter: PropTypes.func,
  searchTitle: PropTypes.string,
  search: PropTypes.func
}
export default SearchBar
