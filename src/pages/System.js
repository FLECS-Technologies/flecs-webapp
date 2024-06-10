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
import styled from 'styled-components'
import {
  BottomNavigation,
  Box,
  Divider,
  Paper,
  Toolbar,
  Typography
} from '@mui/material'
import { Link } from 'react-router-dom'
import Version from '../components/Version'
import DeviceActivation from '../components/device/DeviceActivation'
import LicenseInfo from '../components/device/license/LicenseInfo'

const Header = styled.div`
  display: 'flex';
  alignitems: 'center';
  justifycontent: 'flex-end';
  padding: 32px 32px;
`

const System = () => {
  const data = (
    <Paper aria-label='system-page' className='box'>
      <Toolbar
        sx={{
          pl: { sm: 2 },
          pr: { xs: 1, sm: 1 }
        }}
      >
        <Typography sx={{ flex: '0.1 0.1 10%' }} variant='h6'>
          System
        </Typography>
      </Toolbar>
      <Divider />
      <Box
        sx={{
          width: '100%',
          p: { xs: 1, sm: 2 }
        }}
      >
        <Typography variant='body'>
          You are currently running FLECS on {window.location.hostname}.
        </Typography>
        <Version></Version>
      </Box>
      <Divider />
      <Box
        sx={{
          width: '100%',
          p: { xs: 1, sm: 2 }
        }}
      >
        <LicenseInfo />
        <DeviceActivation variant='line' />
      </Box>
    </Paper>
  )
  return (
    <div>
      <Header />
      {data}
      <Paper
        sx={{ position: 'fixed', bottom: 0, left: 0, right: 0 }}
        elevation={3}
      >
        <BottomNavigation>
          <Toolbar sx={{ p: { xs: 1, sm: 2 } }}>
            <Link aria-label='open-source' to='/open-source'>
              Open-Source
            </Link>
          </Toolbar>
        </BottomNavigation>
      </Paper>
    </div>
  )
}

export default System
