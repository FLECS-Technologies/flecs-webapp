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
import { Box, Divider, Paper, ToggleButton, Typography } from '@mui/material'
import PropTypes from 'prop-types'
import React from 'react'

const AppFilter = (props) => {
  const { installed = false, setInstalled /*, setCategories */ } = props
  function setInstalledFilter () {
    setInstalled()
  }

  return (
    <Paper>
        <Box sx={{ margin: 1, padding: 1 }}>
          <Typography sx={{ flex: '0.1 0.1 10%' }} variant='h6'>Filter</Typography>
          <Divider/>
          <Box sx={{ mt: 1 }}>
            <ToggleButton data-testid="installable-filter" value="installable" color="primary" selected={installed} onChange={setInstalledFilter}>
              {installed ? <Clear/> : <Check/>}Show installable apps only
            </ToggleButton>
          </Box>
        </Box>
    </Paper>
  )
}

AppFilter.propTypes = {
  installed: PropTypes.bool,
  setInstalled: PropTypes.func,
  setCategories: PropTypes.func
}

export { AppFilter }
