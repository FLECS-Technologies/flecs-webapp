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
import styled from 'styled-components'
import { useSearchParams } from 'react-router-dom'

const Header = styled.div`
  display: 'flex';
  alignitems: 'center';
  justifycontent: 'flex-end';
  padding: 32px 32px;
`

const Frame = ({ children }) => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [appBarIsVisible, setAppBarIsVisible] = React.useState(true)

  React.useEffect(() => {
    isAppBarVisible()
  }, [])

  const isAppBarVisible = () => {
    const hideAppBar = searchParams.get('hideAppBar')
    if (hideAppBar === 'true') {
      setAppBarIsVisible(false) // Hide when hideAppBar is explicitly 'true'
    } else {
      setAppBarIsVisible(true) // Show otherwise (including when hideAppBar is null or undefined)
    }
  }

  return (
    <Layout>
      <Box sx={{ display: 'flex' }}>
        <AppBar />
        <Drawer />
        <Box component='main' sx={{ flexGrow: 1, p: 1 }}>
          {appBarIsVisible && <Header aria-label='Header-Placeholder' />}
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
