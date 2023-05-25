/*
 * Copyright (c) 2022 FLECS Technologies GmbH
 *
 * Created on Thu Jan 27 2022
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
import { Box, Button, Divider, Paper, Typography } from '@mui/material'
import PropTypes from 'prop-types'
import React from 'react'
import CancelIcon from '@mui/icons-material/Cancel'
import AddCircleOutlineOutlinedIcon from '@mui/icons-material/AddCircleOutlineOutlined'

const AppFilter = (props) => {
  const { availableFilter, setAvailableFilter, setCategoryFilter, categories, hiddenCategories, search, isSearchEnabled, setIsSearchEnabled } = props

  return (
    <Paper>
      <Box sx={{ margin: 1, padding: 1 }}>
        <Box sx={{ mb: 1 }}>
          <Typography sx={{ flex: '0.1 0.1 10%' }} variant='h6'>Filter by availability</Typography>
          <Divider/>
          <Button size='small' data-testid="available-filter" style={{ margin: '11px 3px 3px 3px' }} color={availableFilter ? 'primary' : 'inherit'} variant={availableFilter ? 'contained' : 'outlined'} onClick={() => setAvailableFilter()} endIcon={availableFilter ? <CancelIcon /> : <AddCircleOutlineOutlinedIcon />}>Show available apps only</Button>
        </Box>
        {search &&
        <Box sx={{ mt: 2, mb: 1 }}>
          <Typography sx={{ flex: '0.1 0.1 10%' }} variant='h6'>Filter by search</Typography>
          <Divider sx={{ mb: 1 }}/>
          <Button size='small' data-testid="search-filter" style={{ margin: '3px' }} color={!isSearchEnabled ? 'inherit' : 'primary'} variant={!isSearchEnabled ? 'outlined' : 'contained'} endIcon={!isSearchEnabled ? <AddCircleOutlineOutlinedIcon /> : <CancelIcon />} onClick={() => setIsSearchEnabled(!isSearchEnabled)}>{search}</Button>
        </Box>
        }
        <Box sx={{ mt: 2, mb: 1 }}>
          <Typography sx={{ flex: '0.1 0.1 10%' }} variant='h6'>Filter by category</Typography>
          <Divider sx={{ mb: 1 }}/>
          {categories?.map(c => <Button size='small' data-testid="category-filter" style={{ margin: '3px' }} color={hiddenCategories.includes(c.id) ? 'inherit' : 'primary'} variant={hiddenCategories.includes(c.id) ? 'outlined' : 'contained'} endIcon={hiddenCategories.includes(c.id) ? <AddCircleOutlineOutlinedIcon /> : <CancelIcon />} key={c.id} onClick={() => setCategoryFilter(c.id)}>{c.name} ({c.count})</Button>)}
        </Box>
      </Box>
    </Paper>
  )
}

AppFilter.propTypes = {
  availableFilter: PropTypes.bool,
  setAvailableFilter: PropTypes.func,
  setCategoryFilter: PropTypes.func,
  categories: PropTypes.array,
  hiddenCategories: PropTypes.array,
  search: PropTypes.string,
  isSearchEnabled: PropTypes.bool,
  setIsSearchEnabled: PropTypes.func
}

export { AppFilter }
