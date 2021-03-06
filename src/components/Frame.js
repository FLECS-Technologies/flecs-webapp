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

import React from 'react'
import PropTypes from 'prop-types'
import Box from '@mui/material/Box'
import Layout from './Layout'
import AppBar from './AppBar'
import Drawer from './Drawer'

const Frame = ({ children }) => {
  return (
    <Layout>
      <Box sx={{ display: 'flex' }}>
        <AppBar/>
        <Drawer/>
        <Box component="main" sx={{ flexGrow: 1, p: 1 }}>
            {children}
        </Box>
      </Box>
    </Layout>
  )
}

Frame.propTypes = {
  children: PropTypes.any
}

export default Frame
