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
import { Check, Clear } from '@mui/icons-material'
import { Box, Button, Divider, Paper, ToggleButton, Typography } from '@mui/material'
import PropTypes from 'prop-types'
import React from 'react'

const AppFilter = (props) => {
  const { availableFilter, setAvailableFilter, handleSetHiddenCategories /*, setCategories */ } = props
  return (
    <Paper>
        <Box sx={{ margin: 1, padding: 1 }}>
          <Typography sx={{ flex: '0.1 0.1 10%' }} variant='h6'>Filter</Typography>
          <Divider/>
          <Box sx={{ mt: 1 }}>
            <ToggleButton data-testid="available-filter" value="available" color="primary" selected={availableFilter} onChange={() => setAvailableFilter()}>
              {availableFilter ? <Clear/> : <Check/>}Show available apps only
            </ToggleButton>
          </Box>
          <Button variant='contained' onClick={() => handleSetHiddenCategories(28)}>Communication</Button>
          <Button variant='contained' onClick={() => handleSetHiddenCategories(29)}>Control</Button>
          <Button variant='contained' onClick={() => handleSetHiddenCategories(30)}>Data Analysis</Button>
          <Button variant='contained' onClick={() => handleSetHiddenCategories(31)}>Motion</Button>
          <Button variant='contained' onClick={() => handleSetHiddenCategories(32)}>Fleet Management</Button>
          <Button variant='contained' onClick={() => handleSetHiddenCategories(33)}>Visu & SCADA</Button>
          <Button variant='contained' onClick={() => handleSetHiddenCategories(34)}>System</Button>
        </Box>
    </Paper>
  )
}

AppFilter.propTypes = {
  availableFilter: PropTypes.bool,
  setAvailableFilter: PropTypes.func,
  handleSetHiddenCategories: PropTypes.func,
  setCategories: PropTypes.func // TODO: remove
}

export { AppFilter }
